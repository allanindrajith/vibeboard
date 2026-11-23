export type Timeframe = '7D' | '30D' | '90D';

export type ProjectVerdict = 'SCALE' | 'OPTIMIZE' | 'KILL_OR_PIVOT';

export interface ProjectMetrics {
  id: string;
  name: string;
  domain: string;
  builtWith: 'Cursor' | 'Lovable' | 'Bolt' | 'v0';
  shippedAgo: string;
  status: ProjectVerdict;
  verdictTitle: string;
  verdictBody: string;
  fixPrompt: string;
  metrics: Record<
    Timeframe,
    {
      visitors: number;
      signups: number;
      trials: number;
      paid: number;
      mrr: number;
      mrrDelta: string;
      churnRate: string;
      dailyRevenue: { label: string; revenue: number; visitors: number }[];
    }
  >;
}

export const PROJECTS: ProjectMetrics[] = [
  {
    id: 'promptdeck',
    name: 'PromptDeck',
    domain: 'promptdeck.app',
    builtWith: 'Cursor',
    shippedAgo: '19 days ago',
    status: 'SCALE',
    verdictTitle: 'Double Down — Strong Paid Pull',
    verdictBody:
      '6.4% visitor-to-paid conversion after your pricing page ship on Tue. Zero involuntary churn. Organic X/GitHub traffic converts 3.1x better than Product Hunt.',
    fixPrompt:
      'Add an annual plan toggle (20% off) to /pricing and trigger a Stripe upgrade banner after a user saves their 5th prompt.',
    metrics: {
      '7D': {
        visitors: 2840,
        signups: 492,
        trials: 248,
        paid: 62,
        mrr: 1798,
        mrrDelta: '+41.2%',
        churnRate: '1.8%',
        dailyRevenue: [
          { label: 'Mon', revenue: 174, visitors: 310 },
          { label: 'Tue', revenue: 261, visitors: 420 },
          { label: 'Wed', revenue: 232, visitors: 390 },
          { label: 'Thu', revenue: 319, visitors: 480 },
          { label: 'Fri', revenue: 290, visitors: 410 },
          { label: 'Sat', revenue: 203, visitors: 370 },
          { label: 'Sun', revenue: 319, visitors: 460 },
        ],
      },
      '30D': {
        visitors: 11420,
        signups: 1940,
        trials: 960,
        paid: 214,
        mrr: 6206,
        mrrDelta: '+68.4%',
        churnRate: '2.1%',
        dailyRevenue: [
          { label: 'W1', revenue: 980, visitors: 2100 },
          { label: 'W2', revenue: 1340, visitors: 2650 },
          { label: 'W3', revenue: 1790, visitors: 3120 },
          { label: 'W4', revenue: 2096, visitors: 3550 },
        ],
      },
      '90D': {
        visitors: 28900,
        signups: 4820,
        trials: 2340,
        paid: 486,
        mrr: 14094,
        mrrDelta: '+194%',
        churnRate: '2.4%',
        dailyRevenue: [
          { label: 'Sep', revenue: 2940, visitors: 6800 },
          { label: 'Oct', revenue: 4948, visitors: 10680 },
          { label: 'Nov', revenue: 6206, visitors: 11420 },
        ],
      },
    },
  },
  {
    id: 'clipforge',
    name: 'ClipForge',
    domain: 'clipforge.io',
    builtWith: 'Lovable',
    shippedAgo: '11 days ago',
    status: 'OPTIMIZE',
    verdictTitle: 'Leaky Checkout — 71% Drop at Stripe Redirect',
    verdictBody:
      'High top-of-funnel signups (18.9%), but users abandon when hit with a credit card gate before rendering their first clip. Unlock 1 free watermarked export.',
    fixPrompt:
      'In src/pages/Export.tsx, allow 1 free 720p watermarked export without Stripe checkout, then show the $19 Pro modal on download #2.',
    metrics: {
      '7D': {
        visitors: 4120,
        signups: 778,
        trials: 142,
        paid: 24,
        mrr: 456,
        mrrDelta: '+12.5%',
        churnRate: '4.6%',
        dailyRevenue: [
          { label: 'Mon', revenue: 57, visitors: 540 },
          { label: 'Tue', revenue: 38, visitors: 620 },
          { label: 'Wed', revenue: 76, visitors: 590 },
          { label: 'Thu', revenue: 95, visitors: 710 },
          { label: 'Fri', revenue: 57, visitors: 560 },
          { label: 'Sat', revenue: 76, visitors: 580 },
          { label: 'Sun', revenue: 57, visitors: 520 },
        ],
      },
      '30D': {
        visitors: 16200,
        signups: 3060,
        trials: 540,
        paid: 89,
        mrr: 1691,
        mrrDelta: '+19.0%',
        churnRate: '5.1%',
        dailyRevenue: [
          { label: 'W1', revenue: 342, visitors: 3800 },
          { label: 'W2', revenue: 399, visitors: 4100 },
          { label: 'W3', revenue: 494, visitors: 4180 },
          { label: 'W4', revenue: 456, visitors: 4120 },
        ],
      },
      '90D': {
        visitors: 31400,
        signups: 5910,
        trials: 1080,
        paid: 172,
        mrr: 3268,
        mrrDelta: '+34.2%',
        churnRate: '5.4%',
        dailyRevenue: [
          { label: 'Sep', revenue: 640, visitors: 6200 },
          { label: 'Oct', revenue: 937, visitors: 9000 },
          { label: 'Nov', revenue: 1691, visitors: 16200 },
        ],
      },
    },
  },
  {
    id: 'invoicebot',
    name: 'InvoiceBot',
    domain: 'invoicebot.co',
    builtWith: 'Bolt',
    shippedAgo: '34 days ago',
    status: 'SCALE',
    verdictTitle: 'Quiet Cash Cow — High Retention',
    verdictBody:
      'Low traffic volume, but 11.2% of visitors convert to paid and stay for 3+ months. Worth writing 5 SEO comparison pages instead of building new features.',
    fixPrompt:
      'Generate 3 landing pages targeting "simple freelance invoice generator" with an interactive PDF preview above the fold.',
    metrics: {
      '7D': {
        visitors: 690,
        signups: 148,
        trials: 96,
        paid: 31,
        mrr: 930,
        mrrDelta: '+22.8%',
        churnRate: '0.9%',
        dailyRevenue: [
          { label: 'Mon', revenue: 120, visitors: 95 },
          { label: 'Tue', revenue: 150, visitors: 108 },
          { label: 'Wed', revenue: 120, visitors: 92 },
          { label: 'Thu', revenue: 180, visitors: 118 },
          { label: 'Fri', revenue: 150, visitors: 104 },
          { label: 'Sat', revenue: 90, visitors: 81 },
          { label: 'Sun', revenue: 120, visitors: 92 },
        ],
      },
      '30D': {
        visitors: 2890,
        signups: 612,
        trials: 394,
        paid: 124,
        mrr: 3720,
        mrrDelta: '+29.4%',
        churnRate: '1.1%',
        dailyRevenue: [
          { label: 'W1', revenue: 810, visitors: 680 },
          { label: 'W2', revenue: 900, visitors: 720 },
          { label: 'W3', revenue: 1080, visitors: 800 },
          { label: 'W4', revenue: 930, visitors: 690 },
        ],
      },
      '90D': {
        visitors: 8140,
        signups: 1710,
        trials: 1120,
        paid: 342,
        mrr: 10260,
        mrrDelta: '+88.0%',
        churnRate: '1.2%',
        dailyRevenue: [
          { label: 'Sep', revenue: 2880, visitors: 2420 },
          { label: 'Oct', revenue: 3660, visitors: 2830 },
          { label: 'Nov', revenue: 3720, visitors: 2890 },
        ],
      },
    },
  },
  {
    id: 'tabzen',
    name: 'TabZen',
    domain: 'tabzen.xyz',
    builtWith: 'v0',
    shippedAgo: '6 days ago',
    status: 'KILL_OR_PIVOT',
    verdictTitle: 'Kill or Pivot — 1.9k Visitors, $0 MRR',
    verdictBody:
      'Hacker News spike drove 1,920 visitors and 214 signups, but 0% clicked upgrade. Users treat it as a free utility. Sunset or bundle into PromptDeck.',
    fixPrompt:
      'Add a 1-question exit survey on /dashboard asking "What would make you pay $9/mo for this?" and log answers to VibeBoard.',
    metrics: {
      '7D': {
        visitors: 1920,
        signups: 214,
        trials: 18,
        paid: 0,
        mrr: 0,
        mrrDelta: '0.0%',
        churnRate: '—',
        dailyRevenue: [
          { label: 'Mon', revenue: 0, visitors: 820 },
          { label: 'Tue', revenue: 0, visitors: 490 },
          { label: 'Wed', revenue: 0, visitors: 240 },
          { label: 'Thu', revenue: 0, visitors: 150 },
          { label: 'Fri', revenue: 0, visitors: 95 },
          { label: 'Sat', revenue: 0, visitors: 65 },
          { label: 'Sun', revenue: 0, visitors: 60 },
        ],
      },
      '30D': {
        visitors: 2140,
        signups: 238,
        trials: 21,
        paid: 0,
        mrr: 0,
        mrrDelta: '0.0%',
        churnRate: '—',
        dailyRevenue: [
          { label: 'W1', revenue: 0, visitors: 0 },
          { label: 'W2', revenue: 0, visitors: 0 },
          { label: 'W3', revenue: 0, visitors: 220 },
          { label: 'W4', revenue: 0, visitors: 1920 },
        ],
      },
      '90D': {
        visitors: 2140,
        signups: 238,
        trials: 21,
        paid: 0,
        mrr: 0,
        mrrDelta: '0.0%',
        churnRate: '—',
        dailyRevenue: [
          { label: 'Sep', revenue: 0, visitors: 0 },
          { label: 'Oct', revenue: 0, visitors: 0 },
          { label: 'Nov', revenue: 0, visitors: 2140 },
        ],
      },
    },
  },
];

