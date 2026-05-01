"use client";

import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function ScoringInfo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 ml-2 rounded-full">
          <Info className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>How are scores calculated?</DialogTitle>
          <DialogDescription>
            CodeArena uses an advanced AI-powered scoring system to evaluate both your grit and code quality.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-sm">1. AI Evaluation (Quality & Efficiency)</h4>
            <p className="text-xs text-muted-foreground italic mb-2">Groq AI evaluates your solution on two core metrics:</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted p-3 rounded-lg">
                <span className="block font-bold text-lg text-primary">0-10</span>
                <span className="text-[10px] uppercase tracking-tighter text-zinc-500">Quality Score</span>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <span className="block font-bold text-lg text-primary">0-10</span>
                <span className="text-[10px] uppercase tracking-tighter text-zinc-500">Efficiency Score</span>
              </div>
            </div>
            <p className="text-[10px] mt-2 text-muted-foreground">Maximum daily base score is 20 points.</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-sm">2. Difficulty Multiplier</h4>
            <p className="text-xs text-muted-foreground mb-2">Multipliers reward you for tackling tougher problems.</p>
            <div className="text-sm grid grid-cols-3 gap-2 bg-muted p-2 rounded-md font-bold text-center">
              <div className="flex flex-col">
                <span className="text-green-500">x1.0</span>
                <span className="text-[9px] text-zinc-500">EASY</span>
              </div>
              <div className="flex flex-col">
                <span className="text-orange-500">x1.5</span>
                <span className="text-[9px] text-zinc-500">MEDIUM</span>
              </div>
              <div className="flex flex-col">
                <span className="text-red-500">x2.0</span>
                <span className="text-[9px] text-zinc-500">HARD</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm">3. Grit Bonus (Streak)</h4>
            <p className="text-xs text-muted-foreground">Consistency is key in engineering.</p>
            <div className="mt-2 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-center justify-between">
              <span className="text-sm font-bold text-orange-400">10+ DAY STREAK</span>
              <span className="text-lg font-black text-orange-500">+50.0 PTS</span>
            </div>
          </div>

          <div className="text-sm p-4 bg-zinc-900 border border-white/5 rounded-xl text-center">
            <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1">Final Calculation</div>
            <div className="font-black text-white">
              (QUALITY + EFFICIENCY) × MULTIPLIER + STREAK
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
