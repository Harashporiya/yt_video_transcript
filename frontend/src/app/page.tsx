"use client"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquareText, Sparkles, BookOpenText, Target, Play } from "lucide-react";
import { YoutubeLogoIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#000000] text-[#ededed] selection:bg-gray-700/50 overflow-x-hidden font-sans">
      
      {/* Navbar */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${scrolled ? 'bg-black/60 backdrop-blur-md border-white/10 py-3' : 'bg-transparent border-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <YoutubeLogoIcon size={24} className="text-white" weight="fill" />
            <span className="font-semibold text-lg tracking-tight">Transcripter</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="#pricing" className="text-sm font-medium text-gray-400 hover:text-white transition-colors hidden sm:block">
              Pricing
            </Link>
            <Link href="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors hidden sm:block">
              Log in
            </Link>
            <Link href="/signup">
              <Button className="bg-white text-black hover:bg-gray-200 rounded-full h-9 px-5 text-sm font-semibold transition-transform active:scale-95">
                Start for free
              </Button>
            </Link>
          </nav>
        </div>
      </header>


      {/* Hero Section */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 overflow-hidden">
        {/* Subtle Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 flex flex-col items-center text-center pt-8">
          <h1 className="text-5xl md:text-7xl lg:text-[6.5rem] font-bold tracking-tighter leading-[1.05] max-w-5xl mb-8">
            Stop watching. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-500">Start learning.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed font-light">
            Drop a YouTube link and instantly get the full transcript, structured summaries, and a chat interface to ask questions. Save hours of your time.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            <Link href="/signup">
              <Button className="bg-white text-black hover:bg-gray-200 h-12 px-8 rounded-full text-base font-medium transition-transform hover:scale-105 active:scale-95 group">
                Get Started <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" className="h-12 px-8 rounded-full border-white/10 hover:bg-white/5 text-white bg-transparent transition-colors group">
                <Play className="mr-2 w-4 h-4 text-gray-400 group-hover:text-white" /> View Features
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Abstract Mockup / Visual separator */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-20 -mt-8 md:-mt-12 mb-32">
        <div className="w-full aspect-video md:aspect-[21/9] rounded-2xl md:rounded-[2rem] border border-white/10 bg-[#0a0a0a] shadow-2xl shadow-black/50 overflow-hidden relative group">
          {/* Mockup UI Inner */}
          <div className="absolute top-0 w-full h-12 border-b border-white/10 flex items-center px-4 gap-2 bg-black/40 backdrop-blur-md z-20">
             <div className="w-3 h-3 rounded-full bg-red-500/80" />
             <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
             <div className="w-3 h-3 rounded-full bg-green-500/80" />
             <div className="ml-4 w-64 h-6 rounded-md bg-white/5 border border-white/10 flex items-center px-3">
               <span className="text-[10px] text-gray-500">youtube.com/watch?v=...</span>
             </div>
          </div>
          {/* Inner Content */}
          <div className="pt-12 p-6 h-full flex flex-col md:flex-row gap-6 relative z-10 bg-[#050505]">
             <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 pointer-events-none" />
             {/* Left sidebar fake */}
             <div className="hidden md:flex w-1/4 h-full rounded-xl bg-white/[0.02] border border-white/5 p-4 flex-col gap-3">
               <div className="h-4 w-24 bg-white/10 rounded-sm mb-4" />
               <div className="h-3 w-full bg-white/5 rounded-sm" />
               <div className="h-3 w-full bg-white/5 rounded-sm" />
               <div className="h-3 w-3/4 bg-white/5 rounded-sm" />
             </div>
             {/* Right content fake */}
             <div className="flex-1 h-full rounded-xl bg-white/[0.02] border border-white/5 p-4 flex flex-col gap-4">
               <div className="h-8 w-48 bg-white/10 rounded-md" />
               <div className="flex-1 rounded-lg bg-black/50 border border-white/5 p-4 flex flex-col justify-end relative overflow-hidden">
                 <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[size:20px_20px]" />
                 <div className="self-end h-10 w-3/4 max-w-sm bg-white/10 rounded-xl rounded-br-none mb-4 relative z-10" />
                 <div className="self-start h-16 w-2/3 max-w-md bg-white/5 rounded-xl rounded-bl-none border border-white/5 relative z-10" />
               </div>
             </div>
          </div>
          
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30 backdrop-blur-[2px]">
            <Link href="/signup">
              <Button className="bg-white text-black rounded-full shadow-2xl font-semibold px-8 h-12">Try the Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-24 border-t border-white/10 bg-[#020202]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-16 md:mb-24 md:text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Built for deep work.</h2>
            <p className="text-gray-400 text-lg md:text-xl font-light">
              Stop scrubbing through timelines. Our tools are designed to extract precisely what you need, instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            
            {/* Feature 1 */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 hover:bg-[#111] transition-colors duration-300 group flex flex-col">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-white/10 transition-colors">
                <BookOpenText className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">Structured Summaries</h3>
              <p className="text-gray-400 text-base leading-relaxed flex-1">
                Turn lengthy tutorials into concise, readable formats. We extract key takeaways and structure them perfectly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 hover:bg-[#111] transition-colors duration-300 group flex flex-col">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-white/10 transition-colors">
                <MessageSquareText className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">Contextual Chat</h3>
              <p className="text-gray-400 text-base leading-relaxed flex-1">
                Ask questions directly to the video. Our AI knows the exact timestamps and context to give you precise answers.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 hover:bg-[#111] transition-colors duration-300 group flex flex-col md:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-white/10 transition-colors">
                <Target className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">Interview Simulation</h3>
              <p className="text-gray-400 text-base leading-relaxed flex-1">
                Generate practice questions (Easy, Medium, Hard) based on the video to test your understanding before the real deal.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-32 border-t border-white/10 relative overflow-hidden bg-black">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.02] rounded-full pointer-events-none blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
                From URL to insights <br className="hidden md:block"/> in <span className="text-gray-400 font-light italic">three</span> steps.
              </h2>
              <p className="text-gray-400 text-lg mb-10 max-w-md font-light">
                We've stripped away the complexity. No settings to configure, no parameters to tweak.
              </p>
              
              <div className="flex flex-col gap-10">
                {[
                  { step: "01", title: "Copy & Paste", desc: "Grab any public YouTube link and drop it into the dashboard." },
                  { step: "02", title: "Instant Processing", desc: "Our engine bypasses rate limits to fetch transcripts instantly." },
                  { step: "03", title: "Start Learning", desc: "Read the summary, chat with the AI, or take a mock interview." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 group">
                    <span className="text-xs font-mono text-gray-600 group-hover:text-white transition-colors pt-1 shrink-0">
                      {item.step}
                    </span>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">{item.title}</h4>
                      <p className="text-gray-400 leading-relaxed text-sm font-light">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Visual element for workflow */}
            <div className="relative h-[400px] md:h-[500px] rounded-3xl bg-[#0a0a0a] border border-white/10 p-8 overflow-hidden group">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#ffffff05,transparent_60%)]" />
               <div className="flex flex-col gap-4 h-full relative z-10">
                 {/* Fake Input */}
                 <div className="w-full h-12 bg-black border border-white/10 rounded-xl flex items-center px-4 shadow-xl">
                   <div className="w-full h-3 bg-white/5 rounded-sm overflow-hidden relative">
                      <div className="absolute top-0 left-0 h-full w-1/3 bg-gray-600 animate-[shimmer_2.5s_infinite]" />
                   </div>
                 </div>
                 {/* Fake Results Cards */}
                 <div className="flex-1 flex flex-col gap-4 mt-6">
                   <div className="w-full h-20 bg-white/5 border border-white/5 rounded-xl group-hover:-translate-y-1 transition-transform duration-500 shadow-md" />
                   <div className="w-3/4 h-20 bg-white/5 border border-white/5 rounded-xl group-hover:-translate-y-1 transition-transform duration-500 delay-75 shadow-md" />
                   <div className="w-5/6 h-20 bg-white/5 border border-white/5 rounded-xl group-hover:-translate-y-1 transition-transform duration-500 delay-150 shadow-md" />
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing Section */}
      <section id="pricing" className="py-32 border-t border-white/10 bg-[#020202] relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">

          {/* Heading */}
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 text-violet-400 text-xs font-semibold mb-6 tracking-wider uppercase">
              ✦ Simple Pricing
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">
              Start free.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-amber-400">
                Upgrade anytime.
              </span>
            </h2>
            <p className="text-gray-400 text-lg font-light">
              No hidden fees. Cancel whenever you want.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

            {/* ── Free Plan ── */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 flex flex-col">
              <div className="mb-8">
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Free</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-5xl font-bold text-white">₹0</span>
                </div>
                <p className="text-gray-500 text-sm mt-2">Forever free, no card needed</p>
              </div>

              {/* Features */}
              <ul className="flex-1 space-y-4 mb-10">
                {[
                  { text: "1 video total", included: true },
                  { text: "3 chat messages / video", included: true },
                  { text: "AI Summary", included: true },
                  { text: "Interview Questions", included: true },
                  { text: "More videos", included: false },
                  { text: "Unlimited chats", included: false },
                  { text: "Priority support", included: false },
                ].map((f) => (
                  <li key={f.text} className="flex items-center gap-3 text-sm">
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${f.included ? "bg-white/10 text-white" : "bg-white/5 text-white/20"}`}>
                      {f.included ? "✓" : "✕"}
                    </span>
                    <span className={f.included ? "text-gray-300" : "text-gray-600"}>{f.text}</span>
                  </li>
                ))}
              </ul>

              <Link href="/signup">
                <Button className="w-full h-12 rounded-xl border border-white/10 bg-transparent hover:bg-white/5 text-white font-semibold transition-colors">
                  Start for free
                </Button>
              </Link>
            </div>

            {/* ── Pro Monthly — Recommended ── */}
            <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 to-transparent p-8 flex flex-col relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[11px] font-bold px-4 py-1.5 rounded-full tracking-widest uppercase shadow-lg shadow-amber-500/30">
                Most Popular
              </div>

              <div className="mb-8">
                <p className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">Pro Monthly</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-5xl font-bold text-white">₹199</span>
                  <span className="text-gray-400 text-sm mb-2">/month</span>
                </div>
                <p className="text-gray-500 text-sm mt-2">Perfect for regular learners</p>
              </div>

              <ul className="flex-1 space-y-4 mb-10">
                {[
                  "5 videos per month",
                  "15 chat messages / video",
                  "AI Summary",
                  "Interview Questions",
                  "Priority support",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-[11px] font-bold">✓</span>
                    <span className="text-gray-200">{f}</span>
                  </li>
                ))}
              </ul>

              <Link href="/signup">
                <Button className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-amber-500/20">
                  Get Pro Monthly
                </Button>
              </Link>
            </div>

            {/* ── Pro Yearly — Best Value ── */}
            <div className="rounded-3xl border border-violet-500/30 bg-gradient-to-b from-violet-500/10 to-transparent p-8 flex flex-col relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-violet-500 text-white text-[11px] font-bold px-4 py-1.5 rounded-full tracking-widest uppercase shadow-lg shadow-violet-500/30">
                Save 58%
              </div>

              <div className="mb-8">
                <p className="text-sm font-semibold text-violet-400 uppercase tracking-wider mb-3">Pro Yearly</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-5xl font-bold text-white">₹999</span>
                  <span className="text-gray-400 text-sm mb-2">/year</span>
                </div>
                <p className="text-gray-500 text-sm mt-2">
                  <span className="line-through text-gray-600">₹2,388</span>
                  <span className="text-violet-400 font-semibold ml-2">Best value deal</span>
                </p>
              </div>

              <ul className="flex-1 space-y-4 mb-10">
                {[
                  "30 videos per year",
                  "35 chat messages / video",
                  "AI Summary",
                  "Interview Questions",
                  "Priority support",
                  "Early access to new features",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-violet-400 text-[11px] font-bold">✓</span>
                    <span className="text-gray-200">{f}</span>
                  </li>
                ))}
              </ul>

              <Link href="/signup">
                <Button className="w-full h-12 rounded-xl bg-violet-500 hover:bg-violet-400 text-white font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-violet-500/20">
                  Get Pro Yearly
                </Button>
              </Link>
            </div>
          </div>

          {/* Comparison table — what's in free vs pro */}
          <div className="mt-20 rounded-3xl border border-white/10 bg-white/[0.01] overflow-hidden">
            <div className="grid grid-cols-4 gap-0 text-sm">
              {/* Header */}
              <div className="p-6 border-b border-white/10 text-gray-500 font-semibold uppercase tracking-wider text-xs">Feature</div>
              <div className="p-6 border-b border-l border-white/10 text-center font-semibold text-white/50">Free</div>
              <div className="p-6 border-b border-l border-white/10 text-center font-semibold text-amber-400 bg-amber-500/5">Pro Monthly</div>
              <div className="p-6 border-b border-l border-white/10 text-center font-semibold text-violet-400 bg-violet-500/5">Pro Yearly</div>

              {/* Rows */}
              {[
                { feature: "Videos processed", free: "1 total", monthly: "5 / month", yearly: "30 / year" },
                { feature: "Chat messages", free: "3 / video", monthly: "15 / video", yearly: "35 / video" },
                { feature: "AI Summary", free: "✓", monthly: "✓", yearly: "✓" },
                { feature: "Interview Questions", free: "✓", monthly: "✓", yearly: "✓" },
                { feature: "Video length", free: "Short videos", monthly: "Up to 1 hr", yearly: "Any length" },
                { feature: "Priority support", free: "—", monthly: "✓", yearly: "✓" },
                { feature: "Early features", free: "—", monthly: "—", yearly: "✓" },
              ].map((row, i) => (
                <div key={row.feature} className={`contents ${i % 2 === 0 ? "" : "bg-white/[0.01]"}`}>
                  <div className="p-5 border-b border-white/5 text-gray-400 font-medium">{row.feature}</div>
                  <div className="p-5 border-b border-l border-white/5 text-center text-gray-500">{row.free}</div>
                  <div className="p-5 border-b border-l border-white/5 text-center text-gray-200 bg-amber-500/[0.03]">{row.monthly}</div>
                  <div className="p-5 border-b border-l border-white/5 text-center text-gray-200 bg-violet-500/[0.03]">{row.yearly}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Security note */}
          <p className="text-center text-gray-600 text-xs mt-8">
            🔒 Payments secured by Razorpay · No card stored · Cancel anytime
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 border-t border-white/10 bg-[#020202] relative">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[50%] bg-gradient-to-t from-white/[0.02] to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8 text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">
            Start learning efficiently.
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/signup">
              <Button className="bg-white text-black hover:bg-gray-200 h-12 px-8 rounded-full text-base font-semibold transition-transform hover:scale-105 active:scale-95 w-full sm:w-auto shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                Create free account
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="h-12 px-8 rounded-full border-white/10 hover:bg-white/5 text-white bg-transparent w-full sm:w-auto font-medium">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="py-12 border-t border-white/10 text-gray-500 text-sm bg-black">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-gray-400">
            <YoutubeLogoIcon size={20} weight="fill" className="text-gray-300" />
            <span className="font-semibold text-gray-300">Transcripter</span>
            <span className="ml-4 text-gray-600">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-8 font-medium">
            <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-white transition-colors">GitHub</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}} />
    </div>
  );
}