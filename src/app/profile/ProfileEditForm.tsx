"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Camera, Check } from "lucide-react";
import { useRouter } from "next/navigation";

const AVATAR_PRESETS = [
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Felix",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Luna",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Oliver",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Milo",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Aria",
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=Leo",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Maya",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Finn",
];

export function ProfileEditForm({ user }: { user: any }) {
  const [name, setName] = useState(user.name || "");
  const [selectedImage, setSelectedImage] = useState(user.image || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const handleUpdate = async () => {
    if (!name.trim()) return toast.error("Nickname cannot be empty");
    
    setIsUpdating(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image: selectedImage }),
      });

      if (res.ok) {
        toast.success("Profile updated successfully!");
        router.refresh();
      } else {
        toast.error("Failed to update profile.");
      }
    } catch (e) {
      toast.error("Network error.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="grid gap-6">
        <div className="space-y-2">
          <Label className="text-xs uppercase font-black tracking-widest text-zinc-500">Nickname</Label>
          <Input 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            placeholder="Your arena name..."
            className="h-12 bg-white/5 border-white/10 rounded-xl focus:border-fuchsia-500/50"
          />
        </div>

        <div className="space-y-4">
          <Label className="text-xs uppercase font-black tracking-widest text-zinc-500 flex items-center gap-2">
            <Camera className="h-3 w-3" /> Choose Caricature
          </Label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
            {AVATAR_PRESETS.map((url) => (
              <button
                key={url}
                onClick={() => setSelectedImage(url)}
                className={`relative rounded-2xl overflow-hidden border-2 transition-all hover:scale-105 active:scale-95 ${
                  selectedImage === url ? "border-fuchsia-500 ring-4 ring-fuchsia-500/20" : "border-white/5 grayscale hover:grayscale-0"
                }`}
              >
                <img src={url} alt="Avatar Preset" className="w-full aspect-square" />
                {selectedImage === url && (
                  <div className="absolute inset-0 bg-fuchsia-500/10 flex items-center justify-center">
                    <Check className="h-6 w-6 text-fuchsia-500" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button 
        onClick={handleUpdate} 
        disabled={isUpdating}
        className="w-full h-12 rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-600 font-bold"
      >
        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Save Changes"}
      </Button>
    </div>
  );
}
