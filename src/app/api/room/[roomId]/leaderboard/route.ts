import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { roomId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const roomId = params.roomId;

  // Verify membership
  const member = await prisma.roomMember.findUnique({
    where: {
      userId_roomId: {
        userId: session.user.id,
        roomId: roomId
      }
    }
  });

  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      members: {
        include: { user: true }
      }
    }
  });

  if (!room) return NextResponse.json({ error: "Not Found" }, { status: 404 });

  const memberIds = room.members.map(m => m.userId);
  const now = new Date();
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const marathonStart = new Date(new Date(room.lastRestartedAt).setUTCHours(0, 0, 0, 0));

  const [scores, roomSubmissions, todayScores] = await Promise.all([
    prisma.scoreRecord.groupBy({
      by: ['userId'],
      _sum: { finalScore: true, baseScore: true },
      where: { 
        userId: { in: memberIds },
        date: { gte: marathonStart }
      }
    }),
    prisma.problemSubmission.findMany({
      where: { 
        userId: { in: memberIds },
        date: { gte: marathonStart }
      },
      include: { 
        codeSubmissions: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        } 
      }
    }),
    prisma.scoreRecord.findMany({
      where: { 
        userId: { in: memberIds },
        date: { gte: todayStart }
      }
    })
  ]);

  return NextResponse.json({ 
    scores, 
    roomSubmissions, 
    todayScores,
    roomMembers: room.members,
    marathonStart,
    todayStart
  });
}
