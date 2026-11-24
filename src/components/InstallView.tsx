import { useEffect, useState } from 'react';
import { Check, Code2, Copy, KeyRound, Radio, Terminal, Webhook } from 'lucide-react';
import type { BuilderTool, Project } from '../types';
import { generateInstallPrompt } from '../lib/verdictEngine';
import { INGEST_URL, TRACKER_URL } from '../lib/supabase';

const TOOLS: BuilderTool[] = ['Cursor', 'Lovable', 'Bolt', 'v0', 'Claude Code'];

interface InstallViewProps {
  projects: Project[];
  isCloud: boolean;
  initialProjectId?: string;
  onRefreshCloud: () => void;
}

export function InstallView({
  projects,
  isCloud,
  initialProjectId,
  onRefreshCloud,
}: InstallViewProps) {
  const [projectId, setProjectId] = useState<string>(
    initialProjectId && projects.some((p) => p.id === initialProjectId)
      ? initialProjectId
      : projects[0]?.id ?? ''
  );
  const [activeTool, setActiveTool] = useState<BuilderTool>('Cursor');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [beaconStatus, setBeaconStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [beaconMessage, setBeaconMessage] = useState('');

  useEffect(() => {
    if (initialProjectId && projects.some((p) => p.id === initialProjectId)) {
      setProjectId(initialProjectId);
    } else if (!projects.some((p) => p.id === projectId) && projects[0]) {
      setProjectId(projects[0].id);
    }
  }, [initialProjectId, projects, projectId]);

  const activeProject = projects.find((p) => p.id === projectId) ?? projects[0];

  if (!activeProject) {
    return (
      <div className="luma-card rounded-2xl p-10 text-center text-sm text-[#64666B]">
        Add a project first to generate its API key and live tracking snippet.
      </div>
    );
  }

  const generated = generateInstallPrompt(activeProject, activeTool);
  const scriptSnippet = `<script defer data-project="${activeProject.apiKey}" src="${TRACKER_URL}"></script>`;
  const webhookUrl = `${INGEST_URL}?key=${activeProject.apiKey}`;

  const copyPrompt = () => {
    navigator.clipboard?.writeText(generated.prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 1800);
  };

  const copyScript = () => {
    navigator.clipboard?.writeText(scriptSnippet);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 1800);
  };

  const copyWebhook = () => {
    navigator.clipboard?.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 1800);
  };

  const sendTestBeacon = async () => {
    setBeaconStatus('sending');
    setBeaconMessage('');
    try {
      const res = await fetch(INGEST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: activeProject.apiKey,
          type: 'visitor',
          label: 'beacon.test',
          detail: `Live test ping for ${activeProject.domain}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBeaconStatus('error');
        setBeaconMessage(data.error || 'Failed to ingest beacon');
        return;
      }
      setBeaconStatus('ok');
      setBeaconMessage(`Ingested live into ${data.project}! Check Overview or Events.`);
      onRefreshCloud();
    } catch (err) {
      setBeaconStatus('error');
      setBeaconMessage(err instanceof Error ? err.message : 'Network error');
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-[#131517]">
            Install & Live Endpoints
          </h2>
          <p className="text-xs text-[#64666B]">
            Drop the script tag or Stripe webhook URL into any shipped app to stream live events.
          </p>
        </div>

        <select
          value={activeProject.id}
          onChange={(e) => {
            setProjectId(e.target.value);
            setBeaconStatus('idle');
            setBeaconMessage('');
          }}
          className="rounded-full border border-[#131517]/12 bg-white px-4 py-2 text-xs font-semibold text-[#131517] outline-none focus:border-[#E11D48]/50"
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.domain})
            </option>
          ))}
        </select>
      </div>

      {/* Project Key & Live Test Banner */}
      <div className="luma-card flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F5F3FF] text-[#7C3AED]">
            <KeyRound className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#131517]">
              {activeProject.name} Project Key
            </div>
            <div className="font-mono text-xs text-[#64666B]">{activeProject.apiKey}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isCloud ? (
            <button
              type="button"
              onClick={sendTestBeacon}
              disabled={beaconStatus === 'sending'}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#131517] px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-[#2A2D32] disabled:opacity-60"
            >
              <Radio className="h-3.5 w-3.5 text-[#FDA4AF]" />
              {beaconStatus === 'sending' ? 'Pinging...' : 'Send Live Test Beacon'}
            </button>
          ) : (
            <span className="rounded-full bg-[#FFF7ED] px-3 py-1 text-[11px] font-medium text-[#C2410C]">
              Sign in to activate live Supabase ingestion for this key
            </span>
          )}
        </div>
      </div>

      {beaconMessage && (
        <div
          className={`rounded-2xl border px-4 py-3 text-xs font-medium ${
            beaconStatus === 'ok'
              ? 'border-[#A7F3D0] bg-[#ECFDF5] text-[#047857]'
              : 'border-[#FECDD3] bg-[#FFF1F2] text-[#BE123C]'
          }`}
        >
          {beaconMessage}
        </div>
      )}

      {/* 1-Prompt Setup Card */}
      <div className="luma-card overflow-hidden rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#131517]/8 bg-[#FAF9F7]/80 px-5 py-3.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {TOOLS.map((tool) => (
              <button
                key={tool}
                type="button"
                onClick={() => {
                  setActiveTool(tool);
                  setCopiedPrompt(false);
                }}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  activeTool === tool
                    ? 'bg-[#131517] text-white'
                    : 'text-[#5C5E64] hover:bg-white hover:text-[#131517]'
                }`}
              >
                {tool}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={copyPrompt}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-[#131517] ring-1 ring-[#131517]/10 transition hover:bg-[#F5F4F1]"
          >
            {copiedPrompt ? (
              <>
                <Check className="h-3.5 w-3.5 text-[#059669]" /> Copied Prompt
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" /> Copy Prompt
              </>
            )}
          </button>
        </div>

        <div className="p-5">
          <div className="mb-3 flex items-center gap-1.5 text-xs text-[#64666B]">
            <Terminal className="h-3.5 w-3.5 text-[#E11D48]" />
            {generated.note}
          </div>
          <pre className="overflow-x-auto rounded-xl border border-[#131517]/8 bg-[#FAF9F7] p-4 font-mono text-xs leading-relaxed text-[#131517]">
            <code>{generated.prompt}</code>
          </pre>
        </div>
      </div>

      {/* Direct HTML Script Tag */}
      <div className="luma-card rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#131517]">
            <Code2 className="h-4 w-4 text-[#7C3AED]" />
            Live Tracking Script Tag
          </div>
          <button
            type="button"
            onClick={copyScript}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF9F7] px-3 py-1 text-xs font-medium text-[#131517] ring-1 ring-[#131517]/8 transition hover:bg-[#F2F1EE]"
          >
            {copiedScript ? (
              <>
                <Check className="h-3 w-3 text-[#059669]" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" /> Copy Tag
              </>
            )}
          </button>
        </div>
        <pre className="mt-3 overflow-x-auto rounded-xl border border-[#131517]/8 bg-[#FAF9F7] p-3.5 font-mono text-xs text-[#131517]">
          <code>{scriptSnippet}</code>
        </pre>
      </div>

      {/* Stripe Webhook Endpoint */}
      <div className="luma-card rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#131517]">
            <Webhook className="h-4 w-4 text-[#059669]" />
            Stripe Webhook Endpoint
          </div>
          <button
            type="button"
            onClick={copyWebhook}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF9F7] px-3 py-1 text-xs font-medium text-[#131517] ring-1 ring-[#131517]/8 transition hover:bg-[#F2F1EE]"
          >
            {copiedWebhook ? (
              <>
                <Check className="h-3 w-3 text-[#059669]" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" /> Copy URL
              </>
            )}
          </button>
        </div>
        <p className="mt-1.5 text-xs text-[#64666B]">
          Add this URL in Stripe Developers → Webhooks for{' '}
          <code className="rounded bg-[#F2F1EE] px-1 py-0.5 font-mono text-[11px]">
            checkout.session.completed
          </code>
          ,{' '}
          <code className="rounded bg-[#F2F1EE] px-1 py-0.5 font-mono text-[11px]">
            invoice.paid
          </code>
          , and{' '}
          <code className="rounded bg-[#F2F1EE] px-1 py-0.5 font-mono text-[11px]">
            customer.subscription.deleted
          </code>
          .
        </p>
        <pre className="mt-3 overflow-x-auto rounded-xl border border-[#131517]/8 bg-[#FAF9F7] p-3.5 font-mono text-xs text-[#131517]">
          <code>{webhookUrl}</code>
        </pre>
      </div>
    </div>
  );
}
