export const dynamic = "force-dynamic";
import { Navbar } from "@/components/Navbar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ScoringInfo } from "@/components/ScoringInfo";
import { RoomContests } from "@/components/RoomContests";
import { MarathonHistory } from "./MarathonHistory";
import { ActivityFeed } from "./ActivityFeed";
import { RestartScoringVote } from "@/components/RestartScoringVote";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
import { RoomLeaderboardClient } from "./RoomLeaderboardClient";

export default async function RoomPage({ params }: { params: { roomId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/");

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
          marathons: {
            include: {
              results: { include: { user: true } }
            },
            orderBy: { endedAt: 'desc' }
          }
        }
      }
    }
  });

  if (!member) redirect("/");

  const room = member.room;

  // 🚀 Fetch initial data for SSR/Speed, but client will take over for caching
  const now = new Date();
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const marathonStart = new Date(new Date(room.lastRestartedAt).setUTCHours(0, 0, 0, 0));
  const memberIds = await prisma.roomMember.findMany({ 
      where: { roomId: room.id },
      select: { userId: true }
  }).then(m => m.map(x => x.userId));

  const [scores, roomSubmissions, todayScores, recentActivity, roomMembers] = await Promise.all([
    prisma.scoreRecord.groupBy({
      by: ['userId'],
      _sum: { finalScore: true, baseScore: true },
      where: { 
        userId: { in: memberIds },
        date: { gte: marathonStart }
      }
    }),
    prisma.problemSubmission.findMany({
      where: { 
        userId: { in: memberIds },
        date: { gte: marathonStart }
      },
      include: { 
        codeSubmissions: { take: 1, orderBy: { createdAt: 'desc' } } 
      }
    }),
    prisma.scoreRecord.findMany({
      where: { 
        userId: { in: memberIds },
        date: { gte: todayStart }
      }
    }),
    prisma.codeSubmission.findMany({
      where: { userId: { in: memberIds } },
      include: { user: true, problemSubmit: true },
      orderBy: { createdAt: 'desc' },
      take: 20
    }),
    prisma.roomMember.findMany({
        where: { roomId: room.id },
        include: { user: true }
    })
  ]);

  const initialLeaderboardData = {
      scores,
      roomSubmissions,
      todayScores,
      roomMembers,
      marathonStart,
      todayStart
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-8 max-w-4xl px-4 md:px-8">
        <div className="flex items-center mb-2 gap-4">
          <h1 className="text-3xl font-bold tracking-tight">{room.name}</h1>
          <ScoringInfo />
          <RestartScoringVote roomId={room.id} />
        </div>
        <p className="text-muted-foreground mb-10">
          Room Code: <span className="font-mono bg-zinc-900 border border-white/5 px-2 py-1 rounded text-fuchsia-400 font-bold">{room.code}</span>
        </p>

        {/* 🏆 Client-Side Leaderboard with SWR Caching */}
        <RoomLeaderboardClient roomId={room.id} initialData={initialLeaderboardData} />
        
        <div className="flex justify-end mt-8 mb-12">
          <Link href={`/room/${room.id}/marathons`}>
            <Button variant="outline" size="sm" className="gap-2 rounded-xl border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-400">
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
