import { useEffect, useState } from 'react';
import { Check, ChevronDown, Copy, Radio, Sparkles } from 'lucide-react';
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
        Add an app first, then come back here to connect it in 1 click.
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
          detail: `Test visit on ${activeProject.domain}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBeaconStatus('error');
        setBeaconMessage(data.error || 'Could not reach VibeBoard');
        return;
      }
      setBeaconStatus('ok');
      setBeaconMessage(`It works! A test visit was just added to ${data.project}.`);
      onRefreshCloud();
    } catch (err) {
      setBeaconStatus('error');
      setBeaconMessage(err instanceof Error ? err.message : 'Network error');
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-black">Connect Your App</h2>
          <p className="text-xs text-neutral-500">
            No coding needed—just copy one message and paste it into your AI builder.
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

      {/* Step 1: Copy 1 Prompt */}
      <div className="luma-card overflow-hidden rounded-2xl">
        <div className="border-b border-black/8 bg-neutral-50 px-5 py-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-black">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs text-white">
              1
            </span>
            Pick the tool you used to build {activeProject.name}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {TOOLS.map((tool) => (
                <button
                  key={tool}
                  type="button"
                  onClick={() => {
                    setActiveTool(tool);
                    setCopiedPrompt(false);
                  }}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                    activeTool === tool
                      ? 'bg-black text-white'
                      : 'bg-white text-neutral-600 ring-1 ring-black/10 hover:text-black'
                  }`}
                >
                  {tool}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={copyPrompt}
              className="inline-flex items-center gap-1.5 rounded-full bg-black px-4 py-2 text-xs font-medium text-white transition hover:bg-neutral-800"
            >
              {copiedPrompt ? (
                <>
                  <Check className="h-3.5 w-3.5" /> Copied! Now paste in {activeTool}
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> Copy Prompt
                </>
              )}
            </button>
          </div>
        </div>

        <div className="p-5">
          <div className="mb-3 flex items-center gap-1.5 text-xs text-neutral-600">
            <Sparkles className="h-3.5 w-3.5 text-black" />
            {generated.note}
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl border border-black/10 bg-neutral-50 p-4 font-mono text-xs leading-relaxed text-black">
            <code>{generated.prompt}</code>
          </pre>
        </div>
      </div>

      {/* Step 2: Test Connection */}
      <div className="luma-card rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
              2
            </span>
            <div>
              <div className="text-sm font-semibold text-black">Test that it works</div>
              <p className="mt-0.5 text-xs text-neutral-500">
                Send a quick test visit to make sure {activeProject.name} is connected.
              </p>
            </div>
          </div>

          {isCloud ? (
            <button
              type="button"
              onClick={sendTestBeacon}
              disabled={beaconStatus === 'sending'}
              className="inline-flex items-center gap-1.5 rounded-full bg-black px-4 py-2 text-xs font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60"
            >
              <Radio className="h-3.5 w-3.5" />
              {beaconStatus === 'sending' ? 'Testing...' : 'Test Connection'}
            </button>
          ) : (
            <span className="rounded-full border border-black/12 bg-neutral-50 px-3 py-1.5 text-xs text-neutral-600">
              Sign in first to enable live tracking
            </span>
          )}
        </div>

        {beaconMessage && (
          <div
            className={`mt-4 rounded-xl border px-4 py-3 text-xs font-medium ${
              beaconStatus === 'ok'
                ? 'border-black/20 bg-neutral-100 text-black'
                : 'border-black bg-black text-white'
            }`}
          >
            {beaconMessage}
          </div>
        )}
      </div>

      {/* Step 3: Optional Manual / Advanced Details (Collapsed by default for beginners) */}
      <details className="luma-card group rounded-2xl p-5">
        <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-black">
          <span>Advanced / Manual Setup (Optional)</span>
          <ChevronDown className="h-4 w-4 text-neutral-500 transition group-open:rotate-180" />
        </summary>

        <div className="mt-4 space-y-4 border-t border-black/8 pt-4">
          <div>
            <div className="text-xs font-semibold text-black">Project Key</div>
            <div className="mt-1 font-mono text-xs text-neutral-600">{activeProject.apiKey}</div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-black">HTML Script Tag</span>
              <button
                type="button"
                onClick={copyScript}
                className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-black hover:bg-neutral-200"
              >
                {copiedScript ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copiedScript ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="mt-2 overflow-x-auto rounded-xl border border-black/10 bg-neutral-50 p-3 font-mono text-xs text-black">
              <code>{scriptSnippet}</code>
            </pre>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-black">Stripe Webhook URL</span>
              <button
                type="button"
                onClick={copyWebhook}
                className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-black hover:bg-neutral-200"
              >
                {copiedWebhook ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copiedWebhook ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="mt-2 overflow-x-auto rounded-xl border border-black/10 bg-neutral-50 p-3 font-mono text-xs text-black">
              <code>{webhookUrl}</code>
            </pre>
          </div>
        </div>
      </details>
    </div>
  );
}
