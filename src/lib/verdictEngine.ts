import type { BuilderTool, ComputedVerdict, Project, Timeframe } from '../types';
import { INGEST_URL, TRACKER_URL } from './supabase';

export function computeProjectVerdict(
  project: Project,
  timeframe: Timeframe = '7D'
): ComputedVerdict {
  const m = project.metrics[timeframe];
  const visitors = Math.max(m.visitors, 0);
  const signups = Math.max(m.signups, 0);
  const paid = Math.max(m.paid, 0);
  const mrr = Math.max(m.mrr, 0);

  const visitToSignupPct = visitors > 0 ? (signups / visitors) * 100 : 0;
  const signupToPaidPct = signups > 0 ? (paid / signups) * 100 : 0;
  const visitToPaidPct = visitors > 0 ? (paid / visitors) * 100 : 0;
  const numericChurn = parseFloat(m.churnRate.replace('%', '')) || 0;

  // SCALE: real revenue + healthy paid conversion + manageable churn
  if (mrr >= 500 && visitToPaidPct >= 1.5 && numericChurn <= 4.0) {
    return {
      status: 'SCALE',
      title: `Double Down — ${visitToPaidPct.toFixed(1)}% Paid Pull`,
      body: `${project.name} converts ${visitToPaidPct.toFixed(1)}% of visitors into paying customers ($${mrr.toLocaleString()} MRR) with ${m.churnRate} churn. Stop adding random features—push distribution and annual plans.`,
      fixPrompt: `In ${project.name} (${project.domain}), add an annual billing toggle (20% off) on /pricing and trigger an upgrade prompt right after a user hits their core activation moment.`,
      visitToSignupPct,
      signupToPaidPct,
      visitToPaidPct,
    };
  }

  // KILL OR PIVOT: meaningful traffic or signups, $0 MRR
  if (mrr === 0 && (visitors >= 200 || signups >= 20)) {
    return {
      status: 'KILL_OR_PIVOT',
      title: `Kill or Pivot — ${visitors.toLocaleString()} Visitors, $0 MRR`,
      body: `${project.name} pulled ${visitors.toLocaleString()} visitors and ${signups.toLocaleString()} signups, but zero converted to paid. Users treat ${project.domain} as a free utility. Gate a high-intent workflow or sunset it.`,
      fixPrompt: `Add a 1-question exit modal on ${project.name}'s main workspace asking "What would make you pay $15/mo for this?" and send responses to VibeBoard (project ${project.apiKey}).`,
      visitToSignupPct,
      signupToPaidPct,
      visitToPaidPct,
    };
  }

  // KILL OR PIVOT: no traffic and no revenue yet (brand new or dead)
  if (mrr === 0 && visitors < 200) {
    return {
      status: 'OPTIMIZE',
      title: 'Needs First Traffic & Payment Signal',
      body: `${project.name} has ${visitors.toLocaleString()} visitors and $${mrr} MRR so far. Ship the install snippet to ${project.domain}, post a demo clip, and log your first 50 sessions before judging.`,
      fixPrompt: `Install the VibeBoard tracking snippet (${project.apiKey}) in ${project.name}'s root layout and wire Stripe checkout.session.completed webhook forwarding so real revenue shows up live.`,
      visitToSignupPct,
      signupToPaidPct,
      visitToPaidPct,
    };
  }

  // OPTIMIZE: making money, but leaky funnel or elevated churn
  const leakStage =
    signupToPaidPct < 8
      ? `Only ${signupToPaidPct.toFixed(1)}% of signups convert to paid`
      : numericChurn > 4
        ? `Churn is elevated at ${m.churnRate}`
        : `Visit-to-paid is ${visitToPaidPct.toFixed(1)}%`;

  return {
    status: 'OPTIMIZE',
    title: `Fix Funnel — ${leakStage}`,
    body: `${project.name} generates $${mrr.toLocaleString()} MRR from ${signups.toLocaleString()} signups, but loses momentum before checkout. Remove upfront card walls, let users experience one free win, then prompt for Pro.`,
    fixPrompt: `In ${project.name}, allow 1 free core action without a credit card gate, then show a clean Stripe upgrade modal on action #2. Track 'checkout_started' via window.vb?.track('checkout_started').`,
    visitToSignupPct,
    signupToPaidPct,
    visitToPaidPct,
  };
}

export function generateInstallPrompt(
  project: Project,
  tool: BuilderTool
): { prompt: string; note: string } {
  const key = project.apiKey;
  const domain = project.domain;

  switch (tool) {
    case 'Cursor':
      return {
        note: `Paste into Composer (Cmd+I) inside ${project.name}. Auto-detects Next.js, Vite, Remix, and Stripe webhooks.`,
        prompt: `Install VibeBoard analytics for ${project.name} (${domain}, key "${key}"):
1. Add <script defer data-project="${key}" src="${TRACKER_URL}"></script> to root layout/index.html.
2. Call window.vb?.identify(user.id) and window.vb?.track('signup') after auth succeeds.
3. Point Stripe checkout.session.completed & customer.subscription.deleted webhooks to ${INGEST_URL}?key=${key}.`,
      };
    case 'Lovable':
      return {
        note: `Drop straight into Lovable chat for ${project.name}. Works with Supabase Auth + Stripe edge functions.`,
        prompt: `Connect ${project.name} (${domain}) to VibeBoard (project key: ${key}). Add <script defer data-project="${key}" src="${TRACKER_URL}"></script> to index.html, fire window.vb?.track('signup') after auth succeeds, and forward Stripe webhook events to ${INGEST_URL}?key=${key}.`,
      };
    case 'Bolt':
      return {
        note: `Works with Bolt.new React/Next/Astro templates in one turn.`,
        prompt: `Wire up VibeBoard Ship-to-Revenue tracking for ${project.name} (key: ${key}). Inject <script defer data-project="${key}" src="${TRACKER_URL}"></script> in index.html, track signups via window.vb?.track('signup'), and forward Stripe webhooks to ${INGEST_URL}?key=${key}.`,
      };
    case 'v0':
      return {
        note: `Add to your v0 generation or Vercel Next.js App Router project.`,
        prompt: `Add VibeBoard to app/layout.tsx using next/script with strategy="afterInteractive", src="${TRACKER_URL}", and data-project="${key}". Track signup and dropoff events for ${domain} via window.vb?.track().`,
      };
    case 'Claude Code':
      return {
        note: `Run in terminal inside the ${project.name} repo.`,
        prompt: `claude "Integrate VibeBoard (${key}) into ${project.name}: add <script defer data-project=\\"${key}\\" src=\\"${TRACKER_URL}\\"></script> to root HTML, call window.vb?.track('signup') on signup, and configure Stripe webhook forwarding to ${INGEST_URL}?key=${key}. Verify build passes."`,
      };
  }
}

export function formatRelativeTime(isoDate: string): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000));
  if (diffSec < 15) return 'just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}
