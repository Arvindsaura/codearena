"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, Info } from "lucide-react";

export function ScoreDetailsDialog({ user, metrics, quality, complexity }: { 
  user: any, 
  metrics: any, 
  quality: number, 
  complexity: number 
}) {
  const metricLabels: Record<string, string> = {
    algorithmElegance: "logic & elegance",
    approachCleverness: "problem solving depth",
    codeStructure: "architecture & flow",
    optimizationLevel: "resource efficiency",
    robustness: "error resilience",
    patternUsage: "design patterns",
    constraintHandling: "edge case logic",
    codeClarity: "readability & docs",
    microOptimizations: "micro-tuning",
    riskFactor: "safety & stability"
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-600 hover:text-white transition-colors">
          <Eye className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-black border border-zinc-900 rounded-none p-10">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold text-white lowercase">
            system metrics: {user.name?.toLowerCase()}
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-600 lowercase mt-2">
            aggregated performance diagnostics for this node.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-8 py-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-950 border border-zinc-900 p-5 text-center">
              <span className="text-[10px] text-zinc-600 block uppercase font-bold tracking-widest mb-2">quality</span>
              <span className="text-2xl font-black text-white">{quality.toFixed(1)}</span>
            </div>
            <div className="bg-zinc-950 border border-zinc-900 p-5 text-center">
              <span className="text-[10px] text-zinc-600 block uppercase font-bold tracking-widest mb-2">efficiency</span>
              <span className="text-2xl font-black text-white">{complexity.toFixed(1)}</span>
            </div>
          </div>

          <div className="space-y-6">
            {Object.entries(metrics).map(([key, value]: [string, any]) => (
              <div key={key} className="flex justify-between items-center text-xs">
                <span className="text-zinc-500 font-medium lowercase">{metricLabels[key]}</span>
                <span className="text-white font-bold">{Number(value).toFixed(1)}</span>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-zinc-900">
            <h4 className="text-[10px] uppercase font-bold tracking-widest text-zinc-600 flex items-center gap-2 mb-4">
              <Info className="w-3 h-3" />
              logic formulas
            </h4>
            <div className="space-y-3 text-[10px] text-zinc-500 lowercase leading-relaxed">
              <p><span className="text-zinc-300 font-bold">quality:</span> average of logic, architecture, resilience, and readability.</p>
              <p><span className="text-zinc-300 font-bold">efficiency:</span> average of resource tuning, patterns, and stability.</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
