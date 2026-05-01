import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import axios from "axios";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || !user.leetcodeUser) {
    return NextResponse.json({ error: "LeetCode username not set" }, { status: 400 });
  }

  const query = `
    query recentSubmissions($username: String!, $limit: Int) {
      recentSubmissionList(username: $username, limit: $limit) {
        title
        titleSlug
        timestamp
        statusDisplay
        lang
      }
    }
  `;

  try {
    const response = await axios.post("https://leetcode.com/graphql", {
      query,
      variables: { username: user.leetcodeUser, limit: 15 }
    });

    const submissions = response.data?.data?.recentSubmissionList || [];
    
    // Group by problemSlug for today
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    for (const sub of submissions) {
      const subDate = new Date(parseInt(sub.timestamp) * 1000);
      if (subDate >= today) {
        // Upsert into our DB
        await prisma.problemSubmission.upsert({
          where: {
            userId_problemSlug_date: {
              userId: user.id,
              problemSlug: sub.titleSlug,
              date: today,
            }
          },
          update: {
            isAccepted: sub.statusDisplay === "Accepted" ? true : undefined,
            status: sub.statusDisplay
          },
          create: {
            userId: user.id,
            problemSlug: sub.titleSlug,
            status: sub.statusDisplay,
            timestamp: parseInt(sub.timestamp),
            isAccepted: sub.statusDisplay === "Accepted",
            difficulty: "Medium", // Optional: separate fetch for difficulty
            date: today,
          }
        });
      }
    }

    // Fetch the updated latest from DB
    const dailySubmissions = await prisma.problemSubmission.findMany({
      where: { userId: user.id, date: today },
      include: { codeSubmissions: true }
    });

    return NextResponse.json({ submissions: dailySubmissions });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch from LeetCode" }, { status: 500 });
  }
}
