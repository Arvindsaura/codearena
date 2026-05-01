import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Code, Target, Zap, Clock, Star, Settings, History } from "lucide-react";
import { ProfileEditForm } from "./ProfileEditForm";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      submissions: {
        orderBy: { createdAt: 'desc' },
        take: 20
      },
      codeSubmits: {
        orderBy: { createdAt: 'desc' },
        take: 20
      },
      scoreRecords: {
        orderBy: { date: 'desc' }
      },
      roomMembers: {
        include: {
          room: true
        }
      }
    }
  });

  if (!user) return <div>User not found</div>;

  const totalScore = user.scoreRecords.reduce((acc, curr) => acc + curr.finalScore, 0);
  const avgQuality = user.codeSubmits.length > 0 
    ? (user.codeSubmits.reduce((acc, curr) => acc + (curr.codeQuality || 0), 0) / user.codeSubmits.length).toFixed(1)
    : "0.0";
  const solvedCount = user.submissions.filter(s => s.isAccepted).length;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-fuchsia-500/30">
      <Navbar />
      
      <div className="container max-w-6xl py-12 px-4 md:px-8 space-y-12 animate-in fade-in duration-1000">
        <div className="flex flex-col md:flex-row items-center gap-8 bg-zinc-900/20 p-8 rounded-3xl border border-white/5 backdrop-blur-sm">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <Avatar className="h-32 w-32 border-2 border-white/10 relative">
              <AvatarImage src={user.image || ""} alt={user.name || ""} />
              <AvatarFallback className="text-4xl font-black bg-zinc-800 text-zinc-500">
                {user.name?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div>
              <h1 className="text-4xl font-black tracking-tight flex items-center justify-center md:justify-start gap-3">
                {user.name}
                <Badge variant="secondary" className="bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20 text-xs uppercase font-black tracking-widest px-2 py-0.5">
                  Pro
                </Badge>
              </h1>
              <p className="text-zinc-500 font-medium">{user.email}</p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <div className="bg-zinc-800/50 px-4 py-2 rounded-xl border border-white/5 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-bold">{totalScore.toFixed(0)} Total Points</span>
              </div>
              <div className="bg-zinc-800/50 px-4 py-2 rounded-xl border border-white/5 flex items-center gap-2">
                <Code className="h-4 w-4 text-zinc-400" />
                <span className="text-sm font-bold">{solvedCount} Problems Solved</span>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-xl border-zinc-800 gap-2 hover:bg-zinc-800 ml-auto md:ml-0">
                    <Settings className="h-4 w-4" /> Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                      Customize your nickname and avatar. These will be visible on all leaderboards.
                    </DialogDescription>
                  </DialogHeader>
                  <ProfileEditForm user={user} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Average Quality" value={`${avgQuality}/10.0`} icon={<Star className="h-5 w-5" />} color="text-fuchsia-500" />
          <StatCard title="Submission Streak" value="-- days" icon={<Zap className="h-5 w-5" />} color="text-orange-500" />
          <StatCard title="Active Rooms" value={user.roomMembers.length.toString()} icon={<Target className="h-5 w-5" />} color="text-blue-500" />
          <StatCard title="Recent Activity" value="Today" icon={<Clock className="h-5 w-5" />} color="text-green-500" />
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <History className="h-5 w-5 text-zinc-500" /> Recent Submissions
            </h2>
            <Card className="border-zinc-800 bg-zinc-900/10">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800 hover:bg-transparent">
                    <TableHead className="text-xs uppercase font-black tracking-widest text-zinc-500">Problem</TableHead>
                    <TableHead className="text-xs uppercase font-black tracking-widest text-zinc-500">Quality</TableHead>
                    <TableHead className="text-xs uppercase font-black tracking-widest text-zinc-500 text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {user.codeSubmits.map((sub) => (
                    <TableRow key={sub.id} className="border-zinc-800 hover:bg-zinc-900/40 transition-colors">
                      <TableCell className="font-bold py-4">{sub.problemSlug}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-fuchsia-500" style={{ width: `${(sub.codeQuality || 0) * 10}%` }} />
                          </div>
                          <span className="text-xs font-black">{(sub.codeQuality || 0).toFixed(1)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-zinc-500 text-xs">
                        {new Date(sub.date).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Target className="h-5 w-5 text-zinc-500" /> Joined Rooms
            </h2>
            <div className="space-y-4">
              {user.roomMembers.map((membership) => (
                <Card key={membership.id} className="border-zinc-800 bg-zinc-900/20 hover:border-fuchsia-500/30 transition-all group">
                  <CardHeader className="p-5 flex flex-row items-center justify-between space-y-0">
                    <div className="space-y-1">
                      <CardTitle className="text-md font-bold group-hover:text-fuchsia-400 transition-colors">
                        {membership.room.name}
                      </CardTitle>
                      <CardDescription className="font-mono text-[10px]">
                        CODE: {membership.room.code}
                      </CardDescription>
                    </div>
                    <Link href={`/room/${membership.room.id}`}>
                      <Button variant="ghost" size="sm" className="rounded-full hover:bg-zinc-800">
                        Enter
                      </Button>
                    </Link>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) {
  return (
    <Card className="border-zinc-800 bg-zinc-900/20 overflow-hidden group">
      <CardContent className="p-6 space-y-4">
        <div className={`p-2 rounded-lg bg-zinc-800/50 w-fit ${color} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-zinc-500">{title}</p>
          <p className="text-2xl font-black mt-1">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
