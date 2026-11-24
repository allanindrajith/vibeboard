export type Timeframe = '7D' | '30D' | '90D';

export type ProjectVerdict = 'SCALE' | 'OPTIMIZE' | 'KILL_OR_PIVOT';

export type BuilderTool = 'Cursor' | 'Lovable' | 'Bolt' | 'v0' | 'Claude Code';

export type AppView = 'overview' | 'projects' | 'events' | 'install';

export interface DailyPoint {
  label: string;
  revenue: number;
  visitors: number;
}

export interface TimeframeMetrics {
  visitors: number;
  signups: number;
  trials: number;
  paid: number;
  mrr: number;
  mrrDelta: string;
  churnRate: string;
  dailyRevenue: DailyPoint[];
}

export interface Project {
  id: string;
  apiKey: string;
  name: string;
  domain: string;
  builtWith: BuilderTool;
  shippedAgo: string;
  createdAt: string;
  notes?: string;
  metrics: Record<Timeframe, TimeframeMetrics>;
}

export type EventType = 'revenue' | 'signup' | 'dropoff' | 'deploy' | 'visitor';

export interface LiveEvent {
  id: string;
  projectId: string;
  projectName: string;
  type: EventType;
  label: string;
  detail: string;
  amount?: number;
  createdAt: string;
}

export interface ComputedVerdict {
  status: ProjectVerdict;
  title: string;
  body: string;
  fixPrompt: string;
  visitToSignupPct: number;
  signupToPaidPct: number;
  visitToPaidPct: number;
}

export interface NewProjectInput {
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

export interface NewEventInput {
  projectId: string;
  type: EventType;
  label: string;
  detail: string;
  amount?: number;
  count?: number;
}
