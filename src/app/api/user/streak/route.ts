import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch all distinct dates the user has an accepted submission, sorted desc
  const submissions = await prisma.problemSubmission.findMany({
    where: { userId: session.user.id, isAccepted: true },
    select: { date: true },
    distinct: ["date"],
    orderBy: { date: "desc" },
  });

  if (submissions.length === 0) {
    return NextResponse.json({ streak: 0, longestStreak: 0, totalDays: 0 });
  }

  // Normalize dates to just YYYY-MM-DD strings for comparison
  const activeDates = submissions.map(s => {
    const d = new Date(s.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  });

  // Remove duplicates
  const uniqueDates = Array.from(new Set(activeDates)).sort((a, b) => b - a);

  const ONE_DAY = 86400000;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();

  // Calculate current streak
  let currentStreak = 0;
  // Check if today or yesterday is the most recent active date (allow grace for today not yet solved)
  const mostRecent = uniqueDates[0];
  if (mostRecent !== todayMs && mostRecent !== todayMs - ONE_DAY) {
    currentStreak = 0; // streak is broken
  } else {
    let checkDate = mostRecent;
    for (const dateMs of uniqueDates) {
      if (dateMs === checkDate) {
        currentStreak++;
        checkDate -= ONE_DAY;
      } else if (dateMs < checkDate) {
        break;
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 1;
  let tempStreak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    if (uniqueDates[i - 1] - uniqueDates[i] === ONE_DAY) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  return NextResponse.json({
    streak: currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    totalDays: uniqueDates.length,
  });
}
