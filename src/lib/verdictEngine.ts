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

  if (mrr >= 500 && visitToPaidPct >= 1.5 && numericChurn <= 4.0) {
    return {
      status: 'SCALE',
      title: `This app is working — keep growing it`,
      body: `${project.name} is earning $${mrr.toLocaleString()}/month and ${visitToPaidPct.toFixed(1)}% of visitors become paying customers. Focus on sharing it with more people and offering a yearly plan.`,
      fixPrompt: `In ${project.name} (${project.domain}), add a "Save 20% with Yearly" switch on the pricing page, and show a friendly upgrade message right after a user finishes their first task.`,
      visitToSignupPct,
      signupToPaidPct,
      visitToPaidPct,
    };
  }

  if (mrr === 0 && (visitors >= 200 || signups >= 20)) {
    return {
      status: 'KILL_OR_PIVOT',
      title: `People visit, but nobody is paying yet`,
      body: `${visitors.toLocaleString()} people visited ${project.name} and ${signups.toLocaleString()} signed up, but $0 came in. Ask users what they would actually pay for—or move on to a better idea.`,
      fixPrompt: `Add a simple 1-question popup on ${project.name} asking "What feature would make you pay $15/month for this?" and send their answers to VibeBoard.`,
      visitToSignupPct,
      signupToPaidPct,
      visitToPaidPct,
    };
  }

  if (mrr === 0 && visitors < 200) {
    return {
      status: 'OPTIMIZE',
      title: 'Too early to tell — get your first 50 visitors',
      body: `${project.name} has ${visitors.toLocaleString()} visitors so far. Connect your app in the "Connect App" tab, share a link with friends or social media, and check back once people try it.`,
      fixPrompt: `Connect ${project.name} to VibeBoard (key: ${project.apiKey}) by adding the tracking tag to the main HTML file so real visitors and sales show up automatically.`,
      visitToSignupPct,
      signupToPaidPct,
      visitToPaidPct,
    };
  }

  const leakHint =
    signupToPaidPct < 8
      ? `Only ${signupToPaidPct.toFixed(1)}% of people who sign up end up paying.`
      : numericChurn > 4
        ? `Too many paying customers are cancelling (${m.churnRate}).`
        : `More visitors could become paying customers (${visitToPaidPct.toFixed(1)}% right now).`;

  return {
    status: 'OPTIMIZE',
    title: `Making money, but checkout needs a tweak`,
    body: `${project.name} earns $${mrr.toLocaleString()}/month, which is a great start. ${leakHint} Let people try one thing for free before asking for a credit card.`,
    fixPrompt: `In ${project.name}, let new users try 1 free action without entering a credit card first, then show a clean upgrade screen on their second try.`,
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
        note: `Open Cursor in ${project.name}, press Cmd+I (or Ctrl+I), and paste this message:`,
        prompt: `Connect ${project.name} (${domain}) to my VibeBoard dashboard (key: "${key}"):
1. Add <script defer data-project="${key}" src="${TRACKER_URL}"></script> to the main HTML layout.
2. Call window.vb?.track('signup') whenever a user signs up.
3. Send Stripe payment webhooks (checkout.session.completed & customer.subscription.deleted) to ${INGEST_URL}?key=${key}.`,
      };
    case 'Lovable':
      return {
        note: `Paste this directly into your Lovable chat for ${project.name}:`,
        prompt: `Connect ${project.name} (${domain}) to VibeBoard (key: ${key}). Add <script defer data-project="${key}" src="${TRACKER_URL}"></script> to index.html, call window.vb?.track('signup') after someone signs up, and forward Stripe payment webhooks to ${INGEST_URL}?key=${key}.`,
      };
    case 'Bolt':
      return {
        note: `Paste this into your Bolt.new chat for ${project.name}:`,
        prompt: `Connect ${project.name} to VibeBoard (key: ${key}). Add <script defer data-project="${key}" src="${TRACKER_URL}"></script> to index.html, track signups with window.vb?.track('signup'), and send Stripe payment webhooks to ${INGEST_URL}?key=${key}.`,
      };
    case 'v0':
      return {
        note: `Paste this into your v0 chat for ${project.name}:`,
        prompt: `Add VibeBoard to app/layout.tsx using next/script with strategy="afterInteractive", src="${TRACKER_URL}", and data-project="${key}". Call window.vb?.track('signup') when users sign up on ${domain}.`,
      };
    case 'Claude Code':
      return {
        note: `Run this command inside your ${project.name} project folder:`,
        prompt: `claude "Connect VibeBoard (${key}) to ${project.name}: add <script defer data-project=\\"${key}\\" src=\\"${TRACKER_URL}\\"></script> to the root HTML, track signups with window.vb?.track('signup'), and forward Stripe webhooks to ${INGEST_URL}?key=${key}."`,
      };
  }
}

export function formatEventLabel(type: string, rawLabel: string): string {
  if (type === 'revenue') return 'New Payment';
  if (type === 'signup') return 'New Signup';
  if (type === 'dropoff') return 'Left Checkout';
  if (type === 'deploy') return 'App Updated';
  if (type === 'visitor') return 'Website Visit';
  return rawLabel;
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
