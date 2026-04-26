"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoomsView } from "./RoomsView";
import { OverviewView } from "./OverviewView";

export function Dashboard({ user }: { user: any }) {
  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2 mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview & Daily Code</TabsTrigger>
          <TabsTrigger value="rooms">Rooms & Leaderboards</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <OverviewView user={user} />
        </TabsContent>
        <TabsContent value="rooms" className="space-y-4">
          <RoomsView user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
