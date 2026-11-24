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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#131517]/30 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl border border-[#131517]/10 bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-[#131517]">
              {mode === 'edit' ? `Edit ${initialProject?.name}` : 'Add Shipped App'}
            </h3>
            <p className="text-xs text-[#64666B]">
              {mode === 'edit'
                ? `Editing ${timeframe} metrics — verdict recalculates automatically.`
                : 'Connect a new app and generate its unique VibeBoard API key.'}
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
          <div className="grid gap-3.5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-[#5C5E64]">App Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. ShipPulse"
                className="mt-1 w-full rounded-xl border border-[#131517]/12 bg-[#FAF9F7] px-3.5 py-2 text-sm text-[#131517] outline-none transition focus:border-[#E11D48] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#5C5E64]">Domain</label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="shippulse.io"
                className="mt-1 w-full rounded-xl border border-[#131517]/12 bg-[#FAF9F7] px-3.5 py-2 font-mono text-xs text-[#131517] outline-none transition focus:border-[#E11D48] focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#5C5E64]">Built With</label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {BUILDERS.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBuiltWith(b)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    builtWith === b
                      ? 'bg-[#131517] text-white'
                      : 'bg-[#FAF9F7] text-[#5C5E64] ring-1 ring-[#131517]/8 hover:text-[#131517]'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#131517]/8 bg-[#FAF9F7] p-4">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#73757C]">
              {mode === 'edit' ? `${timeframe} Metrics` : 'Starting Metrics (7D Baseline)'}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-[11px] text-[#64666B]">Visitors</label>
                <input
                  type="number"
                  min={0}
                  value={visitors}
                  onChange={(e) => setVisitors(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#131517]/10 bg-white px-2.5 py-1.5 font-mono text-xs text-[#131517] outline-none focus:border-[#E11D48]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#64666B]">Signups</label>
                <input
                  type="number"
                  min={0}
                  value={signups}
                  onChange={(e) => setSignups(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#131517]/10 bg-white px-2.5 py-1.5 font-mono text-xs text-[#131517] outline-none focus:border-[#E11D48]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#64666B]">Trials</label>
                <input
                  type="number"
                  min={0}
                  value={trials}
                  onChange={(e) => setTrials(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#131517]/10 bg-white px-2.5 py-1.5 font-mono text-xs text-[#131517] outline-none focus:border-[#E11D48]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#64666B]">Paid Users</label>
                <input
                  type="number"
                  min={0}
                  value={paid}
                  onChange={(e) => setPaid(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#131517]/10 bg-white px-2.5 py-1.5 font-mono text-xs text-[#131517] outline-none focus:border-[#E11D48]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#64666B]">MRR ($)</label>
                <input
                  type="number"
                  min={0}
                  value={mrr}
                  onChange={(e) => setMrr(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#131517]/10 bg-white px-2.5 py-1.5 font-mono text-xs text-[#131517] outline-none focus:border-[#E11D48]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#64666B]">Churn Rate</label>
                <input
                  type="text"
                  value={churnRate}
                  onChange={(e) => setChurnRate(e.target.value)}
                  placeholder="2.1%"
                  className="mt-1 w-full rounded-lg border border-[#131517]/10 bg-white px-2.5 py-1.5 font-mono text-xs text-[#131517] outline-none focus:border-[#E11D48]"
                />
              </div>
            </div>
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
              {mode === 'edit' ? 'Save Changes' : 'Create App'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
