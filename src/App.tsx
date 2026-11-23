import { type FormEvent, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Check,
  CreditCard,
  GitBranch,
  Layers,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { InteractiveDashboard } from './components/InteractiveDashboard';
import { PromptSetupSection } from './components/PromptSetupSection';
import { PricingSection } from './components/PricingSection';

export default function App() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleWaitlist = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  const scrollToWaitlist = (plan?: string) => {
    if (plan) setSelectedPlan(plan);
    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#09090b]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <a href="#" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/15">
              <BarChart3 className="h-4 w-4 text-emerald-400" />
            </div>
            <span className="text-base font-bold tracking-tight text-white">VibeBoard</span>
            <span className="hidden rounded border border-white/10 bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 sm:inline">
              BETA
            </span>
          </a>

          <nav className="hidden items-center gap-7 text-xs font-medium text-zinc-400 md:flex">
            <a href="#dashboard" className="transition hover:text-white">
              Live Demo
            </a>
            <a href="#why" className="transition hover:text-white">
              Why VibeBoard
            </a>
            <a href="#setup" className="transition hover:text-white">
              1-Prompt Setup
            </a>
            <a href="#pricing" className="transition hover:text-white">
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/allanindrajith/vibeboard"
              target="_blank"
              rel="noreferrer"
              className="hidden text-xs font-medium text-zinc-400 transition hover:text-white sm:inline"
            >
              GitHub
            </a>
            <button
              type="button"
              onClick={() => scrollToWaitlist()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-400 px-3.5 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-emerald-300"
            >
              Get Early Access
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero + Interactive Dashboard */}
      <section id="dashboard" className="relative overflow-hidden bg-grid-pattern pt-20 pb-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900/80 px-3 py-1 text-xs text-zinc-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-dot" />
              Ship-to-Revenue analytics for Cursor, Lovable, Bolt & v0 builders
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-6xl sm:leading-[1.08]">
              You shipped 11 apps.
              <br />
              <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Which one makes money?
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
              One unified dashboard across every weekend app you vibe-coded. Track{' '}
              <span className="text-zinc-200">visitors → signups → Stripe MRR → churn</span> with
              zero event schemas and plain-English Kill/Scale verdicts.
            </p>

            {/* Inline Waitlist Form */}
            <form
              id="waitlist"
              onSubmit={handleWaitlist}
              className="mx-auto mt-8 flex max-w-md flex-col gap-2.5 sm:flex-row"
            >
              {submitted ? (
                <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-300">
                  <Check className="h-4 w-4" />
                  You're on the VibeBoard beta list
                  {selectedPlan ? ` (${selectedPlan})` : ''}. We'll send your project key soon.
                </div>
              ) : (
                <>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="founder@yourdomain.com"
                    className="flex-1 rounded-xl border border-white/15 bg-zinc-950/90 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-emerald-400"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300"
                  >
                    Claim Key
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </form>

            <div className="mt-3 font-mono text-[11px] text-zinc-500">
              Free for up to 3 apps · 1-prompt install · No GA4 bloat
            </div>
          </div>

          {/* Interactive Portfolio Dashboard */}
          <InteractiveDashboard />
        </div>
      </section>

      {/* Anti-Vanity Comparison */}
      <section id="why" className="border-y border-white/10 bg-zinc-950/50 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              GA4 was built for enterprise marketers.
              <br />
              <span className="text-zinc-400">You shipped this app at 2 AM.</span>
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {/* Old Way */}
            <div className="rounded-2xl border border-rose-500/15 bg-zinc-900/40 p-6">
              <div className="font-mono text-xs font-semibold text-rose-400">THE OLD WAY</div>
              <h3 className="mt-2 text-lg font-semibold text-white">
                5 browser tabs and zero answers
              </h3>
              <ul className="mt-5 space-y-3 text-sm text-zinc-400">
                {[
                  'Separate PostHog / Plausible / GA4 tabs for every side project',
                  'Manually writing tracking events & SQL funnels you never check',
                  'Vanity pageview spikes that hide $0 Stripe conversion',
                  'No idea whether Tuesday’s Cursor refactor helped or broke checkout',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* VibeBoard Way */}
            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.04] p-6">
              <div className="font-mono text-xs font-semibold text-emerald-400">THE VIBEBOARD WAY</div>
              <h3 className="mt-2 text-lg font-semibold text-white">
                One Ship-to-Revenue cockpit
              </h3>
              <ul className="mt-5 space-y-3 text-sm text-zinc-200">
                {[
                  'All your weekend apps ranked side-by-side by real Stripe MRR',
                  'Paste 1 prompt into Cursor, Lovable, or Bolt—tracking auto-wires',
                  'Plain-English Kill / Optimize / Scale verdicts on every project',
                  '1-click fix prompts you paste straight back into your AI editor',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="max-w-2xl">
          <span className="font-mono text-xs text-emerald-400">BUILT FOR SERIAL SHIPPERS</span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Everything you need to double down on winners—and kill duds fast.
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            {
              icon: Layers,
              title: 'Multi-App Portfolio Rollup',
              desc: 'Track 20 vibe-coded domains under one login. Instantly compare visitor-to-paid conversion across every launch.',
            },
            {
              icon: CreditCard,
              title: 'Auto-Linked Stripe & Polar MRR',
              desc: 'Tie anonymous first clicks directly to Stripe charges, renewals, and cancellations—no manual UTM spreadsheets.',
            },
            {
              icon: Sparkles,
              title: 'AI Kill / Scale Verdicts',
              desc: 'Weekly blunt diagnosis on every app: where users bounce, why they didn’t pay, and a copyable prompt to fix it.',
            },
            {
              icon: GitBranch,
              title: 'Ship Velocity Overlay',
              desc: 'See your GitHub deploys pinned directly on the revenue chart so you know which prompt actually moved MRR.',
            },
            {
              icon: ShieldCheck,
              title: '1.2KB, Cookie-Free, Privacy-First',
              desc: 'Zero cookie banners, zero Core Web Vitals hit, and fully GDPR-friendly out of the box.',
            },
            {
              icon: BarChart3,
              title: 'MCP Server Built In',
              desc: 'Ask Claude Code or Cursor directly: "Why did ClipForge signups drop after yesterday’s deploy?"',
            },
          ].map((feat) => (
            <div
              key={feat.title}
              className="rounded-2xl border border-white/10 bg-zinc-900/40 p-6 transition hover:border-white/20"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
                <feat.icon className="h-5 w-5 text-emerald-400" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-white">{feat.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 1-Prompt Setup */}
      <div className="border-t border-white/10 bg-zinc-950/40">
        <PromptSetupSection />
      </div>

      {/* Pricing */}
      <div className="border-t border-white/10">
        <PricingSection onSelectPlan={(plan) => scrollToWaitlist(plan)} />
      </div>

      {/* Final CTA */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/10 via-zinc-900 to-zinc-950 px-8 py-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Stop guessing which weekend app deserves Monday.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-zinc-400 sm:text-base">
            Connect all your repos in 30 seconds and see real Ship-to-Revenue numbers across your
            entire portfolio.
          </p>
          <button
            type="button"
            onClick={() => scrollToWaitlist()}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300"
          >
            Get Early Access — Free
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-xs text-zinc-500 sm:flex-row">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-emerald-400" />
            <span className="font-semibold text-zinc-300">VibeBoard</span>
            <span>· Built for vibecoders who ship for revenue</span>
          </div>
          <div className="flex items-center gap-5 font-mono">
            <a
              href="https://vibeboard.itsallan.me"
              className="transition hover:text-zinc-300"
            >
              vibeboard.itsallan.me
            </a>
            <a
              href="https://github.com/allanindrajith/vibeboard"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-zinc-300"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
