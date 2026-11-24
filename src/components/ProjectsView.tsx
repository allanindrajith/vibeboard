import { useMemo, useState } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  KeyRound,
  Pencil,
  Plus,
  Search,
  Terminal,
  Trash2,
} from 'lucide-react';
import type { Project, ProjectVerdict, Timeframe } from '../types';
import { computeProjectVerdict } from '../lib/verdictEngine';
import { VERDICT_BADGE } from './OverviewView';

interface ProjectsViewProps {
  projects: Project[];
  timeframe: Timeframe;
  onAddProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onOpenInstall: (projectId: string) => void;
  onInspectProject: (projectId: string) => void;
}

export function ProjectsView({
  projects,
  timeframe,
  onAddProject,
  onEditProject,
  onDeleteProject,
  onOpenInstall,
  onInspectProject,
}: ProjectsViewProps) {
  const [query, setQuery] = useState('');
  const [verdictFilter, setVerdictFilter] = useState<'ALL' | ProjectVerdict>('ALL');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesText =
        !query.trim() ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.domain.toLowerCase().includes(query.toLowerCase()) ||
        p.builtWith.toLowerCase().includes(query.toLowerCase());
      if (!matchesText) return false;
      if (verdictFilter === 'ALL') return true;
      return computeProjectVerdict(p, timeframe).status === verdictFilter;
    });
  }, [projects, query, verdictFilter, timeframe]);

  const copyKey = (project: Project) => {
    navigator.clipboard?.writeText(project.apiKey);
    setCopiedKeyId(project.id);
    setTimeout(() => setCopiedKeyId(null), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header + Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-[#131517]">
            Shipped Apps ({projects.length})
          </h2>
          <p className="text-xs text-[#64666B]">
            Manage domains, API keys, and live Ship-to-Revenue metrics across your portfolio.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8E9096]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search apps or domains..."
              className="w-56 rounded-full border border-[#131517]/10 bg-white py-1.5 pl-8 pr-3.5 text-xs text-[#131517] placeholder-[#8E9096] outline-none transition focus:border-[#E11D48]/50 focus:ring-2 focus:ring-[#E11D48]/10"
            />
          </div>

          <div className="flex items-center rounded-full bg-white p-0.5 ring-1 ring-[#131517]/8">
            {(['ALL', 'SCALE', 'OPTIMIZE', 'KILL_OR_PIVOT'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setVerdictFilter(status)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  verdictFilter === status
                    ? 'bg-[#131517] text-white'
                    : 'text-[#64666B] hover:text-[#131517]'
                }`}
              >
                {status === 'ALL' ? 'All' : VERDICT_BADGE[status].label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onAddProject}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#131517] px-4 py-1.5 text-xs font-medium text-white transition hover:bg-[#2A2D32]"
          >
            <Plus className="h-3.5 w-3.5" />
            Add App
          </button>
        </div>
      </div>

      {/* Project Cards Grid */}
      {filtered.length === 0 ? (
        <div className="luma-card rounded-2xl p-10 text-center text-sm text-[#64666B]">
          No projects match your current filter.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {filtered.map((project) => {
            const m = project.metrics[timeframe];
            const verdict = computeProjectVerdict(project, timeframe);
            const badge = VERDICT_BADGE[verdict.status];

            return (
              <div
                key={project.id}
                className="luma-card luma-card-hover flex flex-col justify-between rounded-2xl p-5"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onInspectProject(project.id)}
                          className="text-base font-semibold text-[#131517] hover:text-[#E11D48]"
                        >
                          {project.name}
                        </button>
                        <span className="rounded-md bg-[#F2F1EE] px-2 py-0.5 font-mono text-[10px] font-medium text-[#5C5E64]">
                          {project.builtWith}
                        </span>
                      </div>
                      <a
                        href={`https://${project.domain}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-0.5 inline-flex items-center gap-1 font-mono text-xs text-[#73757C] hover:text-[#131517]"
                      >
                        {project.domain}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${badge.className}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${badge.dotClass}`} />
                      {badge.label}
                    </span>
                  </div>

                  {/* Mini KPI Row */}
                  <div className="mt-4 grid grid-cols-4 gap-2 rounded-xl bg-[#FAF9F7] p-3">
                    <div>
                      <div className="text-[10px] text-[#73757C]">MRR ({timeframe})</div>
                      <div className="mt-0.5 font-mono text-sm font-semibold text-[#131517] tabular-nums">
                        ${m.mrr.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#73757C]">Visitors</div>
                      <div className="mt-0.5 font-mono text-sm font-medium text-[#3F4147] tabular-nums">
                        {m.visitors.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#73757C]">Signups</div>
                      <div className="mt-0.5 font-mono text-sm font-medium text-[#3F4147] tabular-nums">
                        {m.signups.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#73757C]">Paid</div>
                      <div className="mt-0.5 font-mono text-sm font-medium text-[#E11D48] tabular-nums">
                        {m.paid.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* API Key Bar */}
                  <div className="mt-3 flex items-center justify-between rounded-xl border border-[#131517]/6 bg-white px-3 py-2">
                    <div className="flex items-center gap-2 font-mono text-[11px] text-[#5C5E64]">
                      <KeyRound className="h-3.5 w-3.5 text-[#8E9096]" />
                      <span>{project.apiKey}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyKey(project)}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium text-[#5C5E64] transition hover:bg-[#F5F4F1] hover:text-[#131517]"
                    >
                      {copiedKeyId === project.id ? (
                        <>
                          <Check className="h-3 w-3 text-[#059669]" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" /> Key
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="mt-4 flex items-center justify-between border-t border-[#131517]/6 pt-3.5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onInspectProject(project.id)}
                      className="rounded-full bg-[#131517] px-3 py-1 text-xs font-medium text-white transition hover:bg-[#2A2D32]"
                    >
                      Analytics
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenInstall(project.id)}
                      className="inline-flex items-center gap-1 rounded-full bg-[#FAF9F7] px-3 py-1 text-xs font-medium text-[#131517] ring-1 ring-[#131517]/8 transition hover:bg-[#F2F1EE]"
                    >
                      <Terminal className="h-3 w-3 text-[#7C3AED]" />
                      Install
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onEditProject(project)}
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-[#5C5E64] transition hover:bg-[#F5F4F1] hover:text-[#131517]"
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteProject(project.id)}
                      title="Delete project"
                      className="rounded-full p-1.5 text-[#8E9096] transition hover:bg-[#FFF1F2] hover:text-[#BE123C]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
