import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code } = await req.json();
  if (!code) return NextResponse.json({ error: "Code missing" }, { status: 400 });

  const room = await prisma.room.findUnique({ where: { code: code.toUpperCase() } });
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  try {
    await prisma.roomMember.create({
      data: {
        roomId: room.id,
        userId: session.user.id
      }
    });
    return NextResponse.json({ success: true, room });
  } catch (e: any) {
    if (e.code === 'P2002') {
      return NextResponse.json({ error: "Already a member" }, { status: 400 });
    }
    return NextResponse.json({ error: "Error joining room" }, { status: 500 });
  }
}
