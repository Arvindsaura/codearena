"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function RoomsView({ user }: { user: any }) {
  const [rooms, setRooms] = useState([]);
  const [joinCode, setJoinCode] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/rooms");
      if (res.ok) {
        const data = await res.json();
        setRooms(data.rooms || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleCreateRoom = async () => {
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newRoomName }),
      });
      if (res.ok) {
        toast.success("Room created!");
        setNewRoomName("");
        fetchRooms();
      } else {
        toast.error("Failed to create room.");
      }
    } catch (e) {
      toast.error("Error creating room.");
    }
  };

  const handleJoinRoom = async () => {
    try {
      const res = await fetch("/api/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: joinCode }),
      });
      if (res.ok) {
        toast.success("Joined room!");
        setJoinCode("");
        fetchRooms();
      } else {
        toast.error("Invalid join code or already joined.");
      }
    } catch (e) {
      toast.error("Error joining room.");
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Your Rooms</CardTitle>
          <CardDescription>Compete with friends</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm">Loading rooms...</p>
          ) : rooms.length === 0 ? (
            <p className="text-sm text-muted-foreground">You haven&apos;t joined any rooms yet.</p>
          ) : (
            <div className="space-y-4">
              {rooms.map((room: any) => (
                <div key={room.id} className="flex justify-between items-center p-3 border rounded-md">
                  <div>
                    <h4 className="font-semibold">{room.room.name}</h4>
                    <p className="text-xs text-muted-foreground">Code: <span className="font-mono">{room.room.code}</span></p>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href={`/room/${room.roomId}`}>View</Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Join Room</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Input 
                placeholder="Enter 6-digit Code" 
                value={joinCode} 
                onChange={e => setJoinCode(e.target.value)}
              />
              <Button onClick={handleJoinRoom} disabled={!joinCode}>Join</Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Create Room</CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">Create New Room</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a new Room</DialogTitle>
                  <DialogDescription>
                    Invite your friends to compete.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input id="name" value={newRoomName} onChange={e => setNewRoomName(e.target.value)} className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateRoom} disabled={!newRoomName}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
