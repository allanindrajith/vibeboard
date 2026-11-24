import { useCallback, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type {
  BuilderTool,
  DailyPoint,
  EventType,
  LiveEvent,
  NewEventInput,
  NewProjectInput,
  Project,
  Timeframe,
  TimeframeMetrics,
} from '../types';

const STORAGE_KEY = 'vibeboard_workspace_v1';

interface WorkspaceState {
  projects: Project[];
  events: LiveEvent[];
}

interface DbProjectRow {
  id: string;
  user_id: string;
  api_key: string;
  name: string;
  domain: string;
  built_with: string;
  baseline_visitors: number;
  baseline_signups: number;
  baseline_trials: number;
  baseline_paid: number;
  baseline_mrr: number | string;
  churn_rate: string;
  created_at: string;
}

interface DbEventRow {
  id: string;
  project_id: string;
  user_id: string;
  type: EventType;
  label: string;
  detail: string;
  amount: number | string;
  count: number;
  created_at: string;
}

function generateApiKey(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let suffix = '';
  for (let i = 0; i < 10; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `vb_live_${suffix}`;
}

function formatShippedAgo(isoDate: string): string {
  const diffDays = Math.floor((Date.now() - new Date(isoDate).getTime()) / 86400_000);
  if (diffDays <= 0) return 'today';
  if (diffDays === 1) return '1d ago';
  return `${diffDays}d ago`;
}

function buildDailySeries(
  labels: string[],
  totalRevenue: number,
  totalVisitors: number
): DailyPoint[] {
  const weights = labels.map((_, idx) => 0.75 + (idx / Math.max(labels.length - 1, 1)) * 0.5);
  const weightSum = weights.reduce((a, b) => a + b, 0);
  return labels.map((label, idx) => ({
    label,
    revenue: Math.round((totalRevenue * weights[idx]) / weightSum),
    visitors: Math.round((totalVisitors * weights[idx]) / weightSum),
  }));
}

function buildProjectFromDb(row: DbProjectRow, projectEvents: DbEventRow[]): Project {
  const now = Date.now();
  const makeTf = (days: number, labels: string[], baselineMult: number): TimeframeMetrics => {
    const cutoff = now - days * 86400_000;
    const windowEvents = projectEvents.filter(
      (ev) => new Date(ev.created_at).getTime() >= cutoff
    );

    let evVisitors = 0;
    let evSignups = 0;
    let evPaid = 0;
    let evRevenue = 0;

    for (const ev of windowEvents) {
      if (ev.type === 'visitor') evVisitors += Number(ev.count) || 1;
      if (ev.type === 'signup') evSignups += Number(ev.count) || 1;
      if (ev.type === 'revenue') {
        evPaid += 1;
        evRevenue += Number(ev.amount) || 0;
      }
    }

    const visitors = Math.round(row.baseline_visitors * baselineMult) + evVisitors;
    const signups = Math.round(row.baseline_signups * baselineMult) + evSignups;
    const trials = Math.round(row.baseline_trials * baselineMult);
    const paid = Math.round(row.baseline_paid * baselineMult) + evPaid;
    const mrr = Math.round((Number(row.baseline_mrr) * baselineMult + evRevenue) * 100) / 100;

    const bucketMs = (days * 86400_000) / labels.length;
    const baseSeries = buildDailySeries(
      labels,
      Math.round(Number(row.baseline_mrr) * baselineMult),
      Math.round(row.baseline_visitors * baselineMult)
    );

    for (const ev of windowEvents) {
      const ageMs = Math.max(0, now - new Date(ev.created_at).getTime());
      const reverseIdx = Math.min(labels.length - 1, Math.floor(ageMs / bucketMs));
      const idx = labels.length - 1 - reverseIdx;
      if (ev.type === 'revenue') {
        baseSeries[idx].revenue = Math.round((baseSeries[idx].revenue + (Number(ev.amount) || 0)) * 100) / 100;
      } else if (ev.type === 'visitor') {
        baseSeries[idx].visitors += Number(ev.count) || 1;
      }
    }

    return {
      visitors,
      signups,
      trials,
      paid,
      mrr,
      mrrDelta: evRevenue > 0 ? `+$${Math.round(evRevenue)}` : mrr > 0 ? '+0.0%' : '0.0%',
      churnRate: row.churn_rate || '0.0%',
      dailyRevenue: baseSeries,
    };
  };

  return {
    id: row.id,
    apiKey: row.api_key,
    name: row.name,
    domain: row.domain,
    builtWith: (row.built_with as BuilderTool) || 'Cursor',
    shippedAgo: formatShippedAgo(row.created_at),
    createdAt: row.created_at,
    metrics: {
      '7D': makeTf(7, ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], 1),
      '30D': makeTf(30, ['W1', 'W2', 'W3', 'W4'], 1),
      '90D': makeTf(90, ['M1', 'M2', 'M3'], 1),
    },
  };
}

function createSeedState(): WorkspaceState {
  const now = Date.now();
  const projects: Project[] = [
    {
      id: 'promptdeck',
      apiKey: 'vb_live_98k2xp4a',
      name: 'PromptDeck',
      domain: 'promptdeck.app',
      builtWith: 'Cursor',
      shippedAgo: '19d ago',
      createdAt: new Date(now - 19 * 86400_000).toISOString(),
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
      apiKey: 'vb_live_31cf9m2q',
      name: 'ClipForge',
      domain: 'clipforge.io',
      builtWith: 'Lovable',
      shippedAgo: '11d ago',
      createdAt: new Date(now - 11 * 86400_000).toISOString(),
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
      apiKey: 'vb_live_77ib4t8w',
      name: 'InvoiceBot',
      domain: 'invoicebot.co',
      builtWith: 'Bolt',
      shippedAgo: '34d ago',
      createdAt: new Date(now - 34 * 86400_000).toISOString(),
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
      apiKey: 'vb_live_04tz6n9r',
      name: 'TabZen',
      domain: 'tabzen.xyz',
      builtWith: 'v0',
      shippedAgo: '6d ago',
      createdAt: new Date(now - 6 * 86400_000).toISOString(),
      metrics: {
        '7D': {
          visitors: 1920,
          signups: 214,
          trials: 18,
          paid: 0,
          mrr: 0,
          mrrDelta: '0.0%',
          churnRate: '0.0%',
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
          churnRate: '0.0%',
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
          churnRate: '0.0%',
          dailyRevenue: [
            { label: 'Sep', revenue: 0, visitors: 0 },
            { label: 'Oct', revenue: 0, visitors: 0 },
            { label: 'Nov', revenue: 0, visitors: 2140 },
          ],
        },
      },
    },
  ];

  const events: LiveEvent[] = [
    {
      id: 'ev-1',
      projectId: 'promptdeck',
      projectName: 'PromptDeck',
      type: 'revenue',
      label: 'stripe.charge.succeeded',
      detail: '+$29.00 · Pro Monthly',
      amount: 29,
      createdAt: new Date(now - 18_000).toISOString(),
    },
    {
      id: 'ev-2',
      projectId: 'clipforge',
      projectName: 'ClipForge',
      type: 'dropoff',
      label: 'checkout.abandoned',
      detail: '/export → Stripe wall',
      createdAt: new Date(now - 54_000).toISOString(),
    },
    {
      id: 'ev-3',
      projectId: 'invoicebot',
      projectName: 'InvoiceBot',
      type: 'revenue',
      label: 'stripe.subscription.renewed',
      detail: '+$30.00 · Month #3',
      amount: 30,
      createdAt: new Date(now - 140_000).toISOString(),
    },
    {
      id: 'ev-4',
      projectId: 'promptdeck',
      projectName: 'PromptDeck',
      type: 'deploy',
      label: 'git.push → main',
      detail: 'feat: annual pricing toggle',
      createdAt: new Date(now - 540_000).toISOString(),
    },
    {
      id: 'ev-5',
      projectId: 'tabzen',
      projectName: 'TabZen',
      type: 'signup',
      label: 'auth.signup',
      detail: 'referrer: news.ycombinator.com',
      createdAt: new Date(now - 840_000).toISOString(),
    },
  ];

  return { projects, events };
}

function loadLocalState(): WorkspaceState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createSeedState();
    const parsed = JSON.parse(raw) as WorkspaceState;
    if (!Array.isArray(parsed.projects) || !Array.isArray(parsed.events)) {
      return createSeedState();
    }
    return parsed;
  } catch {
    return createSeedState();
  }
}

