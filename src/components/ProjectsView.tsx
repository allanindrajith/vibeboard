import { useMemo, useState } from 'react';
import {
  ExternalLink,
  Link2,
  Pencil,
  Plus,
  Search,
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-black">
            My Apps ({projects.length})
          </h2>
          <p className="text-xs text-neutral-500">
            All the apps and websites you built, side by side.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your apps..."
              className="w-52 rounded-full border border-black/12 bg-white py-1.5 pl-8 pr-3.5 text-xs text-black placeholder-neutral-400 outline-none transition focus:border-black"
            />
          </div>

          <div className="flex items-center rounded-full bg-white p-0.5 ring-1 ring-black/10">
            {(['ALL', 'SCALE', 'OPTIMIZE', 'KILL_OR_PIVOT'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setVerdictFilter(status)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  verdictFilter === status
                    ? 'bg-black text-white'
                    : 'text-neutral-500 hover:text-black'
                }`}
              >
                {status === 'ALL' ? 'All' : VERDICT_BADGE[status].label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onAddProject}
            className="inline-flex items-center gap-1.5 rounded-full bg-black px-4 py-1.5 text-xs font-medium text-white transition hover:bg-neutral-800"
          >
            <Plus className="h-3.5 w-3.5" />
            Add App
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="luma-card rounded-2xl p-10 text-center text-sm text-neutral-500">
          No apps match that filter.
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
                          className="text-base font-semibold text-black hover:underline"
                        >
                          {project.name}
                        </button>
                        <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600">
                          {project.builtWith}
                        </span>
                      </div>
                      <a
                        href={`https://${project.domain}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-0.5 inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-black"
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

                  <div className="mt-4 grid grid-cols-4 gap-2 rounded-xl bg-neutral-50 p-3">
                    <div>
                      <div className="text-[11px] text-neutral-500">Income</div>
                      <div className="mt-0.5 text-sm font-semibold text-black tabular-nums">
                        ${m.mrr.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-neutral-500">Visitors</div>
                      <div className="mt-0.5 text-sm font-medium text-neutral-700 tabular-nums">
                        {m.visitors.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-neutral-500">Signups</div>
                      <div className="mt-0.5 text-sm font-medium text-neutral-700 tabular-nums">
                        {m.signups.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-neutral-500">Paid</div>
                      <div className="mt-0.5 text-sm font-semibold text-black tabular-nums">
                        {m.paid.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-black/8 pt-3.5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onInspectProject(project.id)}
                      className="rounded-full bg-black px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-neutral-800"
                    >
                      View Stats
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenInstall(project.id)}
                      className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3.5 py-1.5 text-xs font-medium text-black ring-1 ring-black/10 transition hover:bg-neutral-200"
                    >
                      <Link2 className="h-3 w-3 text-black" />
                      Connect
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onEditProject(project)}
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-black"
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteProject(project.id)}
                      title="Delete app"
                      className="rounded-full p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-black"
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
