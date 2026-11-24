import { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Check,
  Copy,
  DollarSign,
  GitCommit,
  Pencil,
  Plus,
  Sparkles,
  TrendingUp,
  Users,
  XCircle,
  Zap,
} from 'lucide-react';
import type { LiveEvent, Project, ProjectVerdict, Timeframe } from '../types';
import { computeProjectVerdict, formatRelativeTime } from '../lib/verdictEngine';

export const VERDICT_BADGE: Record<
  ProjectVerdict,
  { label: string; className: string; dotClass: string }
> = {
  SCALE: {
    label: 'Scale',
    className: 'bg-black text-white border-black',
    dotClass: 'bg-white',
  },
  OPTIMIZE: {
    label: 'Fix Funnel',
    className: 'bg-neutral-100 text-black border-neutral-300',
    dotClass: 'bg-neutral-700',
  },
  KILL_OR_PIVOT: {
    label: 'Kill / Pivot',
    className: 'bg-white text-neutral-600 border-neutral-300 border-dashed',
    dotClass: 'bg-neutral-400',
  },
};

interface OverviewViewProps {
  projects: Project[];
  events: LiveEvent[];
  timeframe: Timeframe;
  selectedId: string;
  onSelectId: (id: string) => void;
  onEditProject: (project: Project) => void;
  onOpenAddProject: () => void;
  onOpenLogEvent: (projectId?: string) => void;
  onQuickRevenue: (project: Project, amount: number) => void;
}

