import { type FormEvent, useState } from 'react';
import { X } from 'lucide-react';
import type { BuilderTool, NewProjectInput, Project, Timeframe } from '../types';

const BUILDERS: BuilderTool[] = ['Cursor', 'Lovable', 'Bolt', 'v0', 'Claude Code'];

interface ProjectModalProps {
  mode: 'create' | 'edit';
  timeframe: Timeframe;
  initialProject?: Project | null;
  onClose: () => void;
  onCreate: (input: NewProjectInput) => void;
  onUpdate: (
    id: string,
    updates: {
      name: string;
      domain: string;
      builtWith: BuilderTool;
      visitors: number;
      signups: number;
      trials: number;
      paid: number;
      mrr: number;
      churnRate: string;
    }
  ) => void;
}

export function ProjectModal({
  mode,
  timeframe,
  initialProject,
  onClose,
  onCreate,
  onUpdate,
}: ProjectModalProps) {
  const initialMetrics = initialProject?.metrics[timeframe];

  const [name, setName] = useState(initialProject?.name ?? '');
  const [domain, setDomain] = useState(initialProject?.domain ?? '');
  const [builtWith, setBuiltWith] = useState<BuilderTool>(
    initialProject?.builtWith ?? 'Cursor'
  );
  const [visitors, setVisitors] = useState(String(initialMetrics?.visitors ?? 0));
  const [signups, setSignups] = useState(String(initialMetrics?.signups ?? 0));
  const [trials, setTrials] = useState(String(initialMetrics?.trials ?? 0));
  const [paid, setPaid] = useState(String(initialMetrics?.paid ?? 0));
  const [mrr, setMrr] = useState(String(initialMetrics?.mrr ?? 0));
  const [churnRate, setChurnRate] = useState(initialMetrics?.churnRate ?? '0.0%');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      domain: domain.trim() || `${name.trim().toLowerCase().replace(/\s+/g, '')}.app`,
      builtWith,
      visitors: Math.max(0, Number(visitors) || 0),
      signups: Math.max(0, Number(signups) || 0),
      trials: Math.max(0, Number(trials) || 0),
      paid: Math.max(0, Number(paid) || 0),
      mrr: Math.max(0, Number(mrr) || 0),
      churnRate: churnRate.trim() || '0.0%',
    };

    if (mode === 'edit' && initialProject) {
      onUpdate(initialProject.id, payload);
    } else {
      onCreate(payload);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl border border-black/10 bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-black">
              {mode === 'edit' ? `Edit ${initialProject?.name}` : 'Add a New App'}
            </h3>
            <p className="text-xs text-neutral-500">
              {mode === 'edit'
                ? 'Update your numbers anytime—advice updates automatically.'
                : 'Just enter a name and link. You can leave numbers at 0 for brand new apps.'}
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
          <div className="grid gap-3.5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-neutral-600">App Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. My AI Notes App"
                className="mt-1 w-full rounded-xl border border-black/12 bg-neutral-50 px-3.5 py-2 text-sm text-black outline-none transition focus:border-black focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600">Website Link</label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="myapp.com"
                className="mt-1 w-full rounded-xl border border-black/12 bg-neutral-50 px-3.5 py-2 text-sm text-black outline-none transition focus:border-black focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600">Built With</label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {BUILDERS.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBuiltWith(b)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    builtWith === b
                      ? 'bg-black text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:text-black'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-black/8 bg-neutral-50 p-4">
            <div className="mb-3 text-xs font-semibold text-black">
              Starting Numbers (Optional)
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-[11px] text-neutral-600">Visitors</label>
                <input
                  type="number"
                  min={0}
                  value={visitors}
                  onChange={(e) => setVisitors(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-black/12 bg-white px-2.5 py-1.5 text-xs text-black outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-600">Signups</label>
                <input
                  type="number"
                  min={0}
                  value={signups}
                  onChange={(e) => setSignups(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-black/12 bg-white px-2.5 py-1.5 text-xs text-black outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-600">Free Trials</label>
                <input
                  type="number"
                  min={0}
                  value={trials}
                  onChange={(e) => setTrials(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-black/12 bg-white px-2.5 py-1.5 text-xs text-black outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-600">Paying Customers</label>
                <input
                  type="number"
                  min={0}
                  value={paid}
                  onChange={(e) => setPaid(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-black/12 bg-white px-2.5 py-1.5 text-xs text-black outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-600">Monthly Income ($)</label>
                <input
                  type="number"
                  min={0}
                  value={mrr}
                  onChange={(e) => setMrr(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-black/12 bg-white px-2.5 py-1.5 text-xs text-black outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-600">Cancellations (%)</label>
                <input
                  type="text"
                  value={churnRate}
                  onChange={(e) => setChurnRate(e.target.value)}
                  placeholder="0.0%"
                  className="mt-1 w-full rounded-lg border border-black/12 bg-white px-2.5 py-1.5 text-xs text-black outline-none focus:border-black"
                />
              </div>
            </div>
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
              {mode === 'edit' ? 'Save Changes' : 'Add App'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
