"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { History, Trophy, Calendar } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function MarathonHistory({ marathons }: { marathons: any[] }) {
  if (!marathons || marathons.length === 0) return null;

  return (
    <Card className="mt-8 border-zinc-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <History className="h-5 w-5 text-zinc-500" /> Previous Marathons
        </CardTitle>
        <CardDescription>Records of past competition cycles in this room.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {marathons.map((marathon) => (
            <AccordionItem key={marathon.id} value={marathon.id} className="border-zinc-800">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex flex-1 items-center justify-between pr-4">
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-lg">{marathon.name}</span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(marathon.endedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {marathon.results.slice(0, 3).map((res: any, idx: number) => (
                      <div key={res.id} className="flex items-center gap-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-zinc-400' : 'bg-orange-600'}`} />
                        <span className="text-[10px] text-zinc-400 truncate max-w-[60px]">{res.user.name || "User"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-4 space-y-2">
                  {marathon.results.sort((a: any, b: any) => b.score - a.score).map((result: any, index: number) => (
                    <div key={result.id} className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/30 border border-white/5">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-zinc-600 w-4">#{index + 1}</span>
                        <span className="text-sm font-bold">{result.user.name || result.user.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-primary">{result.score.toFixed(1)}</span>
                        {index === 0 && <Trophy className="h-3 w-3 text-yellow-500" />}
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
