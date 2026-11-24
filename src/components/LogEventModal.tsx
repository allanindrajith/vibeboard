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
  revenue: { label: 'New Payment', detail: 'Monthly plan' },
  signup: { label: 'New Signup', detail: 'Joined from website' },
  visitor: { label: 'Website Visit', detail: 'New visitors' },
  dropoff: { label: 'Left Checkout', detail: 'Closed payment page' },
  deploy: { label: 'App Updated', detail: 'Published a new version' },
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
        ? `+$${numericAmount.toFixed(2)} · ${detail.trim() || 'Payment'}`
        : type === 'visitor'
          ? `+${numericCount} visitors · ${detail.trim() || 'Website'}`
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-black/10 bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-black">
              Add Sale or Activity
            </h3>
            <p className="text-xs text-neutral-500">
              Your dashboard charts and numbers update right away.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-neutral-500 transition hover:bg-neutral-100 hover:text-black"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-600">Which App?</label>
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
            <label className="block text-xs font-medium text-neutral-600">What happened?</label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {(
                [
                  { id: 'revenue', label: 'New Sale' },
                  { id: 'signup', label: 'New Signup' },
                  { id: 'visitor', label: 'Visitors' },
                  { id: 'dropoff', label: 'Left Checkout' },
                  { id: 'deploy', label: 'App Update' },
                ] as { id: EventType; label: string }[]
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleTypeChange(item.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    type === item.id
                      ? 'bg-black text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:text-black'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {type === 'revenue' && (
            <div>
              <label className="block text-xs font-medium text-neutral-600">Amount ($)</label>
              <input
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 w-full rounded-xl border border-black/12 bg-neutral-50 px-3.5 py-2 text-sm text-black outline-none focus:border-black focus:bg-white"
              />
            </div>
          )}

          {type === 'visitor' && (
            <div>
              <label className="block text-xs font-medium text-neutral-600">
                How many visitors?
              </label>
              <input
                type="number"
                min={1}
                value={count}
                onChange={(e) => setCount(e.target.value)}
                className="mt-1 w-full rounded-xl border border-black/12 bg-neutral-50 px-3.5 py-2 text-sm text-black outline-none focus:border-black focus:bg-white"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-neutral-600">Short Note</label>
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
              className="rounded-full px-4 py-2 text-xs font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-black"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-black px-5 py-2 text-xs font-medium text-white transition hover:bg-neutral-800"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
