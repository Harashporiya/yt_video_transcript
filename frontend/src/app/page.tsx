"use client"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, MessageSquare, Briefcase, Globe, Zap, ChevronRight, PlayCircle } from "lucide-react";
import { YoutubeLogoIcon } from "@phosphor-icons/react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#212121] text-white font-sans selection:bg-red-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-[#383838] bg-[#212121]/90 backdrop-blur-md">
        <div className="flex items-center gap-2 cursor-pointer">
            <YoutubeLogoIcon size={32} className="text-red-500" weight="fill" />
            <span className="text-xl font-bold tracking-tight text-white/90">YouTube Video Transcripter</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
            Login
          </Link>
          <Link href="/signup">
            <Button className="bg-white text-black hover:bg-gray-200 font-semibold rounded-full px-6">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-16 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2f2f2f] border border-[#383838] text-sm text-white/80 mb-8 hover:bg-[#383838] transition-colors cursor-pointer">
          <Zap className="w-4 h-4 text-red-500" />
          <span>v2.0 is now live — Smarter, Faster, Multilingual</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70 leading-tight">
          Turn Any YouTube Video Into Interactive Knowledge
        </h1>
        
        <p className="text-lg md:text-xl text-white/60 max-w-2xl mb-10 leading-relaxed">
          Extract transcripts, generate instant summaries, chat with video content, and simulate mock interviews. All powered by advanced AI.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/signup">
            <Button size="lg" className="h-12 px-8 bg-[#ff0000] hover:bg-[#cc0000] text-white rounded-full text-base font-medium">
              Start for Free <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
          <Link href="#how-it-works">
            <Button size="lg" variant="outline" className="h-12 px-8 rounded-full border-[#383838] hover:bg-[#2f2f2f] text-white bg-transparent">
              <PlayCircle className="mr-2 w-5 h-5" /> How it Works
            </Button>
          </Link>
        </div>
      </main>

      {/* Features Bento Grid */}
      <section className="py-24 px-6 border-t border-[#383838]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Everything you need to master video content</h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">A complete suite of AI tools designed for learners, researchers, and professionals to extract maximum value from YouTube.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="md:col-span-2 bg-[#2f2f2f] hover:bg-[#383838] transition-colors duration-300 border border-[#383838] rounded-3xl p-8 md:p-10 relative overflow-hidden group cursor-pointer">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-3xl rounded-full -mr-20 -mt-20 transition-all duration-500 group-hover:bg-red-500/20" />
              <MessageSquare className="w-12 h-12 text-[#ff0000] mb-6" />
              <h3 className="text-2xl font-bold mb-3 text-white">Interactive Chat</h3>
              <p className="text-white/70 max-w-md text-lg">
                Ask specific questions about the video content. The AI acts as an expert on the video, ready to explain complex concepts or find exact details for you.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#2f2f2f] hover:bg-[#383838] transition-colors duration-300 border border-[#383838] rounded-3xl p-8 group relative overflow-hidden cursor-pointer">
              <FileText className="w-10 h-10 text-white/90 mb-6" />
              <h3 className="text-xl font-bold mb-3 text-white">Smart Summary</h3>
              <p className="text-white/70">
                Don't have time to watch a 2-hour lecture? Get AI-generated structured summaries and key takeaways instantly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#2f2f2f] hover:bg-[#383838] transition-colors duration-300 border border-[#383838] rounded-3xl p-8 group relative overflow-hidden cursor-pointer">
              <Globe className="w-10 h-10 text-white/90 mb-6" />
              <h3 className="text-xl font-bold mb-3 text-white">Full Transcript</h3>
              <p className="text-white/70">
                Extract and read the complete spoken text directly from the video. Easily search for specific keywords or quotes without scrubbing the timeline.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="md:col-span-2 bg-[#2f2f2f] hover:bg-[#383838] transition-colors duration-300 border border-[#383838] rounded-3xl p-8 md:p-10 relative overflow-hidden group cursor-pointer">
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 blur-3xl rounded-full -ml-20 -mb-20 transition-all duration-500 group-hover:bg-white/10" />
              <Briefcase className="w-12 h-12 text-white/90 mb-6" />
              <h3 className="text-2xl font-bold mb-3 text-white">AI Interview Prep</h3>
              <p className="text-white/70 max-w-md text-lg">
                Automatically generate categorized practice questions (Easy, Medium, Hard) based on educational or tutorial videos to test your knowledge.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Instructions / How it works */}
      <section id="how-it-works" className="py-24 px-6 bg-[#1a1a1a] border-t border-b border-[#383838] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-red-900/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">How it works</h2>
            <p className="text-white/60 text-lg">Get started in seconds. No complex setup required.</p>
          </div>

          <div className="space-y-12">
            {[
              {
                step: "01",
                title: "Create an Account",
                desc: "Sign up instantly using your Google account via our secure authentication flow.",
              },
              {
                step: "02",
                title: "Paste a YouTube Link",
                desc: "Drop any public YouTube video link into the dashboard. Our engine handles the extraction automatically.",
              },
              {
                step: "03",
                title: "Generate Insights",
                desc: "Receive a beautifully formatted summary and key takeaways from the video in seconds.",
              },
              {
                step: "04",
                title: "Interact & Learn",
                desc: "Dive deeper by chatting with our AI about the video's content or taking a generated mock interview.",
              }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-6 items-start md:items-center group">
                <div className="text-6xl font-black text-white/10 group-hover:text-[#ff0000]/30 transition-colors duration-300">{item.step}</div>
                <div className="flex-1">
                  <h4 className="text-2xl font-semibold mb-2 text-white">{item.title}</h4>
                  <p className="text-white/70 text-lg leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-32 px-6 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Ready to transform how you consume video?</h2>
          <p className="text-white/70 mb-10 text-xl">
            Join the future of learning today. Process your first video for free.
          </p>
          <Link href="/signup">
            <Button size="lg" className="h-14 px-10 bg-white text-black hover:bg-gray-200 rounded-full text-lg font-semibold shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] transition-shadow">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[#383838] text-center text-white/50 text-sm bg-[#212121]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <YoutubeLogoIcon size={24} className="text-red-500" weight="fill" />
            <span className="text-white font-medium">YouTube Video Transcripter</span>
            <span className="ml-2">© 2026 All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
}