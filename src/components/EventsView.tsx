import { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  DollarSign,
  GitCommit,
  Plus,
  Users,
  XCircle,
} from 'lucide-react';
import type { EventType, LiveEvent, Project } from '../types';
import { formatEventLabel, formatRelativeTime } from '../lib/verdictEngine';

interface EventsViewProps {
  projects: Project[];
  events: LiveEvent[];
  onOpenLogEvent: (projectId?: string) => void;
}

const EVENT_TYPES: { id: 'all' | EventType; label: string }[] = [
  { id: 'all', label: 'Everything' },
  { id: 'revenue', label: 'Sales' },
  { id: 'signup', label: 'Signups' },
  { id: 'dropoff', label: 'Left Checkout' },
  { id: 'deploy', label: 'Updates' },
  { id: 'visitor', label: 'Visits' },
];

export function EventsView({ projects, events, onOpenLogEvent }: EventsViewProps) {
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | EventType>('all');

  const filtered = useMemo(() => {
    return events.filter((ev) => {
      if (projectFilter !== 'all' && ev.projectId !== projectFilter) return false;
      if (typeFilter !== 'all' && ev.type !== typeFilter) return false;
      return true;
    });
  }, [events, projectFilter, typeFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-black">
            Activity Feed ({filtered.length})
          </h2>
          <p className="text-xs text-neutral-500">
            Every sale, signup, and visit across your apps shows up here in real time.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onOpenLogEvent(projectFilter === 'all' ? undefined : projectFilter)}
          className="inline-flex items-center gap-1.5 rounded-full bg-black px-4 py-2 text-xs font-medium text-white transition hover:bg-neutral-800"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Activity
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {EVENT_TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTypeFilter(t.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                typeFilter === t.id
                  ? 'bg-black text-white'
                  : 'bg-white text-neutral-600 ring-1 ring-black/10 hover:text-black'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="rounded-full border border-black/12 bg-white px-3.5 py-1.5 text-xs font-medium text-black outline-none focus:border-black"
        >
          <option value="all">All Apps</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="luma-card overflow-hidden rounded-2xl">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-neutral-500">
            No activity yet for this filter. Click &ldquo;Add Activity&rdquo; to record a sale or
            signup.
          </div>
        ) : (
          <div className="divide-y divide-black/6">
            {filtered.map((ev) => (
              <div
                key={ev.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 transition hover:bg-neutral-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 ring-1 ring-black/8">
                    {ev.type === 'revenue' && <DollarSign className="h-4 w-4 text-black" />}
                    {ev.type === 'dropoff' && <XCircle className="h-4 w-4 text-neutral-500" />}
                    {ev.type === 'deploy' && <GitCommit className="h-4 w-4 text-neutral-700" />}
                    {ev.type === 'signup' && <ArrowUpRight className="h-4 w-4 text-neutral-700" />}
                    {ev.type === 'visitor' && <Users className="h-4 w-4 text-neutral-600" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-black">{ev.projectName}</span>
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-600">
                        {formatEventLabel(ev.type, ev.label)}
                      </span>
                    </div>
                    <div
                      className={`mt-0.5 text-xs ${
                        ev.type === 'revenue' ? 'font-semibold text-black' : 'text-neutral-600'
                      }`}
                    >
                      {ev.detail}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {ev.amount !== undefined && (
                    <span className="rounded-full bg-black px-2.5 py-0.5 text-xs font-semibold text-white">
                      +${ev.amount}
                    </span>
                  )}
                  <span className="text-xs text-neutral-400">
                    {formatRelativeTime(ev.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
