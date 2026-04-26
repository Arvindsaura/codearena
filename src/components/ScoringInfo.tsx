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
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm">1. Attempt Efficiency</h4>
            <p className="text-xs text-muted-foreground">The fewer attempts it takes to get accepted, the better.</p>
            <div className="text-sm mt-2 grid grid-cols-2 gap-2 bg-muted p-2 rounded-md">
              <span>1 attempt: <span className="font-bold text-green-500">+6 pts</span></span>
              <span>2 attempts: <span className="font-bold text-green-500">+4 pts</span></span>
              <span>3 attempts: <span className="font-bold text-green-500">+2 pts</span></span>
              <span>&gt;3 attempts: <span className="font-bold text-muted-foreground">0 pts</span></span>
              <span>&gt;5 attempts: <span className="font-bold text-red-500">-2 pts</span></span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm">2. AI Evaluation (Code Quality & Complexity)</h4>
            <p className="text-xs text-muted-foreground">Gemini AI evaluates your pasted solution.</p>
            <ul className="text-sm list-disc pl-4 mt-2">
              <li><span className="font-semibold">Quality (1-3 pts):</span> Readability, naming conventions, and best practices.</li>
              <li><span className="font-semibold">Complexity (0-5 pts):</span> Time and space complexity efficiency.</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm">3. Difficulty Multiplier</h4>
            <p className="text-xs text-muted-foreground">Base Score is multiplied by the problem&apos;s difficulty.</p>
            <div className="text-sm mt-2 grid grid-cols-3 gap-2 bg-muted p-2 rounded-md font-medium text-center">
              <span className="text-green-500">Easy x1.0</span>
              <span className="text-orange-500">Medium x1.5</span>
              <span className="text-red-500">Hard x2.2</span>
            </div>
          </div>
          <div className="text-sm p-3 bg-primary/10 rounded-lg text-center font-semibold">
            Final Score = (Attempts + Quality + Complexity) × Multiplier
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
