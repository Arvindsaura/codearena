import { Navbar } from "@/components/Navbar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Dashboard } from "@/components/Dashboard";

import { prisma } from "@/lib/prisma";

import { Bot, Code2, Rocket, Swords, Trophy, Activity, LogIn } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    const userWithDbData = { ...session.user, leetcodeUser: dbUser?.leetcodeUser };

    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto py-8 px-4 md:px-8">
          <Dashboard user={userWithDbData} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#09090b] text-zinc-50 font-sans selection:bg-fuchsia-500/30">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-4 pt-32 pb-24 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-fuchsia-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-1/2 w-[600px] h-[300px] bg-cyan-600/20 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="z-10 max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-fuchsia-300 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="w-4 h-4" />
            <span>The next generation of competitive coding</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100">
            Don&apos;t just grind LeetCode. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400">
              Conquer It.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-zinc-400 w-full md:w-3/4 mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
            Form private battle rooms, auto-sync your daily accepted problems, and let Gemini AI grade your absolute code quality. 
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <a href="/api/auth/signin" className="group relative inline-flex items-center gap-2 px-8 py-4 font-bold text-white bg-white/10 rounded-full overflow-hidden transition-all hover:bg-white/20 border border-white/20 hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(168,85,247,0.4)]">
              <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <LogIn className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Start Competing Now</span>
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 bg-zinc-950 border-t border-white/5 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Features built for the <span className="text-fuchsia-400">sweats</span>.</h2>
            <p className="text-zinc-400 text-lg">Everything you need to turn isolated algorithm practice into a multiplayer bloodbath.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-zinc-900/50 border border-white/10 p-8 rounded-3xl hover:bg-zinc-900 transition-colors">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-2xl flex items-center justify-center mb-6 border border-cyan-500/30">
                <Activity className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Zero-Click Auto Sync</h3>
              <p className="text-zinc-400 leading-relaxed">Connect your LeetCode username once. We quietly fetch and parse your daily submissions in the background.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-zinc-900/50 border border-white/10 p-8 rounded-3xl hover:bg-zinc-900 transition-colors">
              <div className="w-12 h-12 bg-fuchsia-500/20 rounded-2xl flex items-center justify-center mb-6 border border-fuchsia-500/30">
                <Swords className="w-6 h-6 text-fuchsia-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Private Battle Rooms</h3>
              <p className="text-zinc-400 leading-relaxed">Generate unique invite codes. Create dedicated leaderboards just for your friend group or university batch.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-zinc-900/50 border border-white/10 p-8 rounded-3xl hover:bg-zinc-900 transition-colors">
              <div className="w-12 h-12 bg-violet-500/20 rounded-2xl flex items-center justify-center mb-6 border border-violet-500/30">
                <Bot className="w-6 h-6 text-violet-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Gemini Code Evaluator</h3>
              <p className="text-zinc-400 leading-relaxed">Copy-paste your Accepted code. Our AI rips it apart, scoring your time/space complexity and code cleanliness.</p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-zinc-900/50 border border-white/10 p-8 rounded-3xl hover:bg-zinc-900 transition-colors lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/10 blur-[80px] rounded-full pointer-events-none" />
              <div>
                 <div className="w-12 h-12 bg-yellow-500/20 rounded-2xl flex items-center justify-center mb-6 border border-yellow-500/30">
                    <Trophy className="w-6 h-6 text-yellow-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Dynamic Multiplier Scoring</h3>
                  <p className="text-zinc-400 leading-relaxed">
                    Stop letting Easy problems inflate egos. Our advanced algorithm heavily weights Hard problems, tracks attempt efficiency, and awards exclusive dynamic badges (Room MVP, Speed Demon, Perfect Code) to the actual best coders.
                  </p>
              </div>
              <div className="bg-black/40 border border-white/10 rounded-2xl p-6 font-mono text-sm text-zinc-300">
                <span className="text-zinc-500">{"// Your final score algorithm"}</span><br />
                <span className="text-fuchsia-400">const</span> score = (attempts + aiQuality + aiComplexity)<br />
                <span className="text-violet-400 pl-4"> * </span>difficultyMultiplier;<br />
                <br />
                <span className="text-yellow-500">🏅 Ranks calculate automatically nightly.</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 text-center text-zinc-600 border-t border-white/5">
        <p className="font-medium text-sm flex items-center justify-center gap-2">Built with <Code2 className="w-4 h-4 text-fuchsia-500" /> for developers who want to win.</p>
      </footer>
    </main>
  );
}

// Ensure Sparkles component is locally defined for the hero
function Sparkles(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      <path d="M20 3v4" />
      <path d="M22 5h-4" />
      <path d="M4 17v2" />
      <path d="M5 18H3" />
    </svg>
  )
}