export interface LiveEvent {
  id: string;
  project: string;
  type: 'revenue' | 'signup' | 'dropoff' | 'deploy';
  label: string;
  detail: string;
  time: string;
}

export const LIVE_EVENTS: LiveEvent[] = [
  {
    id: '1',
    project: 'PromptDeck',
    type: 'revenue',
    label: 'stripe.charge.succeeded',
    detail: '+$29.00 · Pro Monthly',
    time: '12s ago',
  },
  {
    id: '2',
    project: 'ClipForge',
    type: 'dropoff',
    label: 'checkout.abandoned',
    detail: '/export → Stripe wall',
    time: '48s ago',
  },
  {
    id: '3',
    project: 'InvoiceBot',
    type: 'revenue',
    label: 'stripe.subscription.renewed',
    detail: '+$30.00 · Month #3',
    time: '2m ago',
  },
  {
    id: '4',
    project: 'PromptDeck',
    type: 'deploy',
    label: 'git.push → main',
    detail: 'feat: annual pricing toggle',
    time: '9m ago',
  },
  {
    id: '5',
    project: 'TabZen',
    type: 'signup',
    label: 'auth.signup',
    detail: 'from news.ycombinator.com',
    time: '14m ago',
  },
];

export type BuilderTool = 'Cursor' | 'Lovable' | 'Bolt' | 'v0' | 'Claude Code';

