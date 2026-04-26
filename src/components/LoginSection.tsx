"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { LogIn, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LoginSection() {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    setIsLoading(true);
    await signIn("credentials", {
      username: username.trim(),
      callbackUrl: "/",
    });
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-8 w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
      <div className="relative w-full">
        <Input
          type="text"
          placeholder="Enter LeetCode username..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="h-14 px-6 rounded-full bg-white/5 border-white/20 text-white placeholder:text-zinc-500 focus:border-fuchsia-500/50 focus:ring-fuchsia-500/20"
        />
      </div>
      <Button
        type="submit"
        disabled={isLoading || !username.trim()}
        className="h-14 px-8 rounded-full bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] border-none"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <LogIn className="w-5 h-5" />
            <span>Enter Arena</span>
          </>
        )}
      </Button>
    </form>
  );
}
