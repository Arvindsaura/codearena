import { PrismaClient } from "@prisma/client";

async function check() {
  const prisma = new PrismaClient();
  const roomId = "cmoh1pgjo0000lg04xpg9qd5y";
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { members: { include: { user: true } } }
    });
    
    if (!room) return;

    const memberIds = room.members.map(m => m.userId);
    
    const scores = await prisma.scoreRecord.findMany({
      where: { 
        userId: { in: memberIds },
        date: today
      }
    });

    console.log("Today's scores in DB:", JSON.stringify(scores, null, 2));
    console.log("Room lastRestartedAt:", room.lastRestartedAt);
  } finally {
    await prisma.$disconnect();
  }
}

check();
