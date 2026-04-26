import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import axios from "axios";

export async function GET(req: Request, { params }: { params: { roomId: string } }) {
  try {
    const room = await prisma.room.findUnique({
      where: { id: params.roomId },
      include: { members: { include: { user: true } } }
    });

    if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

    const query = `
      query userContestRankingInfo($username: String!) {
        userContestRanking {
          rating
          globalRanking
          topPercentage
        }
        userContestRankingHistory(username: $username) {
          contest {
            title
            startTime
          }
          rating
          ranking
        }
      }
    `;

    const results = [];

    for (const member of room.members) {
      if (!member.user.leetcodeUser) continue;
      
      try {
        const response = await axios.post("https://leetcode.com/graphql", {
          query,
          variables: { username: member.user.leetcodeUser }
        });
        
        const data = response.data?.data;
        if (data) {
          // Get only the attended contests
          const history = data.userContestRankingHistory?.filter((c: any) => c.ranking > 0) || [];
          const lastContest = history.length > 0 ? history[history.length - 1] : null;
          
          results.push({
            user: member.user,
            rankingInfo: data.userContestRanking,
            lastContest: lastContest
          });
        }
      } catch (err) {
        console.error("Error fetching contest for", member.user.leetcodeUser);
      }
    }

    // Sort by rating internally just in case UI needs it
    results.sort((a, b) => (b.rankingInfo?.rating || 0) - (a.rankingInfo?.rating || 0));

    return NextResponse.json({ contests: results });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
