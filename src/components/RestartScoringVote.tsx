"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Users, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";

export function RestartScoringVote({ roomId }: { roomId: string }) {
  const [stats, setStats] = useState<any>(null);
  const [isLoding, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/room/${roomId}/vote`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) { /* ignore */ }
  }, [roomId]);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [fetchStats]);

  const toggleVote = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/room/${roomId}/vote`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        toast.success(data.hasVoted ? "Vote cast for re-score!" : "Vote withdrawn.");
      }
    } catch {
      toast.error("Failed to vote.");
    }
    setIsLoading(false);
  };

  const startRescore = async () => {
    setIsProcessing(true);
    toast.info("Starting bulk re-score. This may take a moment...");
    try {
      const res = await fetch(`/api/room/${roomId}/restart`, { method: "POST" });
      if (res.ok) {
        toast.success("Bulk re-scoring complete!");
        fetchStats();
        router.refresh();
      } else {
        toast.error("Failed to start re-score.");
      }
    } catch {
      toast.error("Network error.");
    }
    setIsProcessing(false);
  };

  if (!stats) return (
    <div className="flex flex-col gap-4 p-4 bg-zinc-900/50 border border-white/5 rounded-2xl w-[280px] animate-pulse">
      <div className="flex justify-between">
        <div className="h-4 w-24 bg-zinc-800 rounded"></div>
        <div className="h-3 w-16 bg-zinc-800 rounded"></div>
      </div>
      <div className="h-1.5 w-full bg-zinc-800 rounded"></div>
      <div className="h-9 w-full bg-zinc-800 rounded-xl"></div>
    </div>
  );

  const progress = (stats.votes / stats.threshold) * 100;
  const isMet = stats.votes >= stats.threshold;

  return (
    <div className="flex flex-col gap-4 p-4 bg-zinc-900/50 border border-white/5 rounded-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold">
          <RotateCcw className={`w-4 h-4 ${isMet ? "text-fuchsia-400" : "text-zinc-500"}`} />
          Restart Scoring Request
        </div>
        <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-zinc-500">
          <Users className="w-3 h-3" />
          {stats.votes} / {stats.totalMembers} Members Voted
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-bold">
          <span className={isMet ? "text-green-400" : "text-zinc-500"}>
            {isMet ? "Majority Reached (80%)" : `${stats.threshold - stats.votes} more votes needed`}
          </span>
          <span className="text-zinc-500">{Math.round(progress)}%</span>
        </div>
        <Progress value={Math.min(progress, 100)} className="h-1.5 bg-zinc-950" />
      </div>

      <div className="flex gap-2">
        <Button 
          variant={stats.hasVoted ? "secondary" : "outline"}
          size="sm"
          className="flex-1 h-9 rounded-xl text-xs font-bold"
          onClick={toggleVote}
          disabled={isLoding || isProcessing}
        >
          {isLoding ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : stats.hasVoted ? "Withdraw Vote" : "Vote to Restart"}
        </Button>

        {isMet && (
          <Button 
            className="flex-1 h-9 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-700 text-xs font-bold gap-2"
            onClick={startRescore}
            disabled={isProcessing}
          >
            {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
            Start Bulk Re-score
          </Button>
        )}
      </div>
    </div>
  );
}
