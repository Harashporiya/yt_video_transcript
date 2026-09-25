"use client"
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRightIcon,
  ChatCircleTextIcon,
  ListBulletsIcon,
  TargetIcon,
  LinkIcon,
  SparkleIcon,
  LockSimpleIcon,
  CaretDownIcon,
  CheckIcon,
} from "@phosphor-icons/react";
import { BrandLogo } from "@/components/brand-logo";
import { FreePlanCard } from "@/components/pricing/free-plan-card";
import { ProPlanCard } from "@/components/pricing/pro-plan-card";
import { PLANS } from "@/components/pricing/plans";

const FEATURES = [
  {
    icon: ListBulletsIcon,
    title: "Structured summaries",
    desc: "A one-paragraph TL;DR, a detailed write-up and numbered key takeaways for every video.",
  },
  {
    icon: ChatCircleTextIcon,
    title: "Chat with the video",
    desc: "Ask follow-up questions and get answers grounded in what the speaker actually said.",
  },
  {
    icon: TargetIcon,
    title: "Interview practice",
    desc: "Easy, medium and hard questions with model answers, hidden until you're ready to check.",
  },
];

const STEPS = [
  { title: "Paste a link", desc: "Any public YouTube video with captions." },
  { title: "We read it for you", desc: "Transcript, summary and a searchable index, in about a minute." },
  { title: "Learn your way", desc: "Skim the summary, ask questions, or test yourself." },
];

