import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trophy, Calendar, Code, User, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function MarathonsPage({ params }: { params: { roomId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return <div>Unauthorized</div>;

  const room = await prisma.room.findUnique({
    where: { id: params.roomId },
    include: {
      marathons: {
        include: {
          results: {
            include: { user: true }
          }
        },
        orderBy: { endedAt: 'desc' }
      },
      members: {
        include: { user: true }
      }
    }
  });

  if (!room) return <div>Room not found</div>;

  // For each marathon, we want to fetch the "Questions Solved" during that period
  // This is a bit complex for a single query, so we'll map through them
  const marathonsWithDetails = await Promise.all(room.marathons.map(async (marathon) => {
    const submissions = await prisma.codeSubmission.findMany({
      where: {
        userId: { in: room.members.map(m => m.userId) },
        date: {
          gte: marathon.startedAt,
          lte: marathon.endedAt
        }
      },
      include: { user: true },
      orderBy: { date: 'desc' }
    });

    return {
      ...marathon,
      submissions
    };
  }));

  return (
    <div className="container max-w-5xl py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link href={`/room/${params.roomId}`} className="text-sm text-zinc-500 hover:text-white flex items-center gap-2 mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Room
          </Link>
          <h1 className="text-4xl font-bold tracking-tight">Marathon History</h1>
          <p className="text-zinc-400">View previous competition cycles and hall of fame.</p>
        </div>
      </div>

      <div className="grid gap-8">
        {marathonsWithDetails.map((marathon) => (
          <Card key={marathon.id} className="border-zinc-800 bg-zinc-900/20 overflow-hidden">
            <CardHeader className="bg-zinc-900/40 border-b border-zinc-800">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl font-black">{marathon.name}</CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(marathon.startedAt).toLocaleDateString()} - {new Date(marathon.endedAt).toLocaleDateString()}
                    </span>
                  </CardDescription>
                </div>
                <div className="flex -space-x-2">
                   {marathon.results.slice(0, 5).map((res) => (
                     <div key={res.id} className="w-8 h-8 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center text-[10px] font-bold overflow-hidden" title={res.user.name || ""}>
                       {res.user.image ? <img src={res.user.image} alt="" /> : (res.user.name?.[0] || "?")}
                     </div>
                   ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-800">
                {/* Leaderboard Section */}
                <div className="p-6 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    <Trophy className="h-4 w-4" /> Final Standings
                  </h3>
                  <div className="space-y-2">
                    {marathon.results.sort((a, b) => b.score - a.score).map((result, idx) => (
                      <div key={result.id} className={`flex items-center justify-between p-3 rounded-xl ${idx === 0 ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-zinc-900/50 border border-white/5'}`}>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-black ${idx === 0 ? 'text-yellow-500' : 'text-zinc-600'} w-4`}>#{idx + 1}</span>
                          <span className="font-bold">{result.user.name || result.user.email}</span>
                        </div>
                        <span className={`font-black ${idx === 0 ? 'text-yellow-500' : 'text-zinc-400'}`}>{result.score.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submissions Section */}
                <div className="p-6 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    <Code className="h-4 w-4" /> Questions Solved
                  </h3>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {marathon.submissions.length > 0 ? (
                      marathon.submissions.map((sub) => (
                        <div key={sub.id} className="flex flex-col p-3 rounded-xl bg-zinc-900/50 border border-white/5 gap-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-white truncate max-w-[200px]">{sub.problemSlug}</span>
                            <span className="text-[10px] text-zinc-500">{new Date(sub.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3 text-zinc-600" />
                            <span className="text-[10px] text-zinc-400 font-medium">{sub.user.name || "User"}</span>
                            <div className="ml-auto flex items-center gap-1">
                               <div className="w-1 h-1 rounded-full bg-green-500" />
                               <span className="text-[10px] font-black text-green-500">{(sub.codeQuality || 0).toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-zinc-600 italic">No submissions recorded in this cycle.</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {marathonsWithDetails.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
             <div className="p-4 rounded-full bg-zinc-900">
               <History className="h-10 w-10 text-zinc-700" />
             </div>
             <div className="space-y-1">
               <h3 className="text-xl font-bold">No Marathons Yet</h3>
               <p className="text-zinc-500 max-w-xs">Once you restart the scoring in a room, the history will appear here.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
