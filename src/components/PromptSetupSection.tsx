import { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';
import { INSTALL_PROMPTS, type BuilderTool } from '../data/mockData';

const TOOLS: BuilderTool[] = ['Cursor', 'Lovable', 'Bolt', 'v0', 'Claude Code'];

export function PromptSetupSection() {
  const [activeTool, setActiveTool] = useState<BuilderTool>('Cursor');
  const [copied, setCopied] = useState(false);

  const current = INSTALL_PROMPTS[activeTool];

  const copyPrompt = () => {
    navigator.clipboard?.writeText(current.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section id="setup" className="mx-auto max-w-5xl px-6 py-24">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 font-mono text-xs text-emerald-400">
          <Terminal className="h-3.5 w-3.5" />
          ZERO-CONFIG INSTRUMENTATION
        </span>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          One prompt. Every funnel wired in 30 seconds.
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-base text-zinc-400">
          Stop hand-writing event taxonomies or wrestling with GTM containers. Paste one prompt into
          your coding agent—VibeBoard auto-maps pageviews, signups, and Stripe MRR.
        </p>
      </div>

      <div className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d10]">
        {/* Tool Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-zinc-950/70 px-4 py-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {TOOLS.map((tool) => (
              <button
                key={tool}
                type="button"
                onClick={() => {
                  setActiveTool(tool);
                  setCopied(false);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  activeTool === tool
                    ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30'
                    : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                }`}
              >
                {tool}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={copyPrompt}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-zinc-900 px-3 py-1.5 font-mono text-xs font-medium text-zinc-200 transition hover:border-emerald-500/40 hover:text-emerald-300"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" /> Copied Prompt
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" /> Copy Prompt
              </>
            )}
          </button>
        </div>

        {/* Prompt Body */}
        <div className="p-6">
          <div className="mb-3 text-xs text-zinc-500">{current.note}</div>
          <pre className="overflow-x-auto rounded-xl border border-white/10 bg-zinc-950 p-4 font-mono text-xs leading-relaxed text-emerald-200/95 sm:text-sm">
            <code>{current.prompt}</code>
          </pre>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
            <span>Script size: 1.2 KB gzipped · Cookie-free · GDPR compliant</span>
            <span className="font-mono text-zinc-400">
              Works with Stripe, LemonSqueezy & Polar.sh
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