export const INSTALL_PROMPTS: Record<BuilderTool, { prompt: string; note: string }> = {
  Cursor: {
    note: 'Paste into Composer (Cmd+I). Auto-detects Next.js, Vite, Remix, and Stripe webhooks.',
    prompt: `Install VibeBoard analytics for project "vb_live_98k2x":
1. Add <script defer data-project="vb_live_98k2x" src="https://cdn.vibeboard.itsallan.me/v1.js"></script> to root layout.
2. Call window.vb?.identify(user.id) on signup/login.
3. Forward Stripe checkout.session.completed & customer.subscription.deleted webhooks to https://api.vibeboard.itsallan.me/webhooks/stripe with header x-vb-key.`,
  },
  Lovable: {
    note: 'Drop straight into Lovable chat. Works with Supabase Auth + Stripe edge functions.',
    prompt: `Connect this app to VibeBoard (project ID: vb_live_98k2x). Add the VibeBoard script tag to index.html, fire window.vb?.track('signup') after Supabase auth succeeds, and mirror Stripe webhook revenue events to VibeBoard.`,
  },
  Bolt: {
    note: 'Works with Bolt.new React/Next/Astro templates in a single turn.',
    prompt: `Wire up VibeBoard Ship-to-Revenue tracking (project: vb_live_98k2x). Inject the 1.2KB script in index.html, track trial_started on pricing CTA clicks, and attach our Stripe webhook secret so MRR syncs automatically.`,
  },
  v0: {
    note: 'Add to your v0 generation or existing Vercel Next.js App Router project.',
    prompt: `Add VibeBoard to app/layout.tsx using next/script with strategy="afterInteractive" and data-project="vb_live_98k2x". Track signup and checkout_started events without blocking render.`,
  },
  'Claude Code': {
    note: 'Run in terminal. Also exposes the VibeBoard MCP server so Claude can query MRR.',
    prompt: `claude "Integrate VibeBoard (vb_live_98k2x): add the tracking script to the root HTML, instrument signup + checkout_abandoned events, and add our Stripe webhook forwarder. Verify build passes."`,
  },
};
