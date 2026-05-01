export const dynamic = "force-dynamic";
import { Navbar } from "@/components/Navbar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Podium } from "@/components/Podium";
import { ScoringInfo } from "@/components/ScoringInfo";
import { RoomContests } from "@/components/RoomContests";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MarathonHistory } from "./MarathonHistory";
import { ActivityFeed } from "./ActivityFeed";
import { RestartScoringVote } from "@/components/RestartScoringVote";
import { ScoreDetailsDialog } from "@/components/ScoreDetailsDialog";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Crown, Flame, Sparkles, Zap, History } from "lucide-react";

export default async function RoomPage({ params }: { params: { roomId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/");

  // Verify membership
  const member = await prisma.roomMember.findUnique({
    where: {
      userId_roomId: {
        userId: session.user.id,
        roomId: params.roomId
      }
    },
    include: {
      room: {
        include: {
          members: {
            include: {
              user: true
            }
          },
          marathons: {
            include: {
              results: {
                include: { user: true }
              }
            },
            orderBy: { endedAt: 'desc' }
          }
        }
      }
    }
  });

  if (!member) {
    redirect("/");
  }

  const room = member.room;
  const memberIds = room.members.map(m => m.user.id);
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  today.setHours(0, 0, 0, 0);
  const startOfTodayUTC = new Date(today.getTime() - (12 * 60 * 60 * 1000));

  // 🚀 Parallel Data Fetching
  const [scores, recentActivity, roomSubmissions, todayScores] = await Promise.all([
    // 1. Aggregate Scores for the current cycle
    prisma.scoreRecord.groupBy({
      by: ['userId'],
      _sum: { finalScore: true, baseScore: true },
      where: { 
        userId: { in: memberIds },
        date: { gte: new Date(new Date(room.lastRestartedAt).setHours(0, 0, 0, 0)) } // Start of the restart day
      }
    }),
    // 2. Recent Activity Feed
    prisma.codeSubmission.findMany({
      where: { userId: { in: memberIds } },
      include: {
        user: true,
        problemSubmit: true
      },
      orderBy: { createdAt: 'desc' },
      take: 20 // Reduced from 50 for speed
    }),
    // 3. Problem Submissions for the current cycle (Critical optimization)
    prisma.problemSubmission.findMany({
      where: { 
        userId: { in: memberIds },
        date: { gte: room.lastRestartedAt } // Only current cycle
      },
      include: { 
        codeSubmissions: {
          take: 1, // We only need the latest code evaluation for stats
          orderBy: { createdAt: 'desc' }
        } 
      }
    }),
    // 4. Today's Specific Scores
    prisma.scoreRecord.findMany({
      where: { 
        userId: { in: memberIds },
        date: { gte: startOfTodayUTC }
      }
    })
  ]);

  const userStats = memberIds.reduce((acc, uid) => {
    acc[uid] = { 
      solved: 0, 
      totalAttempts: 0, 
      codeScoreSum: 0, 
      codeCount: 0, 
      avgQuality: 0, 
      avgComplexity: 0, 
      metrics: {},
      today: todayScores.find(s => s.userId === uid) || null
    };
    return acc;
  }, {} as Record<string, any>);

  roomSubmissions.forEach(sub => {
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

  const leaderboard = room.members.map(m => {
    const userScore = scores.find(s => s.userId === m.user.id);
    
    // Assign Badges
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
  }).sort((a, b) => b.totalScore - a.totalScore); // Sort descending

  // Award MVP to rank 1
  if (leaderboard.length > 0 && leaderboard[0].totalScore > 0) {
    leaderboard[0].badges.unshift({ CustomIcon: Crown, name: "Room MVP", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" });
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-8 max-w-4xl px-4 md:px-8">
        <div className="flex items-center mb-2 gap-4">
          <h1 className="text-3xl font-bold tracking-tight">{room.name}</h1>
          <ScoringInfo />
          <RestartScoringVote roomId={room.id} />
        </div>
        <p className="text-muted-foreground mb-6">
          Room Code: <span className="font-mono bg-secondary px-2 py-1 rounded text-primary">{room.code}</span>
        </p>

        <Podium leaderboard={leaderboard} />
        
        <Card>
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
            <CardDescription>Overall member rankings in this room based on AI-evaluated LeetCode performance.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Rank</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead className="text-right">Base Score</TableHead>
                    <TableHead className="text-right">Today&apos;s Score</TableHead>
                    <TableHead className="text-right text-primary">Final Score</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {leaderboard.map((entry, idx) => (
                  <TableRow key={entry.user.id}>
                    <TableCell className="font-medium text-lg text-primary">{idx + 1}</TableCell>
                    <TableCell>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <span className="font-bold">{entry.user.name || entry.user.email}</span>
                                {entry.user.leetcodeUser && (
                                    <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                                        {entry.user.leetcodeUser}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {entry.badges.map((b, i) => (
                                    <div key={i} title={b.name} className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-tighter ${b.color}`}>
                                        <b.CustomIcon className="w-2.5 h-2.5" />
                                        <span>{b.name.split(" ")[0]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-2">
                       <ScoreDetailsDialog 
                           user={entry.user} 
                           metrics={userStats[entry.user.id]?.metrics || {}} 
                           quality={userStats[entry.user.id]?.avgQuality || 0}
                           complexity={userStats[entry.user.id]?.avgComplexity || 0}
                       />
                       <span>{entry.baseScore.toFixed(1)}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      {userStats[entry.user.id]?.today ? (
                        <div className="flex flex-col items-end gap-1.5">
                          <span className="font-black text-sm text-white">
                            {userStats[entry.user.id].today.finalScore.toFixed(1)}
                          </span>
                          <div className="flex justify-end gap-1 flex-wrap">
                            <div className="px-1.5 py-0.5 bg-zinc-800/50 border border-white/5 rounded-full text-[9px] text-zinc-500" title="Quality">
                              {userStats[entry.user.id].avgQuality.toFixed(1)}
                            </div>
                            <div className="px-1.5 py-0.5 bg-zinc-800/50 border border-white/5 rounded-full text-[9px] text-zinc-500" title="Efficiency">
                              {userStats[entry.user.id].avgComplexity.toFixed(1)}
                            </div>
                            {userStats[entry.user.id].today.weightedScore > userStats[entry.user.id].today.baseScore && (
                              <div className="px-1.5 py-0.5 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-full text-[9px] text-fuchsia-400 font-bold" title="Multiplier Bonus">
                                +{(userStats[entry.user.id].today.weightedScore - userStats[entry.user.id].today.baseScore).toFixed(1)}
                              </div>
                            )}
                            {userStats[entry.user.id].today.streakBonus > 0 && (
                              <div className="px-1.5 py-0.5 bg-orange-500/10 border border-orange-500/20 rounded-full text-[9px] text-orange-400 font-bold" title="Streak Bonus">
                                +{userStats[entry.user.id].today.streakBonus.toFixed(1)}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-zinc-600 text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary">{entry.totalScore.toFixed(1)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Link href={`/room/${room.id}/marathons`}>
            <Button variant="outline" size="sm" className="gap-2 rounded-xl border-zinc-800 hover:bg-zinc-900">
              <History className="h-4 w-4" /> View Full Marathon History
            </Button>
          </Link>
        </div>
        
        <RoomContests roomId={room.id} />

        <MarathonHistory marathons={room.marathons} />

        <ActivityFeed activity={recentActivity} />
      </div>
    </main>
  );
}
