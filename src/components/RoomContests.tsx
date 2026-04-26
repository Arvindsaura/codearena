"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy } from "lucide-react";

export function RoomContests({ roomId }: { roomId: string }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContests() {
      try {
        const res = await fetch(`/api/rooms/${roomId}/contests`);
        if (res.ok) {
          const json = await res.json();
          setData(json.contests || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchContests();
  }, [roomId]);

  if (loading) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-yellow-500" /> Contest Standings</CardTitle>
          <CardDescription>Loading real-time LeetCode contest statistics...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (data.length === 0) {
    return null;
  }

  return (
    <Card className="mt-8 border-yellow-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" /> Contest Standings
        </CardTitle>
        <CardDescription>Global rating and performance in the latest contests.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Global Rating</TableHead>
              <TableHead>Last Contest</TableHead>
              <TableHead className="text-right">Ranking / Delta</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.user.id}>
                <TableCell className="font-medium">
                  {row.user.name || row.user.email}
                </TableCell>
                <TableCell>
                  {row.rankingInfo?.rating ? Math.round(row.rankingInfo.rating) : "Unrated"}
                  {row.rankingInfo?.topPercentage && (
                    <span className="text-xs text-muted-foreground ml-2">Top {row.rankingInfo.topPercentage}%</span>
                  )}
                </TableCell>
                <TableCell>
                  {row.lastContest ? row.lastContest.contest.title : "None"}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {row.lastContest ? `#${row.lastContest.ranking}` : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
