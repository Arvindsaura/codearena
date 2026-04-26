"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function OverviewView({ user }: { user: any }) {
  const [leetcodeUsername, setLeetcodeUsername] = useState(user.leetcodeUser || "");
  const [isSaving, setIsSaving] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(!!user.leetcodeUser);
  const [streak, setStreak] = useState({ streak: 0, longestStreak: 0, totalDays: 0 });
  const router = useRouter();

  useEffect(() => {
    if (user.leetcodeUser) {
      fetchSubmissions();
      fetchStreak();
    }
  }, [user.leetcodeUser]);

  const fetchStreak = async () => {
    try {
      const res = await fetch("/api/user/streak");
      if (res.ok) {
        const data = await res.json();
        setStreak(data);
      }
    } catch (e) { /* ignore */ }
  };

  const saveUsername = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/user/leetcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: leetcodeUsername }),
      });
      if (res.ok) {
        toast.success("LeetCode username saved!");
        setIsConfigured(true);
        fetchSubmissions();
      } else {
        toast.error("Failed to save username");
      }
    } catch (e) {
      toast.error("Error saving username");
    }
    setIsSaving(false);
  };

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/leetcode/sync");
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions || []);
      }
    } catch (e) {
      // Ignore
    }
    setIsLoading(false);
  };

  if (!isConfigured) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connect LeetCode</CardTitle>
          <CardDescription>Enter your LeetCode username to sync your daily activity.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="username">LeetCode Username</Label>
            <Input 
              type="text" 
              id="username" 
              placeholder="e.g. neetcode" 
              value={leetcodeUsername}
              onChange={(e) => setLeetcodeUsername(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={saveUsername} disabled={isSaving || !leetcodeUsername}>
            {isSaving ? "Saving..." : "Save & Sync"}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Streak & Stats Row */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent">
          <CardHeader className="pb-2">
            <CardDescription>Current Streak</CardDescription>
            <CardTitle className="text-4xl font-black text-orange-500 flex items-center gap-2">
              {streak.streak}
              <span className="text-2xl">🔥</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Consecutive days with accepted submissions</p>
          </CardContent>
        </Card>
        <Card className="border-fuchsia-500/20 bg-gradient-to-br from-fuchsia-500/5 to-transparent">
          <CardHeader className="pb-2">
            <CardDescription>Longest Streak</CardDescription>
            <CardTitle className="text-4xl font-black text-fuchsia-500 flex items-center gap-2">
              {streak.longestStreak}
              <span className="text-2xl">⚡</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Your all-time personal best streak</p>
          </CardContent>
        </Card>
        <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-transparent">
          <CardHeader className="pb-2">
            <CardDescription>Total Active Days</CardDescription>
            <CardTitle className="text-4xl font-black text-cyan-500 flex items-center gap-2">
              {streak.totalDays}
              <span className="text-2xl">📅</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Days you&apos;ve solved at least one problem</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Problems */}
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Problems</CardTitle>
          <CardDescription>Problems you submitted today on LeetCode</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Syncing from LeetCode...</p>
          ) : submissions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No submissions found for today. Solve something on LeetCode first!</p>
          ) : (
            <div className="space-y-4">
              {submissions.map((sub: any) => (
                <div key={sub.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">{sub.problemSlug}</h4>
                      <p className="text-xs text-muted-foreground">Status: {sub.status}</p>
                    </div>
                    <div>
                      {sub.isAccepted && !sub.codeSubmissions?.length ? (
                        <Button onClick={() => router.push(`/submit/${sub.id}`)}>Paste Code</Button>
                      ) : sub.codeSubmissions?.length ? (
                        <span className="text-green-500 text-sm font-medium">Logged & Evaluated</span>
                      ) : null}
                    </div>
                  </div>
                  {sub.codeSubmissions?.length > 0 && (
                    <div className="border-t pt-3 space-y-2">
                      <div className="flex gap-6 text-xs">
                        <span>Quality: <span className="font-bold text-fuchsia-400">{sub.codeSubmissions[0].codeQuality}/3</span></span>
                        <span>Complexity: <span className="font-bold text-cyan-400">{sub.codeSubmissions[0].complexityScore}/5</span></span>
                        <span>Attempts: <span className="font-bold">{sub.attempts}</span></span>
                      </div>
                      {sub.codeSubmissions[0].aiReview ? (
                        <div className="bg-muted/50 rounded-lg p-3 mt-2">
                          <h5 className="text-xs font-bold mb-1 flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full bg-fuchsia-500" />
                            Gemini Code Review
                          </h5>
                          <div className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                            {sub.codeSubmissions[0].aiReview}
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 text-fuchsia-400 border-fuchsia-500/30 hover:bg-fuchsia-500/10"
                          onClick={async () => {
                            toast.info("Generating AI review...");
                            try {
                              const res = await fetch("/api/code/review", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ codeSubmissionId: sub.codeSubmissions[0].id }),
                              });
                              if (res.ok) {
                                toast.success("AI review generated!");
                                fetchSubmissions();
                              } else {
                                toast.error("Failed to generate review.");
                              }
                            } catch {
                              toast.error("Error generating review.");
                            }
                          }}
                        >
                          ✨ Get AI Review
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
