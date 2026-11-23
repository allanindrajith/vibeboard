import { useState } from 'react';
import { Check } from 'lucide-react';

interface PricingSectionProps {
  onSelectPlan: (plan: string) => void;
}

export function PricingSection({ onSelectPlan }: PricingSectionProps) {
  const [annual, setAnnual] = useState(true);

  const tiers = [
    {
      name: 'Weekend Shipper',
      price: 0,
      desc: 'For your first few experiments. No credit card required.',
      features: [
        'Up to 3 vibecoded projects',
        '10,000 events / month',
        '1-prompt Cursor / Lovable install',
        'Basic Visitor → Signup funnel',
      ],
      cta: 'Start Free',
      highlight: false,
    },
    {
      name: 'Serial Vibecoder',
      price: annual ? 15 : 19,
      desc: 'For builders shipping a new app every week who want real MRR.',
      features: [
        'Unlimited projects in one portfolio',
        '500,000 events / month',
        'Live Stripe, LemonSqueezy & Polar sync',
        'AI Kill / Scale verdicts + 1-click fix prompts',
        'Git commit → revenue overlay',
      ],
      cta: 'Claim Early Access',
      highlight: true,
    },
    {
      name: 'Indie Studio',
      price: annual ? 39 : 49,
      desc: 'For small studios running 10+ revenue-generating micro-SaaS.',
      features: [
        'Everything in Serial Vibecoder',
        '2M events / month',
        'MCP Server for Claude Code & Cursor queries',
        '5 team seats + Slack/Discord MRR alerts',
        'Custom white-label dashboard domain',
      ],
      cta: 'Join Studio Beta',
      highlight: false,
    },
  ];

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-24">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Priced for builders, not enterprise procurement.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-base text-zinc-400">
          One subscription covers every weekend app you ship. Cancel with one click if nothing hits
          MRR.
        </p>

        {/* Billing Toggle */}
        <div className="mt-7 inline-flex items-center gap-3 rounded-full border border-white/10 bg-zinc-900/70 p-1 text-xs">
          <button
            type="button"
            onClick={() => setAnnual(false)}
            className={`rounded-full px-3.5 py-1.5 font-medium transition ${
              !annual ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setAnnual(true)}
            className={`rounded-full px-3.5 py-1.5 font-medium transition ${
              annual ? 'bg-emerald-500/20 text-emerald-300' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Annual <span className="ml-1 font-mono text-[10px] text-emerald-400">-20%</span>
          </button>
        </div>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`relative flex flex-col rounded-2xl border p-6 ${
              tier.highlight
                ? 'border-emerald-500/40 bg-gradient-to-b from-emerald-500/[0.08] to-zinc-950 shadow-xl shadow-emerald-950/30'
                : 'border-white/10 bg-zinc-900/40'
            }`}
          >
            {tier.highlight && (
              <span className="absolute -top-3 right-6 rounded-full border border-emerald-400/30 bg-emerald-500 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-zinc-950">
                MOST POPULAR
              </span>
            )}
            <div className="text-sm font-semibold text-white">{tier.name}</div>
            <p className="mt-1.5 text-xs text-zinc-400">{tier.desc}</p>

            <div className="mt-6 flex items-baseline gap-1">
              <span className="font-mono text-4xl font-bold text-white">${tier.price}</span>
              <span className="text-xs text-zinc-500">/month</span>
            </div>

            <ul className="mt-6 flex-1 space-y-3 text-xs text-zinc-300">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => onSelectPlan(tier.name)}
              className={`mt-8 w-full rounded-xl py-2.5 text-xs font-semibold transition ${
                tier.highlight
                  ? 'bg-emerald-400 text-zinc-950 hover:bg-emerald-300'
                  : 'border border-white/15 bg-zinc-900 text-white hover:border-white/30 hover:bg-zinc-800'
              }`}
            >
              {tier.cta}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
