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

  return (
    <main className="min-h-screen bg-background text-zinc-100">
      <Navbar />
      <div className="container mx-auto py-8 max-w-4xl px-4 md:px-8">
        <div className="flex items-center mb-2 gap-4">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
            {room.name}
          </h1>
          <ScoringInfo />
          <RestartScoringVote roomId={room.id} />
        </div>
        <p className="text-muted-foreground mb-10 flex items-center gap-2">
          Room Code: 
          <span className="font-mono bg-zinc-900 border border-white/5 px-2 py-1 rounded text-fuchsia-400 font-bold tracking-tighter">
            {room.code}
          </span>
        </p>

        {/* 🏆 Client-Side Leaderboard with SWR Caching (No server blocking) */}
        <RoomLeaderboardClient roomId={room.id} />
        
        <div className="flex justify-end mt-8 mb-12">
          <Link href={`/room/${room.id}/marathons`}>
            <Button variant="outline" size="sm" className="gap-2 rounded-xl border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-500 transition-all hover:text-zinc-200">
              <History className="h-4 w-4" /> View Full Marathon History
            </Button>
          </Link>
        </div>
        
        <RoomContests roomId={room.id} />
        <MarathonHistory marathons={room.marathons} />
      </div>
    </main>
  );
}