export function OverviewView({
  projects,
  events,
  timeframe,
  selectedId,
  onSelectId,
  onEditProject,
  onOpenAddProject,
  onOpenLogEvent,
  onQuickRevenue,
}: OverviewViewProps) {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedId) ?? null,
    [projects, selectedId]
  );

  const aggregated = useMemo(() => {
    const list = selectedProject ? [selectedProject] : projects;
    if (list.length === 0) {
      return {
        visitors: 0,
        signups: 0,
        trials: 0,
        paid: 0,
        mrr: 0,
        conversion: '0.00',
        avgChurn: '0.0%',
        series: [] as { label: string; revenue: number; visitors: number }[],
      };
    }

    let visitors = 0;
    let signups = 0;
    let trials = 0;
    let paid = 0;
    let mrr = 0;
    let churnSum = 0;
    let churnCount = 0;

    for (const p of list) {
      const m = p.metrics[timeframe];
      visitors += m.visitors;
      signups += m.signups;
      trials += m.trials;
      paid += m.paid;
      mrr += m.mrr;
      const c = parseFloat(m.churnRate.replace('%', ''));
      if (!Number.isNaN(c) && m.mrr > 0) {
        churnSum += c;
        churnCount += 1;
      }
    }

    const baseSeries = list[0].metrics[timeframe].dailyRevenue;
    const series = baseSeries.map((pt, idx) => ({
      label: pt.label,
      revenue: list.reduce(
        (acc, p) => acc + (p.metrics[timeframe].dailyRevenue[idx]?.revenue ?? 0),
        0
      ),
      visitors: list.reduce(
        (acc, p) => acc + (p.metrics[timeframe].dailyRevenue[idx]?.visitors ?? 0),
        0
      ),
    }));

    const conversion = visitors > 0 ? ((paid / visitors) * 100).toFixed(2) : '0.00';
    const avgChurn = churnCount > 0 ? `${(churnSum / churnCount).toFixed(1)}%` : '0.0%';

    return { visitors, signups, trials, paid, mrr, conversion, avgChurn, series };
  }, [projects, selectedProject, timeframe]);

  const maxRev = Math.max(...aggregated.series.map((d) => d.revenue), 1);

  const focusProject = useMemo(() => {
    if (selectedProject) return selectedProject;
    const optimizeApp = projects.find(
      (p) => computeProjectVerdict(p, timeframe).status === 'OPTIMIZE'
    );
    return optimizeApp ?? projects[0] ?? null;
  }, [projects, selectedProject, timeframe]);

  const focusVerdict = useMemo(
    () => (focusProject ? computeProjectVerdict(focusProject, timeframe) : null),
    [focusProject, timeframe]
  );

  const filteredEvents = useMemo(() => {
    const list = selectedProject
      ? events.filter((e) => e.projectId === selectedProject.id)
      : events;
    return list.slice(0, 6);
  }, [events, selectedProject]);

  const handleCopyFix = () => {
    if (!focusVerdict) return;
    navigator.clipboard?.writeText(focusVerdict.fixPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 1800);
  };

  if (projects.length === 0) {
    return (
      <div className="luma-card mx-auto mt-10 max-w-lg rounded-3xl p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-black">
          <Sparkles className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-xl font-semibold tracking-tight text-black">
          No apps connected yet
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
          Add your first shipped app to track visitors, signups, Stripe MRR, and get live
          Kill / Scale verdicts.
        </p>
        <button
          type="button"
          onClick={onOpenAddProject}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          <Plus className="h-4 w-4" />
          Add Your First App
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Scope Pill Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => onSelectId('all')}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              selectedId === 'all'
                ? 'bg-black text-white shadow-xs'
                : 'bg-white text-neutral-600 ring-1 ring-black/10 hover:text-black'
            }`}
          >
            All Apps ({projects.length})
          </button>
          {projects.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectId(p.id)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                selectedId === p.id
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-white text-neutral-600 ring-1 ring-black/10 hover:text-black'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {selectedProject && (
            <button
              type="button"
              onClick={() => onEditProject(selectedProject)}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-black ring-1 ring-black/12 transition hover:bg-neutral-100"
            >
              <Pencil className="h-3 w-3 text-neutral-500" />
              Edit {selectedProject.name}
            </button>
          )}
          <button
            type="button"
            onClick={() => onOpenLogEvent(selectedProject?.id)}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-black ring-1 ring-black/12 transition hover:bg-neutral-100"
          >
            <Zap className="h-3.5 w-3.5 text-black" />
            Log Event
          </button>
        </div>
      </div>

      {/* Main 12-Col Workspace Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left 8 Cols: KPIs + Chart + Funnel + Table */}
        <div className="space-y-6 lg:col-span-8">
          {/* KPI Strip */}
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
            <div className="luma-card rounded-2xl p-4">
              <div className="flex items-center justify-between text-xs font-medium text-neutral-500">
                <span>Total MRR</span>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-black">
                  <DollarSign className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="mt-2.5 font-mono text-2xl font-semibold tracking-tight text-black tabular-nums">
                ${aggregated.mrr.toLocaleString()}
              </div>
              <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-black">
                <TrendingUp className="h-3 w-3" />
                {selectedProject ? selectedProject.metrics[timeframe].mrrDelta : '+38.4%'} vs prev
              </div>
            </div>

            <div className="luma-card rounded-2xl p-4">
              <div className="flex items-center justify-between text-xs font-medium text-neutral-500">
                <span>Visitors</span>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-black">
                  <Users className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="mt-2.5 font-mono text-2xl font-semibold tracking-tight text-black tabular-nums">
                {aggregated.visitors.toLocaleString()}
              </div>
              <div className="mt-1 text-[11px] text-neutral-500">
                {aggregated.signups.toLocaleString()} signups
              </div>
            </div>

            <div className="luma-card rounded-2xl p-4">
              <div className="flex items-center justify-between text-xs font-medium text-neutral-500">
                <span>Paid Users</span>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-black">
                  <Activity className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="mt-2.5 font-mono text-2xl font-semibold tracking-tight text-black tabular-nums">
                {aggregated.paid.toLocaleString()}
              </div>
              <div className="mt-1 text-[11px] font-medium text-neutral-700">
                {aggregated.conversion}% visit → paid
              </div>
            </div>

            <div className="luma-card rounded-2xl p-4">
              <div className="flex items-center justify-between text-xs font-medium text-neutral-500">
                <span>Monthly Churn</span>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-black">
                  <AlertTriangle className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="mt-2.5 font-mono text-2xl font-semibold tracking-tight text-black tabular-nums">
                {selectedProject
                  ? selectedProject.metrics[timeframe].churnRate
                  : aggregated.avgChurn}
              </div>
              <div className="mt-1 text-[11px] text-neutral-500">Active window ({timeframe})</div>
            </div>
          </div>

          {/* Chart + Funnel */}
          <div className="grid gap-5 sm:grid-cols-5">
            {/* Revenue Bar Chart */}
            <div className="luma-card rounded-2xl p-5 sm:col-span-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-black">
                    Revenue Trajectory ({timeframe})
                  </div>
                  <div className="text-xs text-neutral-500">
                    Hover bars to inspect revenue vs visitors
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-black/15 bg-neutral-50 px-2.5 py-0.5 text-[11px] font-medium text-black">
                  <span className="h-1.5 w-1.5 rounded-full bg-black animate-pulse-dot" />
                  Live
                </span>
              </div>

              <div className="mt-6 flex h-40 items-end gap-2.5">
                {aggregated.series.map((bar, idx) => {
                  const heightPct =
                    bar.revenue === 0
                      ? 6
                      : Math.max(14, Math.round((bar.revenue / maxRev) * 100));
                  const isHovered = hoveredBar === idx;
                  return (
                    <div
                      key={bar.label}
                      onMouseEnter={() => setHoveredBar(idx)}
                      onMouseLeave={() => setHoveredBar(null)}
                      className="group relative flex h-full flex-1 flex-col items-center justify-end gap-2"
                    >
                      {isHovered && (
                        <div className="pointer-events-none absolute -top-11 z-10 whitespace-nowrap rounded-xl border border-black/15 bg-black px-2.5 py-1.5 font-mono text-[11px] text-white shadow-lg">
                          <span className="font-semibold">${bar.revenue.toLocaleString()}</span> ·{' '}
                          {bar.visitors.toLocaleString()} vis
                        </div>
                      )}
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full rounded-t-lg transition-all duration-300 ${
                          bar.revenue === 0
                            ? 'bg-neutral-200 group-hover:bg-neutral-300'
                            : isHovered
                              ? 'bg-black'
                              : 'bg-neutral-800'
                        }`}
                      />
                      <span className="font-mono text-[10px] font-medium text-neutral-500">
                        {bar.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Funnel Breakdown */}
            <div className="luma-card rounded-2xl p-5 sm:col-span-2">
              <div className="text-sm font-semibold text-black">Conversion Funnel</div>
              <div className="text-xs text-neutral-500">Visitors to Stripe Paid</div>

              <div className="mt-5 space-y-3.5">
                {[
                  {
                    label: 'Visitors',
                    val: aggregated.visitors,
                    pct: aggregated.visitors > 0 ? 100 : 0,
                    color: 'bg-black',
                  },
                  {
                    label: 'Signups',
                    val: aggregated.signups,
                    pct: Math.round(
                      (aggregated.signups / Math.max(aggregated.visitors, 1)) * 100
                    ),
                    color: 'bg-neutral-700',
                  },
                  {
                    label: 'Trials / Active',
                    val: aggregated.trials,
                    pct: Math.round(
                      (aggregated.trials / Math.max(aggregated.visitors, 1)) * 100
                    ),
                    color: 'bg-neutral-500',
                  },
                  {
                    label: 'Paid Users',
                    val: aggregated.paid,
                    pct: Math.max(
                      aggregated.paid > 0 ? 4 : 0,
                      Math.round((aggregated.paid / Math.max(aggregated.visitors, 1)) * 100)
                    ),
                    color: 'bg-black',
                  },
                ].map((step) => (
                  <div key={step.label}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-neutral-600">{step.label}</span>
                      <span className="font-mono text-black tabular-nums">
                        {step.val.toLocaleString()}{' '}
                        <span className="text-neutral-400">({step.pct}%)</span>
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-neutral-200/80">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${step.color}`}
                        style={{ width: `${Math.min(100, step.pct)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Portfolio Table */}
          <div className="luma-card overflow-hidden rounded-2xl">
            <div className="flex items-center justify-between border-b border-black/8 px-5 py-3.5">
              <div>
                <h3 className="text-sm font-semibold text-black">Shipped Portfolio</h3>
                <p className="text-xs text-neutral-500">
                  Click a row to filter · Log a test charge with +$29
                </p>
              </div>
              <span className="rounded-full bg-neutral-100 px-2.5 py-1 font-mono text-[11px] font-medium text-neutral-600">
                {projects.length} {projects.length === 1 ? 'app' : 'apps'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-black/8 bg-neutral-50 text-[11px] font-medium text-neutral-500">
                  <tr>
                    <th className="px-5 py-2.5">Project</th>
                    <th className="px-3 py-2.5">Visitors</th>
                    <th className="px-3 py-2.5">Signups</th>
                    <th className="px-3 py-2.5">MRR</th>
                    <th className="px-3 py-2.5">Verdict</th>
                    <th className="px-5 py-2.5 text-right">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/6">
                  {projects.map((project) => {
                    const m = project.metrics[timeframe];
                    const verdict = computeProjectVerdict(project, timeframe);
                    const badge = VERDICT_BADGE[verdict.status];
                    const isSelected = selectedId === project.id;
                    return (
                      <tr
                        key={project.id}
                        onClick={() =>
                          onSelectId(selectedId === project.id ? 'all' : project.id)
                        }
                        className={`cursor-pointer transition ${
                          isSelected ? 'bg-neutral-100' : 'hover:bg-neutral-50'
                        }`}
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-black">{project.name}</span>
                            <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-neutral-600">
                              {project.builtWith}
                            </span>
                          </div>
                          <div className="mt-0.5 font-mono text-[11px] text-neutral-400">
                            {project.domain} · {project.shippedAgo}
                          </div>
                        </td>
                        <td className="px-3 py-3 font-mono text-neutral-700 tabular-nums">
                          {m.visitors.toLocaleString()}
                        </td>
                        <td className="px-3 py-3 font-mono text-neutral-700 tabular-nums">
                          {m.signups.toLocaleString()}
                        </td>
                        <td className="px-3 py-3 font-mono font-semibold text-black tabular-nums">
                          ${m.mrr.toLocaleString()}
                          <span className="ml-1.5 text-[10px] font-medium text-neutral-500">
                            {m.mrrDelta}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${badge.className}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${badge.dotClass}`} />
                            {badge.label}
                          </span>
                        </td>
                        <td
                          className="px-5 py-3 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => onQuickRevenue(project, 29)}
                              title="Log a $29 Stripe charge"
                              className="rounded-lg border border-black/15 bg-white px-2 py-1 font-mono text-[11px] font-medium text-black transition hover:bg-black hover:text-white"
                            >
                              +$29
                            </button>
                            <button
                              type="button"
                              onClick={() => onEditProject(project)}
                              title="Edit metrics"
                              className="rounded-lg border border-black/12 bg-white p-1.5 text-neutral-600 transition hover:bg-neutral-100 hover:text-black"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Dynamic Verdict + Live Feed */}
        <div className="flex flex-col gap-6 lg:col-span-4">
          {focusProject && focusVerdict && (
            <div className="luma-card rounded-2xl p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-black">
                  <Sparkles className="h-3.5 w-3.5" />
                  Verdict · {focusProject.name}
                </span>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                    VERDICT_BADGE[focusVerdict.status].className
                  }`}
                >
                  {VERDICT_BADGE[focusVerdict.status].label}
                </span>
              </div>

              <h3 className="mt-3 text-base font-semibold tracking-tight text-black">
                {focusVerdict.title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-neutral-600">
                {focusVerdict.body}
              </p>

              <div className="mt-4 rounded-xl border border-black/10 bg-neutral-50 p-3.5">
                <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                  <span>Fix Prompt ({focusProject.builtWith})</span>
                  <button
                    type="button"
                    onClick={handleCopyFix}
                    className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-medium normal-case tracking-normal text-black ring-1 ring-black/12 transition hover:bg-neutral-100"
                  >
                    {copiedPrompt ? (
                      <>
                        <Check className="h-3 w-3 text-black" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" /> Copy
                      </>
                    )}
                  </button>
                </div>
                <p className="mt-2 font-mono text-[11px] leading-relaxed text-neutral-800">
                  "{focusVerdict.fixPrompt}"
                </p>
              </div>
            </div>
          )}

          {/* Live Event Stream */}
          <div className="luma-card flex-1 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-black">Live Activity</h3>
                <p className="text-xs text-neutral-500">Real-time revenue, signups & deploys</p>
              </div>
              <button
                type="button"
                onClick={() => onOpenLogEvent(selectedProject?.id)}
                className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-black ring-1 ring-black/10 transition hover:bg-neutral-200"
              >
                + Record
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              {filteredEvents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-black/15 p-6 text-center text-xs text-neutral-500">
                  No events recorded for this filter yet.
                </div>
              ) : (
                filteredEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-start justify-between gap-2.5 rounded-xl border border-black/8 bg-neutral-50/80 px-3.5 py-2.5"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-black/10">
                        {ev.type === 'revenue' && <DollarSign className="h-3.5 w-3.5 text-black" />}
                        {ev.type === 'dropoff' && (
                          <XCircle className="h-3.5 w-3.5 text-neutral-500" />
                        )}
                        {ev.type === 'deploy' && (
                          <GitCommit className="h-3.5 w-3.5 text-neutral-700" />
                        )}
                        {ev.type === 'signup' && (
                          <ArrowUpRight className="h-3.5 w-3.5 text-neutral-700" />
                        )}
                        {ev.type === 'visitor' && (
                          <Users className="h-3.5 w-3.5 text-neutral-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-semibold text-black">
                            {ev.projectName}
                          </span>
                          <span className="font-mono text-[10px] text-neutral-400">
                            {ev.label}
                          </span>
                        </div>
                        <div
                          className={`truncate font-mono text-[11px] ${
                            ev.type === 'revenue'
                              ? 'font-semibold text-black'
                              : 'text-neutral-600'
                          }`}
                        >
                          {ev.detail}
                        </div>
                      </div>
                    </div>
                    <span className="shrink-0 font-mono text-[10px] text-neutral-400">
                      {formatRelativeTime(ev.createdAt)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
