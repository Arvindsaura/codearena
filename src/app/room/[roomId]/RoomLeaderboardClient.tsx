"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { Podium } from "@/components/Podium";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScoreDetailsDialog } from "@/components/ScoreDetailsDialog";
import { Crown, Flame, Sparkles, Zap } from "lucide-react";
import { ActivityFeed } from "./ActivityFeed";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function RoomLeaderboardClient({ roomId, initialData }: { roomId: string, initialData?: any }) {
  const { data, isLoading } = useSWR(`/api/room/${roomId}/leaderboard`, fetcher, {
    fallbackData: initialData,
    revalidateOnFocus: false,
    dedupingInterval: 30000
  });

  const processedData = useMemo(() => {
    if (!data) return { leaderboard: [], userStats: {} };

    const { scores, roomSubmissions, todayScores, roomMembers } = data;
    const memberIds = roomMembers.map((m: any) => m.user.id);

    const userStats = memberIds.reduce((acc: any, uid: string) => {
      acc[uid] = { 
        solved: 0, 
        totalAttempts: 0, 
        codeScoreSum: 0, 
        codeCount: 0, 
        avgQuality: 0, 
        avgComplexity: 0, 
        metrics: {},
        today: todayScores.find((s: any) => s.userId === uid) || null
      };
      return acc;
    }, {} as Record<string, any>);

    roomSubmissions.forEach((sub: any) => {
      if (sub.isAccepted) {
        userStats[sub.userId].solved += 1;
        userStats[sub.userId].totalAttempts += sub.attempts;
        if (sub.codeSubmissions.length > 0) {
          const cs = sub.codeSubmissions[0];
          userStats[sub.userId].codeScoreSum += (cs.codeQuality || 0) + (cs.complexityScore || 0);
          userStats[sub.userId].codeCount += 1;
          userStats[sub.userId].avgQuality = cs.codeQuality || 0;
          userStats[sub.userId].avgComplexity = cs.complexityScore || 0;
          userStats[sub.userId].metrics = {
             algorithmElegance: cs.algorithmElegance,
             approachCleverness: cs.approachCleverness,
             codeStructure: cs.codeStructure,
             optimizationLevel: cs.optimizationLevel,
             robustness: cs.robustness,
             patternUsage: cs.patternUsage,
             constraintHandling: cs.constraintHandling,
             codeClarity: cs.codeClarity,
             microOptimizations: cs.microOptimizations,
             riskFactor: cs.riskFactor,
          };
        }
      }
    });

    let maxSolved = 0, bestSolverId = null;
    let minAvgAttempts = 999, speedDemonId = null;
    let maxAvgCodeScore = 0, perfectCodeId = null;

    for (const uid in userStats) {
      const stats = userStats[uid];
      if (stats.solved > maxSolved) { maxSolved = stats.solved; bestSolverId = uid; }
      if (stats.solved >= 1) {
        const avgAtt = stats.totalAttempts / stats.solved;
        if (avgAtt < minAvgAttempts) { minAvgAttempts = avgAtt; speedDemonId = uid; }
      }
      if (stats.codeCount >= 1) {
        const avgScore = stats.codeScoreSum / stats.codeCount;
        if (avgScore > maxAvgCodeScore) { maxAvgCodeScore = avgScore; perfectCodeId = uid; }
      }
    }

    const leaderboard = roomMembers.map((m: any) => {
      const userScore = scores.find((s: any) => s.userId === m.user.id);
      
      const badges = [];
      if (m.user.id === bestSolverId) badges.push({ CustomIcon: Flame, name: "Iron Streak (Most Solved)", color: "text-orange-500 bg-orange-500/10 border-orange-500/20" });
      if (m.user.id === perfectCodeId) badges.push({ CustomIcon: Sparkles, name: "Perfect Code (Highest AI Score)", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" });
      if (m.user.id === speedDemonId) badges.push({ CustomIcon: Zap, name: "Speed Demon (Fewest Attempts)", color: "text-purple-500 bg-purple-500/10 border-purple-500/20" });

      return {
        user: m.user,
        totalScore: userScore?._sum.finalScore || 0,
        baseScore: userScore?._sum.baseScore || 0,
        badges
      };
    }).sort((a: any, b: any) => b.totalScore - a.totalScore);

    if (leaderboard.length > 0 && leaderboard[0].totalScore > 0) {
      leaderboard[0].badges.unshift({ CustomIcon: Crown, name: "Room MVP", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" });
    }

    return { leaderboard, userStats };
  }, [data, roomId]);

  const { leaderboard, userStats } = processedData;

  if (isLoading && !data) {
      return <div className="h-96 flex items-center justify-center text-muted-foreground italic">Syncing live standings...</div>
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Podium leaderboard={leaderboard} />
      
      <Card className="border-white/5 bg-zinc-900/30 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-2 border-b border-white/5">
          <CardTitle>Leaderboard</CardTitle>
          <CardDescription>Overall member rankings in this room based on AI-evaluated LeetCode performance.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-zinc-950/50">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="w-[80px] pl-6 text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Rank</TableHead>
                <TableHead className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">User</TableHead>
                <TableHead className="text-right text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Previous Score</TableHead>
                <TableHead className="text-right text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Today&apos;s Score</TableHead>
                <TableHead className="text-right pr-6 text-fuchsia-400 font-bold uppercase text-[10px] tracking-widest">Final Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.map((entry: any, idx: number) => (
                <TableRow key={entry.user.id} className="border-white/5 group hover:bg-white/[0.02] transition-colors">
                  <TableCell className="font-black text-xl text-zinc-700 group-hover:text-primary pl-6 transition-colors italic">{idx + 1}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1.5 py-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-200 group-hover:text-white transition-colors">{entry.user.name || entry.user.email}</span>
                        {entry.user.leetcodeUser && (
                          <span className="text-[10px] text-zinc-500 font-mono bg-zinc-800/50 px-2 py-0.5 rounded-md border border-white/5">
                            @{entry.user.leetcodeUser}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {entry.badges.map((b: any, i: number) => (
                          <div key={i} title={b.name} className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-tight shadow-sm ${b.color}`}>
                            <b.CustomIcon className="w-3 h-3" />
                            <span>{b.name.split(" ")[0]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-3 pr-2">
                      <ScoreDetailsDialog 
                        user={entry.user} 
                        metrics={userStats[entry.user.id]?.metrics || {}} 
                        quality={userStats[entry.user.id]?.avgQuality || 0}
                        complexity={userStats[entry.user.id]?.avgComplexity || 0}
                      />
                      <span className="text-zinc-400 font-medium tabular-nums text-sm">
                        {(entry.totalScore - (userStats[entry.user.id]?.today?.finalScore || 0)).toFixed(1)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {userStats[entry.user.id]?.today ? (
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="font-black text-sm text-zinc-100 tabular-nums">
                          {userStats[entry.user.id].today.finalScore.toFixed(1)}
                        </span>
                        <div className="flex justify-end gap-1.5 flex-wrap">
                          <div className="px-1.5 py-0.5 bg-zinc-800/30 border border-white/5 rounded-md text-[9px] text-zinc-500 font-bold" title="Quality">
                            Q: {userStats[entry.user.id].avgQuality.toFixed(1)}
                          </div>
                          <div className="px-1.5 py-0.5 bg-zinc-800/30 border border-white/5 rounded-md text-[9px] text-zinc-500 font-bold" title="Efficiency">
                            E: {userStats[entry.user.id].avgComplexity.toFixed(1)}
                          </div>
                          {userStats[entry.user.id].today.weightedScore > userStats[entry.user.id].today.baseScore && (
                            <div className="px-1.5 py-0.5 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-md text-[9px] text-fuchsia-400 font-black" title="Multiplier Bonus">
                              +{(userStats[entry.user.id].today.weightedScore - userStats[entry.user.id].today.baseScore).toFixed(1)}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-zinc-800 font-black text-xs pr-4">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-black text-primary text-lg pr-6 tabular-nums drop-shadow-[0_0_10px_rgba(217,70,239,0.2)]">
                    {entry.totalScore.toFixed(1)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ActivityFeed activity={data?.recentActivity || []} />
    </div>
  );
}
