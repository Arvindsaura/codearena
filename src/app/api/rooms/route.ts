import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rooms = await prisma.roomMember.findMany({
    where: { userId: session.user.id },
    include: { room: true },
  });

  return NextResponse.json({ rooms });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: "Name missing" }, { status: 400 });

  // Generate 6 digit code
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();

  const room = await prisma.room.create({
    data: {
      name,
      code,
      createdBy: session.user.id,
      members: {
        create: {
          userId: session.user.id
        }
      }
    }
  });

  return NextResponse.json({ room });
}
