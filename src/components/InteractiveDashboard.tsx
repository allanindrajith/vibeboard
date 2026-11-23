import { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Check,
  Copy,
  DollarSign,
  GitCommit,
  Sparkles,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react';
import { LIVE_EVENTS, PROJECTS, type ProjectVerdict, type Timeframe } from '../data/mockData';

const STATUS_BADGE: Record<
  ProjectVerdict,
  { label: string; className: string; dotClass: string }
> = {
  SCALE: {
    label: 'SCALE',
    className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    dotClass: 'bg-emerald-400',
  },
  OPTIMIZE: {
    label: 'FIX FUNNEL',
    className: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
    dotClass: 'bg-amber-400',
  },
  KILL_OR_PIVOT: {
    label: 'KILL / PIVOT',
    className: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
    dotClass: 'bg-rose-400',
  },
};

export function InteractiveDashboard() {
  const [timeframe, setTimeframe] = useState<Timeframe>('7D');
  const [selectedId, setSelectedId] = useState<string>('all');
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const selectedProject = useMemo(
    () => PROJECTS.find((p) => p.id === selectedId) ?? null,
    [selectedId]
  );

  const aggregated = useMemo(() => {
    const list = selectedProject ? [selectedProject] : PROJECTS;
    let visitors = 0;
    let signups = 0;
    let trials = 0;
    let paid = 0;
    let mrr = 0;

    for (const p of list) {
      const m = p.metrics[timeframe];
      visitors += m.visitors;
      signups += m.signups;
      trials += m.trials;
      paid += m.paid;
      mrr += m.mrr;
    }

    const baseSeries = list[0].metrics[timeframe].dailyRevenue;
    const series = baseSeries.map((pt, idx) => ({
      label: pt.label,
      revenue: list.reduce((acc, p) => acc + p.metrics[timeframe].dailyRevenue[idx].revenue, 0),
      visitors: list.reduce((acc, p) => acc + p.metrics[timeframe].dailyRevenue[idx].visitors, 0),
    }));

    const conversion = visitors > 0 ? ((paid / visitors) * 100).toFixed(2) : '0.00';
    return { visitors, signups, trials, paid, mrr, conversion, series };
  }, [selectedProject, timeframe]);

  const maxRev = Math.max(...aggregated.series.map((d) => d.revenue), 1);

  const activeVerdict = selectedProject ?? PROJECTS[1]; // Default highlight shows actionable ClipForge leak when on All

  const handleCopyFix = () => {
    navigator.clipboard?.writeText(activeVerdict.fixPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 1800);
  };

  return (
    <div className="relative mx-auto mt-14 max-w-6xl">
      {/* Subtle emerald aura */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-6 -top-10 h-64 rounded-full bg-emerald-500/10 blur-3xl"
      />

      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d10]/95 shadow-2xl shadow-black/60 backdrop-blur">
        {/* Window Chrome */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-zinc-950/80 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
            </div>
            <div className="hidden items-center gap-2 rounded-md border border-white/10 bg-zinc-900/80 px-2.5 py-1 font-mono text-xs text-zinc-400 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
              vibeboard.itsallan.me/portfolio
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Project Filter Pills */}
            <div className="flex items-center rounded-lg border border-white/10 bg-zinc-900/70 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setSelectedId('all')}
                className={`rounded-md px-2.5 py-1 font-medium transition ${
                  selectedId === 'all'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                All Apps (4)
              </button>
              {PROJECTS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedId(p.id)}
                  className={`hidden rounded-md px-2.5 py-1 font-medium transition md:inline-block ${
                    selectedId === p.id
                      ? 'bg-zinc-800 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>

            {/* Timeframe Switcher */}
            <div className="flex items-center rounded-lg border border-white/10 bg-zinc-900/70 p-0.5 font-mono text-xs">
              {(['7D', '30D', '90D'] as Timeframe[]).map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setTimeframe(tf)}
                  className={`rounded-md px-2 py-1 transition ${
                    timeframe === tf
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dashboard Body */}
        <div className="grid gap-5 p-5 lg:grid-cols-12">
          {/* Left 8 Cols: KPIs + Revenue Chart + Project Table */}
          <div className="space-y-5 lg:col-span-8">
            {/* KPI Strip */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-3.5">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Total MRR</span>
                  <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <div className="mt-2 font-mono text-2xl font-semibold tracking-tight text-white">
                  ${aggregated.mrr.toLocaleString()}
                </div>
                <div className="mt-1 flex items-center gap-1 font-mono text-[11px] text-emerald-400">
                  <TrendingUp className="h-3 w-3" />
                  {selectedProject ? selectedProject.metrics[timeframe].mrrDelta : '+38.4%'} vs prev
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-3.5">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Visitors</span>
                  <Users className="h-3.5 w-3.5 text-zinc-400" />
                </div>
                <div className="mt-2 font-mono text-2xl font-semibold tracking-tight text-white">
                  {aggregated.visitors.toLocaleString()}
                </div>
                <div className="mt-1 font-mono text-[11px] text-zinc-500">
                  {aggregated.signups.toLocaleString()} signups
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-3.5">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Paid Users</span>
                  <Activity className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <div className="mt-2 font-mono text-2xl font-semibold tracking-tight text-white">
                  {aggregated.paid.toLocaleString()}
                </div>
                <div className="mt-1 font-mono text-[11px] text-emerald-400">
                  {aggregated.conversion}% visit→paid
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-3.5">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Monthly Churn</span>
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                </div>
                <div className="mt-2 font-mono text-2xl font-semibold tracking-tight text-white">
                  {selectedProject ? selectedProject.metrics[timeframe].churnRate : '2.3%'}
                </div>
                <div className="mt-1 font-mono text-[11px] text-zinc-500">
                  Stripe synced live
                </div>
              </div>
            </div>

            {/* Ship-to-Revenue Chart + Funnel */}
            <div className="grid gap-4 sm:grid-cols-5">
              {/* Bar Chart */}
              <div className="rounded-xl border border-white/10 bg-zinc-900/40 p-4 sm:col-span-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-zinc-300">
                      Stripe Revenue ({timeframe})
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      Hover bars to inspect visitors vs revenue
                    </div>
                  </div>
                  <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-400">
                    LIVE SYNC
                  </span>
                </div>

                <div className="mt-5 flex h-36 items-end gap-2">
                  {aggregated.series.map((bar, idx) => {
                    const heightPct =
                      bar.revenue === 0 ? 6 : Math.max(14, Math.round((bar.revenue / maxRev) * 100));
                    const isHovered = hoveredBar === idx;
                    return (
                      <div
                        key={bar.label}
                        onMouseEnter={() => setHoveredBar(idx)}
                        onMouseLeave={() => setHoveredBar(null)}
                        className="group relative flex h-full flex-1 flex-col items-center justify-end gap-1.5"
                      >
                        {isHovered && (
                          <div className="pointer-events-none absolute -top-11 z-10 whitespace-nowrap rounded-md border border-white/15 bg-zinc-950 px-2 py-1 font-mono text-[10px] text-zinc-200 shadow-xl">
                            <span className="text-emerald-400">${bar.revenue}</span> ·{' '}
                            {bar.visitors} vis
                          </div>
                        )}
                        <div
                          style={{ height: `${heightPct}%` }}
                          className={`w-full rounded-t-md transition-all duration-300 ${
                            bar.revenue === 0
                              ? 'bg-rose-500/30 group-hover:bg-rose-500/50'
                              : isHovered
                                ? 'bg-emerald-400'
                                : 'bg-emerald-500/75'
                          }`}
                        />
                        <span className="font-mono text-[10px] text-zinc-500">{bar.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Funnel Breakdown */}
              <div className="rounded-xl border border-white/10 bg-zinc-900/40 p-4 sm:col-span-2">
                <div className="text-xs font-medium text-zinc-300">Ship-to-Revenue Funnel</div>
                <div className="mt-4 space-y-3">
                  {[
                    {
                      label: 'Visitors',
                      val: aggregated.visitors,
                      pct: 100,
                      color: 'bg-zinc-400',
                    },
                    {
                      label: 'Signups',
                      val: aggregated.signups,
                      pct: Math.round((aggregated.signups / Math.max(aggregated.visitors, 1)) * 100),
                      color: 'bg-sky-400',
                    },
                    {
                      label: 'Trials / Activation',
                      val: aggregated.trials,
                      pct: Math.round((aggregated.trials / Math.max(aggregated.visitors, 1)) * 100),
                      color: 'bg-amber-400',
                    },
                    {
                      label: 'Stripe Paid',
                      val: aggregated.paid,
                      pct: Math.max(
                        aggregated.paid > 0 ? 4 : 0,
                        Math.round((aggregated.paid / Math.max(aggregated.visitors, 1)) * 100)
                      ),
                      color: 'bg-emerald-400',
                    },
                  ].map((step) => (
                    <div key={step.label}>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-400">{step.label}</span>
                        <span className="font-mono text-zinc-200">
                          {step.val.toLocaleString()}{' '}
                          <span className="text-zinc-500">({step.pct}%)</span>
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
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

            {/* Multi-Project Portfolio Table */}
            <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-900/40">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
                <span className="text-xs font-medium text-zinc-300">
                  Your Vibecoded Portfolio (click a row to drill down)
                </span>
                <span className="font-mono text-[11px] text-zinc-500">4 active apps</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/5 text-[11px] text-zinc-500">
                    <tr>
                      <th className="px-4 py-2.5 font-medium">Project</th>
                      <th className="px-3 py-2.5 font-medium">Visitors</th>
                      <th className="px-3 py-2.5 font-medium">Signups</th>
                      <th className="px-3 py-2.5 font-medium">MRR</th>
                      <th className="px-4 py-2.5 text-right font-medium">Verdict</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {PROJECTS.map((project) => {
                      const m = project.metrics[timeframe];
                      const badge = STATUS_BADGE[project.status];
                      const isSelected = selectedId === project.id;
                      return (
                        <tr
                          key={project.id}
                          onClick={() =>
                            setSelectedId(selectedId === project.id ? 'all' : project.id)
                          }
                          className={`cursor-pointer transition ${
                            isSelected ? 'bg-emerald-500/10' : 'hover:bg-white/[0.03]'
                          }`}
                        >
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-zinc-100">{project.name}</span>
                              <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                                {project.builtWith}
                              </span>
                            </div>
                            <div className="font-mono text-[10px] text-zinc-500">
                              {project.domain} · shipped {project.shippedAgo}
                            </div>
                          </td>
                          <td className="px-3 py-2.5 font-mono text-zinc-300">
                            {m.visitors.toLocaleString()}
                          </td>
                          <td className="px-3 py-2.5 font-mono text-zinc-300">
                            {m.signups.toLocaleString()}
                          </td>
                          <td className="px-3 py-2.5 font-mono font-medium text-white">
                            ${m.mrr.toLocaleString()}
                            <span
                              className={`ml-1.5 text-[10px] ${
                                m.mrr === 0 ? 'text-rose-400' : 'text-emerald-400'
                              }`}
                            >
                              {m.mrrDelta}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium ${badge.className}`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${badge.dotClass}`} />
                              {badge.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right 4 Cols: AI Verdict + Fix Prompt + Live Feed */}
          <div className="flex flex-col gap-5 lg:col-span-4">
            {/* Verdict Card */}
            <div className="rounded-xl border border-emerald-500/25 bg-gradient-to-b from-emerald-500/[0.07] to-zinc-900/60 p-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-medium text-emerald-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI VERDICT · {activeVerdict.name.toUpperCase()}
                </span>
                <span
                  className={`rounded-full border px-2 py-0.5 font-mono text-[10px] ${
                    STATUS_BADGE[activeVerdict.status].className
                  }`}
                >
                  {STATUS_BADGE[activeVerdict.status].label}
                </span>
              </div>

              <h3 className="mt-2.5 text-sm font-semibold text-white">
                {activeVerdict.verdictTitle}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-300">
                {activeVerdict.verdictBody}
              </p>

              <div className="mt-3.5 rounded-lg border border-white/10 bg-zinc-950/90 p-3">
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                  <span>1-CLICK FIX PROMPT FOR {activeVerdict.builtWith.toUpperCase()}</span>
                  <button
                    type="button"
                    onClick={handleCopyFix}
                    className="inline-flex items-center gap-1 rounded border border-white/10 bg-zinc-900 px-2 py-0.5 text-zinc-300 transition hover:border-emerald-500/40 hover:text-emerald-300"
                  >
                    {copiedPrompt ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" /> Copy
                      </>
                    )}
                  </button>
                </div>
                <p className="mt-2 font-mono text-[11px] leading-relaxed text-zinc-300">
                  "{activeVerdict.fixPrompt}"
                </p>
              </div>
            </div>

            {/* Live Event Stream */}
            <div className="flex-1 rounded-xl border border-white/10 bg-zinc-900/40 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-300">Live Revenue & Drop-offs</span>
                <span className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
                  STREAMING
                </span>
              </div>

              <div className="mt-3.5 space-y-2.5">
                {LIVE_EVENTS.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-start justify-between gap-2 rounded-lg border border-white/5 bg-zinc-950/60 px-3 py-2"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">
                        {ev.type === 'revenue' && (
                          <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                        )}
                        {ev.type === 'dropoff' && <XCircle className="h-3.5 w-3.5 text-rose-400" />}
                        {ev.type === 'deploy' && <GitCommit className="h-3.5 w-3.5 text-sky-400" />}
                        {ev.type === 'signup' && (
                          <ArrowUpRight className="h-3.5 w-3.5 text-amber-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-medium text-zinc-200">
                            {ev.project}
                          </span>
                          <span className="font-mono text-[10px] text-zinc-500">{ev.label}</span>
                        </div>
                        <div
                          className={`font-mono text-[11px] ${
                            ev.type === 'revenue'
                              ? 'text-emerald-400'
                              : ev.type === 'dropoff'
                                ? 'text-rose-300'
                                : 'text-zinc-400'
                          }`}
                        >
                          {ev.detail}
                        </div>
                      </div>
                    </div>
                    <span className="shrink-0 font-mono text-[10px] text-zinc-500">{ev.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
