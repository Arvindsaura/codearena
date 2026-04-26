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
import { ActivityFeed } from "./ActivityFeed";
import { Crown, Flame, Sparkles, Zap } from "lucide-react";

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
          }
        }
      }
    }
  });

  if (!member) {
    redirect("/");
  }

  const room = member.room;
  
  // Aggregate Leaderboard. This is simplified to just aggregate all ScoreRecords.
  // We can fetch ScoreRecords for each member and sum them up.
  const memberIds = room.members.map(m => m.user.id);
  const scores = await prisma.scoreRecord.groupBy({
    by: ['userId'],
    _sum: { finalScore: true, baseScore: true },
    where: { userId: { in: memberIds } }
  });

  const recentActivity = await prisma.codeSubmission.findMany({
    where: { userId: { in: memberIds } },
    include: {
      user: true,
      problemSubmit: true
    },
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  const roomSubmissions = await prisma.problemSubmission.findMany({
    where: { userId: { in: memberIds } },
    include: { codeSubmissions: true }
  });

  const userStats = memberIds.reduce((acc, uid) => {
    acc[uid] = { solved: 0, totalAttempts: 0, codeScoreSum: 0, codeCount: 0 };
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
        <div className="flex items-center mb-2">
          <h1 className="text-3xl font-bold tracking-tight">{room.name}</h1>
          <ScoringInfo />
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
                  <TableHead>Awards</TableHead>
                  <TableHead className="text-right">Base Score</TableHead>
                  <TableHead className="text-right">Multiplier + Bonus</TableHead>
                  <TableHead className="text-right text-primary">Final Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((entry, idx) => (
                  <TableRow key={entry.user.id}>
                    <TableCell className="font-medium text-lg text-primary">{idx + 1}</TableCell>
                    <TableCell className="flex items-center gap-2">
                        {entry.user.name || entry.user.email}
                        {entry.user.leetcodeUser && (
                            <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                                {entry.user.leetcodeUser}
                            </span>
                        )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {entry.badges.map((b, i) => (
                          <div key={i} title={b.name} className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold ${b.color}`}>
                            <b.CustomIcon className="w-3 h-3" />
                            <span className="hidden sm:inline">{b.name.split(" ")[0]}</span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{entry.baseScore.toFixed(0)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">+{(entry.totalScore - entry.baseScore).toFixed(1)}</TableCell>
                    <TableCell className="text-right font-bold text-primary">{entry.totalScore.toFixed(1)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <RoomContests roomId={room.id} />

        <ActivityFeed activity={recentActivity} />
      </div>
    </main>
  );
}
