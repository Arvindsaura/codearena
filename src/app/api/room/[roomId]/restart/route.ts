import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { roomId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const roomId = params.roomId;

  // 1. Verify 80% majority
  const votes = await prisma.restartVote.count({ where: { roomId } });
  const totalMembers = await prisma.roomMember.count({ where: { roomId } });
  const threshold = Math.ceil(totalMembers * 0.8);

  if (votes < threshold) {
    return NextResponse.json({ error: "Majority not reached" }, { status: 403 });
  }

  // 2. Fetch current standings for archiving
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      members: {
        include: { user: true }
      }
    }
  });

  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  const memberIds = room.members.map(m => m.userId);
  
  // 3. Create Marathon Archive
  const marathonName = `Marathon ${new Date().toLocaleDateString()}`;
  const startOfCycle = new Date(room.lastRestartedAt);
  startOfCycle.setHours(0, 0, 0, 0); // Include the whole day of the last restart
  
  // Aggregate current scores (only since last restart)
  const scores = await prisma.scoreRecord.groupBy({
    by: ['userId'],
    _sum: { finalScore: true },
    where: { 
      userId: { in: memberIds },
      date: { gte: startOfCycle }
    }
  });

  const marathon = await prisma.marathon.create({
    data: {
      roomId,
      name: marathonName,
      startedAt: room.lastRestartedAt,
      endedAt: new Date(),
      results: {
        create: scores.map(s => ({
          userId: s.userId,
          score: s._sum.finalScore || 0,
          rank: 0 
        }))
      }
    }
  });

  // 4. Update Room Restart Date to TOMORROW at midnight
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  await prisma.room.update({
    where: { id: roomId },
    data: { lastRestartedAt: tomorrow }
  });

  // 5. Clear votes
  await prisma.restartVote.deleteMany({ where: { roomId } });

  return NextResponse.json({ success: true, marathonId: marathon.id });
}
