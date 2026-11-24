import { type FormEvent, useState } from 'react';
import { X } from 'lucide-react';
import type { EventType, NewEventInput, Project } from '../types';

interface LogEventModalProps {
  projects: Project[];
  defaultProjectId?: string;
  onClose: () => void;
  onLog: (input: NewEventInput) => void;
}

const EVENT_PRESETS: Record<EventType, { label: string; detail: string }> = {
  revenue: { label: 'stripe.charge.succeeded', detail: 'Pro Monthly subscription' },
  signup: { label: 'auth.signup', detail: 'Organic X / GitHub referral' },
  visitor: { label: 'traffic.burst', detail: 'Landing page visits logged' },
  dropoff: { label: 'checkout.abandoned', detail: 'Exited on pricing modal' },
  deploy: { label: 'git.push → main', detail: 'Shipped pricing page tweak' },
};

export function LogEventModal({
  projects,
  defaultProjectId,
  onClose,
  onLog,
}: LogEventModalProps) {
  const [projectId, setProjectId] = useState(
    defaultProjectId && projects.some((p) => p.id === defaultProjectId)
      ? defaultProjectId
      : projects[0]?.id ?? ''
  );
  const [type, setType] = useState<EventType>('revenue');
  const [amount, setAmount] = useState('29');
  const [count, setCount] = useState('50');
  const [detail, setDetail] = useState(EVENT_PRESETS.revenue.detail);

  const handleTypeChange = (next: EventType) => {
    setType(next);
    setDetail(EVENT_PRESETS[next].detail);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!projectId) return;

    const numericAmount = Math.max(1, Number(amount) || 29);
    const numericCount = Math.max(1, Number(count) || 1);

    const formattedDetail =
      type === 'revenue'
        ? `+$${numericAmount.toFixed(2)} · ${detail.trim() || 'Stripe charge'}`
        : type === 'visitor'
          ? `+${numericCount} visitors · ${detail.trim() || 'Direct'}`
          : detail.trim() || EVENT_PRESETS[type].detail;

    onLog({
      projectId,
      type,
      label: EVENT_PRESETS[type].label,
      detail: formattedDetail,
      amount: type === 'revenue' ? numericAmount : undefined,
      count: type === 'visitor' ? numericCount : 1,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#131517]/30 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-[#131517]/10 bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-[#131517]">Log Live Event</h3>
            <p className="text-xs text-[#64666B]">
              Updates KPIs, chart bars, and verdict calculations immediately.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-[#73757C] transition hover:bg-[#F5F4F1] hover:text-[#131517]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#5C5E64]">Project</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-black/12 bg-neutral-50 px-3.5 py-2 text-sm text-black outline-none focus:border-black focus:bg-white"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.domain})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#5C5E64]">Event Type</label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {(
                [
                  { id: 'revenue', label: 'Stripe Revenue' },
                  { id: 'signup', label: 'Signup' },
                  { id: 'visitor', label: 'Visitors' },
                  { id: 'dropoff', label: 'Drop-off' },
                  { id: 'deploy', label: 'Deploy' },
                ] as { id: EventType; label: string }[]
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleTypeChange(item.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    type === item.id
                      ? 'bg-[#131517] text-white'
                      : 'bg-[#FAF9F7] text-[#5C5E64] ring-1 ring-[#131517]/8 hover:text-[#131517]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {type === 'revenue' && (
            <div>
              <label className="block text-xs font-medium text-[#5C5E64]">Amount (USD)</label>
              <input
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 w-full rounded-xl border border-black/12 bg-neutral-50 px-3.5 py-2 font-mono text-sm text-black outline-none focus:border-black focus:bg-white"
              />
            </div>
          )}

          {type === 'visitor' && (
            <div>
              <label className="block text-xs font-medium text-[#5C5E64]">Visitor Count</label>
              <input
                type="number"
                min={1}
                value={count}
                onChange={(e) => setCount(e.target.value)}
                className="mt-1 w-full rounded-xl border border-black/12 bg-neutral-50 px-3.5 py-2 font-mono text-sm text-black outline-none focus:border-black focus:bg-white"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#5C5E64]">Note / Context</label>
            <input
              type="text"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-black/12 bg-neutral-50 px-3.5 py-2 text-sm text-black outline-none focus:border-black focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2 text-xs font-medium text-[#5C5E64] transition hover:bg-[#F5F4F1] hover:text-[#131517]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-[#131517] px-5 py-2 text-xs font-medium text-white transition hover:bg-[#2A2D32]"
            >
              Record Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
