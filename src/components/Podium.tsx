import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Podium({ leaderboard }: { leaderboard: any[] }) {
  if (leaderboard.length < 3) return null;

  // Podium requires at least 3 people for the 'staircase' effect.
  // Rank 1 (index 0) - Center, highest
  // Rank 2 (index 1) - Left, middle
  // Rank 3 (index 2) - Right, lowest

  const first = leaderboard[0];
  const second = leaderboard[1];
  const third = leaderboard[2];

  return (
    <div className="flex justify-center items-end gap-2 md:gap-6 mt-8 mb-12 h-64">
      {/* Rank 2 */}
      <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
        <Avatar className="w-12 h-12 border-2 border-slate-300 shadow-lg z-10 -mb-6">
          <AvatarImage src={second.user.image} />
          <AvatarFallback>{second.user.name?.[0] || "U"}</AvatarFallback>
        </Avatar>
        <div className="w-20 md:w-28 bg-gradient-to-t from-slate-400/20 to-slate-300 rounded-t-xl h-32 flex flex-col items-center justify-start pt-8 pb-2">
          <span className="font-bold text-lg text-slate-800 dark:text-slate-200">#2</span>
          <span className="text-xs font-semibold truncate w-16 text-center">{second.user.name?.split(" ")[0]}</span>
          <span className="text-xs text-muted-foreground">{second.totalScore.toFixed(0)} pts</span>
        </div>
      </div>

      {/* Rank 1 */}
      <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Avatar className="w-16 h-16 border-4 border-yellow-400 shadow-xl z-10 -mb-8">
          <AvatarImage src={first.user.image} />
          <AvatarFallback>{first.user.name?.[0] || "U"}</AvatarFallback>
        </Avatar>
        <div className="w-24 md:w-32 bg-gradient-to-t from-yellow-500/20 to-yellow-400 rounded-t-xl h-44 flex flex-col items-center justify-start pt-10 pb-2 shadow-[0_0_15px_rgba(250,204,21,0.3)]">
          <span className="font-bold text-2xl text-yellow-900 dark:text-yellow-100">#1</span>
          <span className="text-sm font-bold truncate w-20 text-center">{first.user.name?.split(" ")[0]}</span>
          <span className="text-sm font-semibold">{first.totalScore.toFixed(0)} pts</span>
        </div>
      </div>

      {/* Rank 3 */}
      <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
        <Avatar className="w-12 h-12 border-2 border-orange-400 shadow-lg z-10 -mb-6">
          <AvatarImage src={third.user.image} />
          <AvatarFallback>{third.user.name?.[0] || "U"}</AvatarFallback>
        </Avatar>
        <div className="w-20 md:w-28 bg-gradient-to-t from-orange-500/20 to-orange-400/80 rounded-t-xl h-24 flex flex-col items-center justify-start pt-8 pb-2">
          <span className="font-bold text-lg text-orange-900 dark:text-orange-100">#3</span>
          <span className="text-xs font-semibold truncate w-16 text-center">{third.user.name?.split(" ")[0]}</span>
          <span className="text-xs text-muted-foreground">{third.totalScore.toFixed(0)} pts</span>
        </div>
      </div>
    </div>
  );
}
