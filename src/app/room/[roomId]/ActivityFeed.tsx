"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function ActivityFeed({ activity }: { activity: any[] }) {
  if (!activity || activity.length === 0) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>No recent code submissions in this room.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>See what others are solving and learning.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activity.map((sub) => (
            <div key={sub.id} className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <div className="flex items-center gap-2">
                  {sub.problemSubmit?.difficulty && (
                    <div className={`w-2.5 h-2.5 rounded-full ${
                      sub.problemSubmit.difficulty === 'Easy' ? 'bg-green-500' :
                      sub.problemSubmit.difficulty === 'Medium' ? 'bg-orange-500' :
                      'bg-red-500'
                    }`} title={sub.problemSubmit.difficulty} />
                  )}
                  <p className="font-semibold">{sub.user.name || sub.user.email} <span className="text-muted-foreground font-normal">solved</span> {sub.problemSlug}</p>
                </div>
                <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                  <span>Quality: <span className="text-primary font-bold">{sub.codeQuality}/3</span></span>
                  <span>Complexity: <span className="text-primary font-bold">{sub.complexityScore}/5</span></span>
                  {sub.problemSubmit && (
                    <span>Attempts: <span className="font-bold">{sub.problemSubmit.attempts}</span></span>
                  )}
                </div>
              </div>
              <div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">View Code</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>{sub.user.name}&apos;s Solution for {sub.problemSlug}</DialogTitle>
                      <DialogDescription>
                        AI Scores • Quality: {sub.codeQuality}/3 • Complexity: {sub.complexityScore}/5
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 bg-muted p-4 rounded-md overflow-auto max-h-[40vh]">
                      <pre className="font-mono text-sm"><code>{sub.code}</code></pre>
                    </div>
                    {sub.aiReview && (
                      <div className="mt-4 border-t pt-4">
                        <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
                          <span className="inline-block w-2 h-2 rounded-full bg-fuchsia-500" />
                          AI Code Review
                        </h4>
                        <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                          {sub.aiReview}
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
