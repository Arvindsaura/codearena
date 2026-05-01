import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { roomId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const roomId = params.roomId;

  // Toggle vote
  const existingVote = await prisma.restartVote.findUnique({
    where: {
      roomId_userId: { roomId, userId: session.user.id }
    }
  });

  if (existingVote) {
    await prisma.restartVote.delete({
      where: { id: existingVote.id }
    });
  } else {
    await prisma.restartVote.create({
      data: { roomId, userId: session.user.id }
    });
  }

  // Get stats
  const votes = await prisma.restartVote.count({ where: { roomId } });
  const totalMembers = await prisma.roomMember.count({ where: { roomId } });
  const threshold = Math.ceil(totalMembers * 0.8);
  const isThresholdMet = votes >= threshold;

  return NextResponse.json({ 
    success: true, 
    votes, 
    totalMembers, 
    threshold, 
    isThresholdMet,
    hasVoted: !existingVote 
  });
}

export async function GET(req: Request, { params }: { params: { roomId: string } }) {
    const session = await getServerSession(authOptions);
    const roomId = params.roomId;

    const votes = await prisma.restartVote.count({ where: { roomId } });
    const totalMembers = await prisma.roomMember.count({ where: { roomId } });
    const threshold = Math.ceil(totalMembers * 0.8);
    const userVote = session?.user ? await prisma.restartVote.findUnique({
        where: { roomId_userId: { roomId, userId: session.user.id } }
    }) : null;

    return NextResponse.json({ 
        votes, 
        totalMembers, 
        threshold, 
        hasVoted: !!userVote 
    });
}
