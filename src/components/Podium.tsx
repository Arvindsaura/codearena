import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";

export function Podium({ leaderboard }: { leaderboard: any[] }) {
  if (leaderboard.length === 0) return null;

  const topThree = leaderboard.slice(0, 3);
  const first = topThree[0];
  const second = topThree[1];
  const third = topThree[2];

  return (
    <div className="flex justify-center items-end gap-2 md:gap-8 mt-12 mb-16 h-72 animate-in fade-in duration-1000">
      {/* Rank 2 */}
      {second && (
        <div className="flex flex-col items-center animate-in slide-in-from-bottom-8 duration-700 delay-300">
          <Avatar className="w-16 h-16 border-4 border-zinc-400/50 shadow-2xl z-10 -mb-8 transition-transform hover:scale-110">
            <AvatarImage src={second.user.image} />
            <AvatarFallback className="bg-zinc-800 text-zinc-400 font-black">{second.user.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div className="w-24 md:w-32 bg-gradient-to-t from-zinc-900 to-zinc-400/20 rounded-t-[2rem] h-36 flex flex-col items-center justify-start pt-12 pb-4 border-t border-x border-zinc-800 backdrop-blur-sm">
            <span className="font-black text-2xl text-zinc-500">2</span>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black truncate w-20 text-center uppercase tracking-widest text-zinc-400 mt-1">{second.user.name?.split(" ")[0]}</span>
              {second.user.leetcodeUser && (
                <span className="text-[8px] font-mono text-zinc-600">@{second.user.leetcodeUser}</span>
              )}
            </div>
            <div className="mt-auto bg-zinc-800/50 px-3 py-1 rounded-full border border-white/5">
              <span className="text-xs font-black tabular-nums">{second.totalScore.toFixed(1)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Rank 1 */}
      {first && (
        <div className="flex flex-col items-center z-20 animate-in slide-in-from-bottom-12 duration-700">
          <div className="relative">
             <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                <Crown className="h-8 w-8 text-yellow-500 fill-yellow-500 animate-bounce" />
             </div>
             <Avatar className="w-24 h-24 border-4 border-yellow-500 shadow-[0_0_40px_rgba(234,179,8,0.3)] z-10 -mb-12 transition-transform hover:scale-110">
                <AvatarImage src={first.user.image} />
                <AvatarFallback className="bg-zinc-800 text-yellow-500 text-2xl font-black">{first.user.name?.[0] || "U"}</AvatarFallback>
             </Avatar>
          </div>
          <div className="w-32 md:w-40 bg-gradient-to-t from-zinc-900 to-yellow-500/20 rounded-t-[2.5rem] h-52 flex flex-col items-center justify-start pt-16 pb-4 border-t border-x border-yellow-500/30 backdrop-blur-md shadow-[0_-20px_50px_-12px_rgba(234,179,8,0.1)]">
            <span className="font-black text-4xl text-yellow-500">1</span>
            <div className="flex flex-col items-center">
              <span className="text-xs font-black truncate w-28 text-center uppercase tracking-[0.2em] text-yellow-500/80 mt-2">{first.user.name?.split(" ")[0]}</span>
              {first.user.leetcodeUser && (
                <span className="text-[9px] font-mono text-yellow-500/50">@{first.user.leetcodeUser}</span>
              )}
            </div>
            <div className="mt-auto bg-yellow-500/10 px-4 py-2 rounded-full border border-yellow-500/20">
              <span className="text-lg font-black text-white tabular-nums">{first.totalScore.toFixed(1)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Rank 3 */}
      {third && (
        <div className="flex flex-col items-center animate-in slide-in-from-bottom-8 duration-700 delay-500">
          <Avatar className="w-14 h-14 border-4 border-orange-500/50 shadow-2xl z-10 -mb-7 transition-transform hover:scale-110">
            <AvatarImage src={third.user.image} />
            <AvatarFallback className="bg-zinc-800 text-orange-500 font-black">{third.user.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div className="w-24 md:w-32 bg-gradient-to-t from-zinc-900 to-orange-500/20 rounded-t-[2rem] h-28 flex flex-col items-center justify-start pt-10 pb-4 border-t border-x border-zinc-800 backdrop-blur-sm">
            <span className="font-black text-xl text-orange-600">3</span>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black truncate w-20 text-center uppercase tracking-widest text-orange-500/70 mt-1">{third.user.name?.split(" ")[0]}</span>
              {third.user.leetcodeUser && (
                <span className="text-[8px] font-mono text-orange-900/50">@{third.user.leetcodeUser}</span>
              )}
            </div>
            <div className="mt-auto bg-zinc-800/50 px-3 py-1 rounded-full border border-white/5">
              <span className="text-xs font-black tabular-nums">{third.totalScore.toFixed(1)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