const FAQS = [
  {
    q: "Which videos work?",
    a: "Public YouTube videos that have captions (auto-generated captions are fine). Very long videos may be too large for the free tier.",
  },
  {
    q: "Is Pro a subscription?",
    a: "No. You pay once for 30 days (monthly) or 365 days (yearly). Nothing renews automatically.",
  },
  {
    q: "How accurate are the answers?",
    a: "Answers are generated from the video's transcript, so they're only as good as the captions. Treat them as study help, not a source of truth.",
  },
];

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-white">
      {/* Navbar */}
      <header
        className={`fixed top-0 z-50 w-full border-b transition-all duration-300 ${
          scrolled ? "border-white/[0.08] bg-background/75 backdrop-blur-md" : "border-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <BrandLogo />
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link href="#features" className="hidden rounded-lg px-3 py-2 text-sm text-white/60 transition-colors hover:text-white md:block">Features</Link>
            <Link href="#pricing" className="hidden rounded-lg px-3 py-2 text-sm text-white/60 transition-colors hover:text-white sm:block">Pricing</Link>
            <Link href="/login" className="rounded-lg px-3 py-2 text-sm text-white/60 transition-colors hover:text-white">Log in</Link>
            <Link
              href="/signup"
              className="ml-1 inline-flex h-9 items-center rounded-full bg-white px-4 text-sm font-semibold text-black transition-all hover:bg-white/90 active:scale-95"
            >
              Start free
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-36 pb-16 md:pt-44">
        <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_55%_at_50%_0%,#000_60%,transparent_100%)]" />
        <div className="pointer-events-none absolute left-1/2 top-10 h-72 w-[42rem] max-w-full -translate-x-1/2 rounded-full bg-brand/15 blur-3xl" />

        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-5 text-center">
          <span className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-white/65 animate-in fade-in duration-700">
            <SparkleIcon size={14} weight="fill" className="text-brand" />
            AI study companion for YouTube
          </span>
          <h1 className="max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tighter text-balance md:text-7xl animate-in fade-in slide-in-from-bottom-3 duration-700">
            Stop watching.
            <span className="block text-white/40">Start understanding.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/55 text-pretty animate-in fade-in slide-in-from-bottom-3 duration-700 delay-100">
            Paste any YouTube link and get a clean summary, a chat that answers from the video, and interview questions to test yourself.
          </p>

          {/* Faux input CTA */}
          <Link
            href="/signup"
            className="group mt-10 flex w-full max-w-xl items-center gap-3 rounded-2xl border border-white/10 bg-surface p-2 pl-4 text-left shadow-2xl shadow-black/60 transition-colors hover:border-white/20 animate-in fade-in slide-in-from-bottom-3 duration-700 delay-200"
          >
            <LinkIcon size={18} weight="bold" className="shrink-0 text-white/35" />
            <span className="flex-1 truncate text-white/30">https://youtube.com/watch?v=…</span>
            <span className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-black transition-colors group-hover:bg-white/90">
              Try it free <ArrowRightIcon size={14} weight="bold" className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
          <p className="mt-3 text-xs text-white/35">Free forever plan · No card needed</p>
        </div>

        {/* Product mockup */}
        <div className="relative mx-auto mt-16 max-w-5xl px-5 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-2xl shadow-black">
            <div className="flex h-10 items-center gap-2 border-b border-white/[0.08] px-4">
              <span className="size-2.5 rounded-full bg-white/15" />
              <span className="size-2.5 rounded-full bg-white/15" />
              <span className="size-2.5 rounded-full bg-white/15" />
            </div>
            <div className="flex h-[22rem] md:h-[26rem]">
              {/* Sidebar */}
              <div className="hidden w-56 shrink-0 flex-col gap-2 border-r border-white/[0.08] bg-black/40 p-3 md:flex">
                <div className="mb-2 h-8 rounded-lg bg-white/90" />
                {[0.9, 0.7, 0.8, 0.6].map((w, i) => (
                  <div key={i} className={`flex items-center gap-2 rounded-lg p-1.5 ${i === 0 ? "bg-white/10" : ""}`}>
                    <div className="h-6 aspect-video rounded bg-white/10" />
                    <div className="h-2 rounded-full bg-white/15" style={{ width: `${w * 100}%` }} />
                  </div>
                ))}
              </div>
              {/* Content */}
              <div className="flex flex-1 flex-col gap-4 p-5 md:p-7 text-left">
                <div className="flex gap-1">
                  {["Chat", "Summary", "Interview prep"].map((t, i) => (
                    <span key={t} className={`rounded-lg px-3 py-1 text-xs ${i === 1 ? "bg-white/10 text-white" : "text-white/40"}`}>{t}</span>
                  ))}
                </div>
                <div className="rounded-xl border border-brand/20 bg-brand/[0.06] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-brand">TL;DR</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/80">
                    The talk explains how transformers replaced recurrence with attention, why that parallelises training, and the trade-offs in memory.
                  </p>
                </div>
                {["Attention lets every token look at every other token", "Positional encodings restore word order", "Cost grows quadratically with sequence length"].map((kp, i) => (
                  <div key={kp} className="flex items-center gap-3 rounded-lg border border-white/[0.07] bg-white/[0.02] p-2.5">
                    <span className="flex size-5 items-center justify-center rounded bg-white/[0.07] font-mono text-[10px] text-white/60">{i + 1}</span>
                    <span className="truncate text-sm text-white/70">{kp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute inset-x-0 -bottom-px h-32 bg-gradient-to-t from-background to-transparent" />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-20 border-t border-white/[0.08] py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">Built for learning, not scrubbing</h2>
            <p className="mt-4 text-lg text-white/50">Three tools, one video. Pick whichever fits how you learn.</p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="group rounded-2xl border border-white/[0.08] bg-surface p-7 transition-colors hover:border-white/15">
                <span className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] transition-colors group-hover:border-brand/30 group-hover:bg-brand/10">
                  <Icon size={20} weight="duotone" className="text-white/70 transition-colors group-hover:text-brand" />
                </span>
                <h3 className="mt-6 text-lg font-semibold tracking-tight">{title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-white/50">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-white/[0.08] py-24">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-center text-3xl font-semibold tracking-tight md:text-5xl">
            From link to insight in <span className="text-brand">three</span> steps
          </h2>
          <ol className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title} className="relative rounded-2xl border border-white/[0.08] p-7">
                <span className="font-mono text-sm text-brand">0{i + 1}</span>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-[15px] text-white/50">{step.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-20 border-t border-white/[0.08] py-24">
        <div className="mx-auto max-w-5xl px-5">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">Start free. Upgrade when you need more.</h2>
            <p className="mt-4 text-lg text-white/50">One-time payments. No subscriptions, nothing to cancel.</p>
          </div>

          <div className="mt-14 grid grid-cols-1 items-stretch gap-5 md:grid-cols-3">
            <FreePlanCard href="/signup" />
            <ProPlanCard planKey="monthly" plan={PLANS.monthly} href="/signup" />
            <ProPlanCard planKey="yearly" plan={PLANS.yearly} href="/signup" />
          </div>

          <p className="mt-8 flex items-center justify-center gap-2 text-xs text-white/35">
            <LockSimpleIcon size={14} weight="bold" /> Payments secured by Razorpay · We never store card details
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-white/[0.08] py-24">
        <div className="mx-auto max-w-3xl px-5">
          <h2 className="text-center text-3xl font-semibold tracking-tight md:text-4xl">Questions</h2>
          <div className="mt-10 divide-y divide-white/[0.08] rounded-2xl border border-white/[0.08]">
            {FAQS.map(({ q, a }) => (
              <details key={q} className="group px-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-medium [&::-webkit-details-marker]:hidden">
                  {q}
                  <CaretDownIcon size={16} className="shrink-0 text-white/40 transition-transform group-open:rotate-180" />
                </summary>
                <p className="-mt-1 pb-5 text-[15px] leading-relaxed text-white/55">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-white/[0.08] py-28">
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-64 w-[40rem] max-w-full -translate-x-1/2 rounded-full bg-brand/10 blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-5 text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-balance md:text-6xl">Your next video, understood.</h2>
          <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/50">
            {["Free forever plan", "No card needed", "Set up in seconds"].map((t) => (
              <li key={t} className="flex items-center gap-1.5"><CheckIcon size={14} weight="bold" className="text-brand" />{t}</li>
            ))}
          </ul>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/signup" className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 font-semibold text-black transition-all hover:bg-white/90 active:scale-95">
              Create free account
            </Link>
            <Link href="/login" className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 px-8 font-medium text-white transition-colors hover:bg-white/5">
              Log in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 text-sm text-white/40 md:flex-row">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" />
            <span>© {new Date().getFullYear()}</span>
          </div>
          <nav className="flex gap-6">
            <Link href="#features" className="transition-colors hover:text-white">Features</Link>
            <Link href="#pricing" className="transition-colors hover:text-white">Pricing</Link>
            <Link href="/login" className="transition-colors hover:text-white">Log in</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
