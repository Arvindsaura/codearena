"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Activity, Trophy, Zap, Flame, Calendar, BrainCircuit, RefreshCw, Code2, Edit3, Save } from "lucide-react";
import ReactMarkdown from "react-markdown";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export function OverviewView({ user }: { user: any }) {
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streak, setStreak] = useState({ streak: 0, longestStreak: 0, totalDays: 0 });
  const router = useRouter();

  useEffect(() => {
    fetchSubmissions();
    fetchStreak();
  }, []);

  const fetchStreak = async () => {
    try {
      const res = await fetch("/api/user/streak");
      if (res.ok) {
        const data = await res.json();
        setStreak(data);
      }
    } catch (e) { /* ignore */ }
  };

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/leetcode/sync");
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions || []);
      }
    } catch (e) {
      // Ignore
    }
    setIsLoading(false);
  };

  const [isReevaluating, setIsReevaluating] = useState<string | null>(null);
  const [showReevalModal, setShowReevalModal] = useState(false);
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [newCode, setNewCode] = useState("");
  const [isUpdatingCode, setIsUpdatingCode] = useState(false);

  const handleReevaluate = async (codeSubmissionId: string, problemId: string, updatedCode?: string) => {
    setIsReevaluating(codeSubmissionId);
    toast.info(updatedCode ? "Analyzing new code..." : "Re-evaluating code quality...");
    try {
      const res = await fetch("/api/code/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          codeSubmissionId,
          newCode: updatedCode 
        }),
      });
      if (res.ok) {
        toast.success("Re-evaluation complete!");
        fetchSubmissions();
        setShowReevalModal(false);
        setNewCode("");
        setIsUpdatingCode(false);
      } else {
        toast.error("Evaluation failed. Try again.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setIsReevaluating(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/50 border border-white/5 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Welcome back, <span className="text-fuchsia-400 font-black">{user.name}</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Linked to LeetCode: <span className="font-mono text-zinc-300">@{user.leetcodeUser}</span>
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchSubmissions} 
          disabled={isLoading}
          className="bg-zinc-800/50 border-white/10 hover:bg-zinc-800"
        >
          {isLoading ? <Activity className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2 text-yellow-400" />}
          Sync Now
        </Button>
      </div>

      {/* Streak & Stats Row */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent overflow-hidden relative">
          <div className="absolute -right-4 -top-4 opacity-10">
            <Flame className="w-24 h-24 text-orange-500" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-orange-500/70 font-bold uppercase tracking-wider text-[10px]">Current Streak</CardDescription>
            <CardTitle className="text-4xl font-black text-orange-500 flex items-center gap-2">
              {streak.streak}
              <span className="text-2xl">🔥</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Consecutive days active</p>
          </CardContent>
        </Card>

        <Card className="border-fuchsia-500/20 bg-gradient-to-br from-fuchsia-500/5 to-transparent overflow-hidden relative">
          <div className="absolute -right-4 -top-4 opacity-10">
            <Zap className="w-24 h-24 text-fuchsia-500" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-fuchsia-500/70 font-bold uppercase tracking-wider text-[10px]">Longest Streak</CardDescription>
            <CardTitle className="text-4xl font-black text-fuchsia-500 flex items-center gap-2">
              {streak.longestStreak}
              <span className="text-2xl">⚡</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Your all-time personal best</p>
          </CardContent>
        </Card>

        <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-transparent overflow-hidden relative">
          <div className="absolute -right-4 -top-4 opacity-10">
            <Calendar className="w-24 h-24 text-cyan-500" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-cyan-500/70 font-bold uppercase tracking-wider text-[10px]">Total Active Days</CardDescription>
            <CardTitle className="text-4xl font-black text-cyan-500 flex items-center gap-2">
              {streak.totalDays}
              <span className="text-2xl">📅</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Total days with activity</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Problems */}
      <Card className="bg-zinc-950 border-white/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Today&apos;s Conquests
          </CardTitle>
          <CardDescription>Problems synced from your LeetCode account today</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
               <Activity className="w-8 h-8 text-fuchsia-500 animate-spin" />
               <p className="text-sm text-muted-foreground">Scanning your LeetCode profile...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-2xl">
              <Code2 className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 font-medium">No activity detected for today.</p>
              <p className="text-xs text-zinc-600 mt-1">Go solve a problem on LeetCode then click &quot;Sync Now&quot;</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {submissions.map((sub: any) => (
                <div key={sub.id} className="p-5 border border-white/5 bg-zinc-900/30 rounded-2xl group transition-all hover:bg-zinc-900/50">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                      <h4 className="font-bold text-lg group-hover:text-fuchsia-400 transition-colors">{sub.problemSlug}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${sub.isAccepted ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                          {sub.status}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono italic">Sync ID: {sub.id.slice(0, 8)}</span>
                      </div>
                    </div>
                    <div>
                      {sub.isAccepted && (
                        <Button 
                          onClick={() => router.push(`/submit/${sub.id}`)}
                          className={sub.codeSubmissions?.length ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" : "bg-fuchsia-600 hover:bg-fuchsia-700 h-9 px-6 text-xs"}
                          disabled={!!sub.codeSubmissions?.length}
                        >
                          {sub.codeSubmissions?.length ? "✓ Evaluation Sent" : "Paste Code for AI Score"}
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {sub.codeSubmissions?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
                      <div className="flex flex-wrap gap-4">
                        <div className="bg-fuchsia-500/10 border border-fuchsia-500/20 px-3 py-1.5 rounded-xl">
                          <span className="text-[10px] text-fuchsia-300 block font-bold uppercase">Quality Score</span>
                          <span className="text-lg font-black text-fuchsia-400">{sub.codeSubmissions[0].codeQuality}/10</span>
                        </div>
                        <div className="bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-xl">
                          <span className="text-[10px] text-cyan-300 block font-bold uppercase">Complexity</span>
                          <span className="text-lg font-black text-cyan-400">{sub.codeSubmissions[0].complexityScore}/10</span>
                        </div>
                        <div className="bg-zinc-800/50 border border-white/5 px-3 py-1.5 rounded-xl">
                          <span className="text-[10px] text-zinc-500 block font-bold uppercase">Attempts</span>
                          <span className="text-lg font-black text-zinc-300">{sub.attempts}</span>
                        </div>
                      </div>

                      {sub.codeSubmissions[0].aiReview ? (
                        <div className="bg-black/50 border border-white/5 rounded-2xl p-4 relative overflow-hidden group/review shadow-inner">
                           <div className="absolute top-0 right-0 p-3 opacity-5 group-hover/review:opacity-20 transition-opacity">
                             <BrainCircuit className="w-12 h-12 text-fuchsia-500" />
                           </div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                               <h5 className="text-[10px] font-black text-fuchsia-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                 <Zap className="w-3 h-3" /> Groq AI Insight
                               </h5>
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 className="h-6 px-2 text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-fuchsia-400 hover:bg-fuchsia-500/10 gap-1.5 rounded-lg border border-white/5"
                                 onClick={() => {
                                   setSelectedSub(sub.codeSubmissions[0]);
                                   setShowReevalModal(true);
                                 }}
                                 disabled={isReevaluating === sub.codeSubmissions[0].id}
                                >
                                 <RefreshCw className={`w-3 h-3 ${isReevaluating === sub.codeSubmissions[0].id ? "animate-spin" : ""}`} />
                                 Re-evaluate
                               </Button>
                            </div>
                           <div className="text-xs text-zinc-400 leading-relaxed font-medium markdown-content">
                             <ReactMarkdown>{sub.codeSubmissions[0].aiReview}</ReactMarkdown>
                           </div>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full py-6 rounded-2xl border-dashed border-fuchsia-500/30 text-fuchsia-400 hover:bg-fuchsia-500/5 transition-all"
                          onClick={async () => {
                            toast.info("Analyzing code quality with Groq AI...");
                            try {
                              const res = await fetch("/api/code/review", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ codeSubmissionId: sub.codeSubmissions[0].id }),
                              });
                              if (res.ok) {
                                toast.success("AI review complete!");
                                fetchSubmissions();
                              } else {
                                toast.error("Groq is currently busy. Try again soon.");
                              }
                            } catch {
                              toast.error("Network error during analysis.");
                            }
                          }}
                        >
                          ✨ Extract AI Performance Insights
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Re-evaluation Modal */}
      <Dialog open={showReevalModal} onOpenChange={setShowReevalModal}>
        <DialogContent className="sm:max-w-[600px] bg-zinc-950 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-fuchsia-400" />
              Choose Re-evaluation Method
            </DialogTitle>
            <DialogDescription className="text-zinc-500">
              Would you like to re-run the AI on your previous code or submit an updated solution?
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {!isUpdatingCode ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="h-32 flex flex-col gap-2 border-white/5 bg-zinc-900/50 hover:bg-zinc-900 hover:border-fuchsia-500/50 group"
                  onClick={() => handleReevaluate(selectedSub.id, selectedSub.id)}
                  disabled={!!isReevaluating}
                >
                  <RefreshCw className={`w-6 h-6 text-zinc-500 group-hover:text-fuchsia-400 ${isReevaluating ? "animate-spin" : ""}`} />
                  <div className="text-center">
                    <div className="font-bold">Keep Previous Code</div>
                    <div className="text-[10px] text-zinc-500">Re-run AI analysis on current submission</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-32 flex flex-col gap-2 border-white/5 bg-zinc-900/50 hover:bg-zinc-900 hover:border-fuchsia-500/50 group"
                  onClick={() => setIsUpdatingCode(true)}
                  disabled={!!isReevaluating}
                >
                  <Edit3 className="w-6 h-6 text-zinc-500 group-hover:text-fuchsia-400" />
                  <div className="text-center">
                    <div className="font-bold">Update with New Code</div>
                    <div className="text-[10px] text-zinc-500">Paste your improved solution</div>
                  </div>
                </Button>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                    <Save className="w-3 h-3" /> Improved Solution
                  </h4>
                  <Textarea 
                    placeholder="Paste your updated C++/Java/Python/JS code here..."
                    className="min-h-[300px] bg-black/40 border-white/10 font-mono text-xs focus:border-fuchsia-500/50 resize-none"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" className="flex-1 text-zinc-500" onClick={() => { setIsUpdatingCode(false); setNewCode(""); }}>
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1 bg-fuchsia-600 hover:bg-fuchsia-700 font-bold"
                    disabled={!newCode.trim() || !!isReevaluating}
                    onClick={() => handleReevaluate(selectedSub.id, selectedSub.id, newCode)}
                  >
                    {isReevaluating ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                    Confirm & Re-evaluate
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Ensure Code2 is locally defined if not already available in lucide
function Code2(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m18 16 4-4-4-4" />
      <path d="m6 8-4 4 4 4" />
      <path d="m14.5 4-5 16" />
    </svg>
  )
}
