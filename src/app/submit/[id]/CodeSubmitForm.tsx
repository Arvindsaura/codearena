"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function CodeSubmitForm({ problemSlug, submissionId }: { problemSlug: string, submissionId: string }) {
  const [code, setCode] = useState("");
  const [attempts, setAttempts] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, problemSlug, submissionId, attempts }),
      });
      if (res.ok) {
        toast.success("Code submitted and evaluated!");
        router.push("/");
      } else {
        toast.error("Failed to submit code. Have you already submitted today?");
      }
    } catch (e) {
      toast.error("Error submitting code.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="attempts">How many attempts did this take today?</Label>
        <Input 
          id="attempts" 
          type="number" 
          min="1" 
          value={attempts} 
          onChange={e => setAttempts(parseInt(e.target.value) || 1)} 
          className="max-w-[200px]"
        />
        <p className="text-xs text-muted-foreground">Honesty is key! Your attempts factor heavily into your AI multiplier.</p>
      </div>
      <Textarea 
        placeholder="Paste your daily solution here..." 
        value={code} 
        onChange={e => setCode(e.target.value)}
        className="min-h-[300px] font-mono whitespace-pre"
      />
      <Button disabled={isSubmitting || !code.trim() || attempts < 1} onClick={handleSubmit} className="w-full">
        {isSubmitting ? "Evaluating..." : "Submit Code"}
      </Button>
    </div>
  );
}