export function useVibeBoard(user: User | null) {
  const [localState, setLocalState] = useState<WorkspaceState>(() => loadLocalState());
  const [cloudState, setCloudState] = useState<WorkspaceState>({ projects: [], events: [] });
  const [syncing, setSyncing] = useState(false);

  // Persist local mode state
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localState));
    } catch {
      // Ignore storage quota errors
    }
  }, [localState]);

  const fetchCloudWorkspace = useCallback(async () => {
    if (!user) return;
    setSyncing(true);
    try {
      const [projRes, evRes] = await Promise.all([
        supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(200),
      ]);

      if (projRes.error || evRes.error) return;

      const projRows = (projRes.data ?? []) as DbProjectRow[];
      const evRows = (evRes.data ?? []) as DbEventRow[];
      const projectNameById = new Map(projRows.map((p) => [p.id, p.name]));

      const projects = projRows.map((row) =>
        buildProjectFromDb(
          row,
          evRows.filter((e) => e.project_id === row.id)
        )
      );

      const events: LiveEvent[] = evRows.map((ev) => ({
        id: ev.id,
        projectId: ev.project_id,
        projectName: projectNameById.get(ev.project_id) ?? 'Unknown App',
        type: ev.type,
        label: ev.label,
        detail: ev.detail,
        amount: ev.type === 'revenue' ? Number(ev.amount) : undefined,
        createdAt: ev.created_at,
      }));

      setCloudState({ projects, events });
    } finally {
      setSyncing(false);
    }
  }, [user]);

  // Initial cloud fetch + Supabase Realtime subscription
  useEffect(() => {
    if (!user) return;
    fetchCloudWorkspace();

    const channel = supabase
      .channel(`vibeboard-realtime-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        () => {
          fetchCloudWorkspace();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        () => {
          fetchCloudWorkspace();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchCloudWorkspace]);

  const addProject = useCallback(
    async (input: NewProjectInput): Promise<Project | null> => {
      const cleanDomain =
        input.domain.replace(/^https?:\/\//, '').replace(/\/+$/, '') ||
        `${input.name.toLowerCase().replace(/[^a-z0-9]+/g, '')}.app`;
      const apiKey = generateApiKey();

      if (user) {
        const { data, error } = await supabase
          .from('projects')
          .insert({
            user_id: user.id,
            api_key: apiKey,
            name: input.name.trim(),
            domain: cleanDomain,
            built_with: input.builtWith,
            baseline_visitors: input.visitors,
            baseline_signups: input.signups,
            baseline_trials: input.trials,
            baseline_paid: input.paid,
            baseline_mrr: input.mrr,
            churn_rate: input.churnRate || '0.0%',
          })
          .select()
          .single();

        if (error || !data) return null;

        await supabase.from('events').insert({
          project_id: data.id,
          user_id: user.id,
          type: 'deploy',
          label: 'project.connected',
          detail: `${cleanDomain} · built with ${input.builtWith}`,
        });

        await fetchCloudWorkspace();
        return buildProjectFromDb(data as DbProjectRow, []);
      }

      // Local mode fallback
      const id = `${input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`;
      const nowIso = new Date().toISOString();
      const makeMetrics = (labels: string[], multiplier: number): TimeframeMetrics => {
        const visitors = Math.round(input.visitors * multiplier);
        const signups = Math.round(input.signups * multiplier);
        const trials = Math.round(input.trials * multiplier);
        const paid = Math.round(input.paid * multiplier);
        const mrr = Math.round(input.mrr * multiplier);
        return {
          visitors,
          signups,
          trials,
          paid,
          mrr,
          mrrDelta: mrr > 0 ? '+100%' : '0.0%',
          churnRate: input.churnRate || '0.0%',
          dailyRevenue: buildDailySeries(labels, mrr, visitors),
        };
      };

      const project: Project = {
        id,
        apiKey,
        name: input.name.trim(),
        domain: cleanDomain,
        builtWith: input.builtWith,
        shippedAgo: 'today',
        createdAt: nowIso,
        metrics: {
          '7D': makeMetrics(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], 1),
          '30D': makeMetrics(['W1', 'W2', 'W3', 'W4'], 3.2),
          '90D': makeMetrics(['Sep', 'Oct', 'Nov'], 6.5),
        },
      };

      const deployEvent: LiveEvent = {
        id: `ev-${Date.now().toString(36)}`,
        projectId: project.id,
        projectName: project.name,
        type: 'deploy',
        label: 'project.connected',
        detail: `${project.domain} · built with ${project.builtWith}`,
        createdAt: nowIso,
      };

      setLocalState((prev) => ({
        projects: [project, ...prev.projects],
        events: [deployEvent, ...prev.events].slice(0, 100),
      }));

      return project;
    },
    [user, fetchCloudWorkspace]
  );

  const updateProject = useCallback(
    async (
      id: string,
      timeframe: Timeframe,
      updates: {
        name?: string;
        domain?: string;
        builtWith?: BuilderTool;
        visitors?: number;
        signups?: number;
        trials?: number;
        paid?: number;
        mrr?: number;
        churnRate?: string;
      }
    ) => {
      if (user) {
        const payload: Record<string, unknown> = {};
        if (updates.name !== undefined) payload.name = updates.name.trim();
        if (updates.domain !== undefined) {
          payload.domain = updates.domain.replace(/^https?:\/\//, '').replace(/\/+$/, '');
        }
        if (updates.builtWith !== undefined) payload.built_with = updates.builtWith;
        if (updates.visitors !== undefined) payload.baseline_visitors = updates.visitors;
        if (updates.signups !== undefined) payload.baseline_signups = updates.signups;
        if (updates.trials !== undefined) payload.baseline_trials = updates.trials;
        if (updates.paid !== undefined) payload.baseline_paid = updates.paid;
        if (updates.mrr !== undefined) payload.baseline_mrr = updates.mrr;
        if (updates.churnRate !== undefined) payload.churn_rate = updates.churnRate;

        await supabase.from('projects').update(payload).eq('id', id);
        await fetchCloudWorkspace();
        return;
      }

      setLocalState((prev) => ({
        ...prev,
        projects: prev.projects.map((p) => {
          if (p.id !== id) return p;
          const currentTf = p.metrics[timeframe];
          const nextVisitors = updates.visitors ?? currentTf.visitors;
          const nextMrr = updates.mrr ?? currentTf.mrr;
          const labels = currentTf.dailyRevenue.map((d) => d.label);

          return {
            ...p,
            name: updates.name !== undefined ? updates.name.trim() || p.name : p.name,
            domain:
              updates.domain !== undefined
                ? updates.domain.replace(/^https?:\/\//, '').replace(/\/+$/, '') || p.domain
                : p.domain,
            builtWith: updates.builtWith ?? p.builtWith,
            metrics: {
              ...p.metrics,
              [timeframe]: {
                ...currentTf,
                visitors: nextVisitors,
                signups: updates.signups ?? currentTf.signups,
                trials: updates.trials ?? currentTf.trials,
                paid: updates.paid ?? currentTf.paid,
                mrr: nextMrr,
                churnRate: updates.churnRate ?? currentTf.churnRate,
                dailyRevenue:
                  updates.mrr !== undefined || updates.visitors !== undefined
                    ? buildDailySeries(labels, nextMrr, nextVisitors)
                    : currentTf.dailyRevenue,
              },
            },
          };
        }),
      }));
    },
    [user, fetchCloudWorkspace]
  );

  const deleteProject = useCallback(
    async (id: string) => {
      if (user) {
        await supabase.from('projects').delete().eq('id', id);
        await fetchCloudWorkspace();
        return;
      }

      setLocalState((prev) => ({
        projects: prev.projects.filter((p) => p.id !== id),
        events: prev.events.filter((e) => e.projectId !== id),
      }));
    },
    [user, fetchCloudWorkspace]
  );

  const logEvent = useCallback(
    async (input: NewEventInput) => {
      if (user) {
        await supabase.from('events').insert({
          project_id: input.projectId,
          user_id: user.id,
          type: input.type,
          label: input.label,
          detail: input.detail,
          amount: input.type === 'revenue' ? input.amount ?? 0 : 0,
          count: Math.max(1, input.count ?? 1),
        });
        await fetchCloudWorkspace();
        return;
      }

      setLocalState((prev) => {
        const target = prev.projects.find((p) => p.id === input.projectId);
        if (!target) return prev;

        const amount = input.amount ?? 0;
        const count = Math.max(1, input.count ?? 1);

        const newEvent: LiveEvent = {
          id: `ev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
          projectId: target.id,
          projectName: target.name,
          type: input.type,
          label: input.label,
          detail: input.detail,
          amount: input.type === 'revenue' ? amount : undefined,
          createdAt: new Date().toISOString(),
        };

        const updatedProjects = prev.projects.map((p) => {
          if (p.id !== target.id) return p;

          const mutateTf = (tf: TimeframeMetrics): TimeframeMetrics => {
            const nextSeries = tf.dailyRevenue.map((pt, idx) => {
              if (idx !== tf.dailyRevenue.length - 1) return pt;
              return {
                ...pt,
                revenue: input.type === 'revenue' ? pt.revenue + amount : pt.revenue,
                visitors: input.type === 'visitor' ? pt.visitors + count : pt.visitors,
              };
            });

            return {
              ...tf,
              visitors: input.type === 'visitor' ? tf.visitors + count : tf.visitors,
              signups: input.type === 'signup' ? tf.signups + count : tf.signups,
              paid: input.type === 'revenue' ? tf.paid + 1 : tf.paid,
              mrr: input.type === 'revenue' ? tf.mrr + amount : tf.mrr,
              dailyRevenue: nextSeries,
            };
          };

          return {
            ...p,
            metrics: {
              '7D': mutateTf(p.metrics['7D']),
              '30D': mutateTf(p.metrics['30D']),
              '90D': mutateTf(p.metrics['90D']),
            },
          };
        });

        return {
          projects: updatedProjects,
          events: [newEvent, ...prev.events].slice(0, 100),
        };
      });
    },
    [user, fetchCloudWorkspace]
  );

  const activeState = user ? cloudState : localState;

  const exportJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(activeState, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vibeboard-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [activeState]);

  const importJson = useCallback((rawJson: string): boolean => {
    try {
      const parsed = JSON.parse(rawJson) as WorkspaceState;
      if (!Array.isArray(parsed.projects) || !Array.isArray(parsed.events)) {
        return false;
      }
      setLocalState(parsed);
      return true;
    } catch {
      return false;
    }
  }, []);

  const resetDemoData = useCallback(() => {
    setLocalState(createSeedState());
  }, []);

  return {
    projects: activeState.projects,
    events: activeState.events,
    syncing,
    isCloud: Boolean(user),
    refreshCloud: fetchCloudWorkspace,
    addProject,
    updateProject,
    deleteProject,
    logEvent,
    exportJson,
    importJson,
    resetDemoData,
  };
}
