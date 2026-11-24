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
      <div className="luma-card rounded-2xl p-10 text-center text-sm text-neutral-500">
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
          <h2 className="text-xl font-semibold tracking-tight text-black">
            Install & Live Endpoints
          </h2>
          <p className="text-xs text-neutral-500">
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
          className="rounded-full border border-black/15 bg-white px-4 py-2 text-xs font-semibold text-black outline-none focus:border-black"
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.domain})
            </option>
          ))}
        </select>
      </div>

      <div className="luma-card flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-black">
            <KeyRound className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-black">
              {activeProject.name} Project Key
            </div>
            <div className="font-mono text-xs text-neutral-500">{activeProject.apiKey}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isCloud ? (
            <button
              type="button"
              onClick={sendTestBeacon}
              disabled={beaconStatus === 'sending'}
              className="inline-flex items-center gap-1.5 rounded-full bg-black px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60"
            >
              <Radio className="h-3.5 w-3.5" />
              {beaconStatus === 'sending' ? 'Pinging...' : 'Send Live Test Beacon'}
            </button>
          ) : (
            <span className="rounded-full border border-black/12 bg-neutral-50 px-3 py-1 text-[11px] font-medium text-neutral-600">
              Sign in to activate live Supabase ingestion for this key
            </span>
          )}
        </div>
      </div>

      {beaconMessage && (
        <div
          className={`rounded-2xl border px-4 py-3 text-xs font-medium ${
            beaconStatus === 'ok'
              ? 'border-black/20 bg-neutral-100 text-black'
              : 'border-black bg-black text-white'
          }`}
        >
          {beaconMessage}
        </div>
      )}

      <div className="luma-card overflow-hidden rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/8 bg-neutral-50 px-5 py-3.5">
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
                    ? 'bg-black text-white'
                    : 'text-neutral-600 hover:bg-white hover:text-black'
                }`}
              >
                {tool}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={copyPrompt}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-black ring-1 ring-black/12 transition hover:bg-neutral-100"
          >
            {copiedPrompt ? (
              <>
                <Check className="h-3.5 w-3.5 text-black" /> Copied Prompt
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" /> Copy Prompt
              </>
            )}
          </button>
        </div>

        <div className="p-5">
          <div className="mb-3 flex items-center gap-1.5 text-xs text-neutral-500">
            <Terminal className="h-3.5 w-3.5 text-black" />
            {generated.note}
          </div>
          <pre className="overflow-x-auto rounded-xl border border-black/10 bg-neutral-50 p-4 font-mono text-xs leading-relaxed text-black">
            <code>{generated.prompt}</code>
          </pre>
        </div>
      </div>

      <div className="luma-card rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-black">
            <Code2 className="h-4 w-4 text-black" />
            Live Tracking Script Tag
          </div>
          <button
            type="button"
            onClick={copyScript}
            className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-black ring-1 ring-black/10 transition hover:bg-neutral-200"
          >
            {copiedScript ? (
              <>
                <Check className="h-3 w-3 text-black" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" /> Copy Tag
              </>
            )}
          </button>
        </div>
        <pre className="mt-3 overflow-x-auto rounded-xl border border-black/10 bg-neutral-50 p-3.5 font-mono text-xs text-black">
          <code>{scriptSnippet}</code>
        </pre>
      </div>

      <div className="luma-card rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-black">
            <Webhook className="h-4 w-4 text-black" />
            Stripe Webhook Endpoint
          </div>
          <button
            type="button"
            onClick={copyWebhook}
            className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-black ring-1 ring-black/10 transition hover:bg-neutral-200"
          >
            {copiedWebhook ? (
              <>
                <Check className="h-3 w-3 text-black" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" /> Copy URL
              </>
            )}
          </button>
        </div>
        <p className="mt-1.5 text-xs text-neutral-500">
          Add this URL in Stripe Developers → Webhooks for{' '}
          <code className="rounded bg-neutral-100 px-1 py-0.5 font-mono text-[11px] text-black">
            checkout.session.completed
          </code>
          ,{' '}
          <code className="rounded bg-neutral-100 px-1 py-0.5 font-mono text-[11px] text-black">
            invoice.paid
          </code>
          , and{' '}
          <code className="rounded bg-neutral-100 px-1 py-0.5 font-mono text-[11px] text-black">
            customer.subscription.deleted
          </code>
          .
        </p>
        <pre className="mt-3 overflow-x-auto rounded-xl border border-black/10 bg-neutral-50 p-3.5 font-mono text-xs text-black">
          <code>{webhookUrl}</code>
        </pre>
      </div>
    </div>
  );
}
