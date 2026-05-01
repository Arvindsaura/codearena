import { PrismaClient } from "@prisma/client";

async function reset() {
  const prisma = new PrismaClient();
  const roomId = "cmoh1pgjo0000lg04xpg9qd5y";
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  today.setHours(0, 0, 0, 0);

  // If in India (+05:30), start of today is UTC 18:30 of previous day
  const startOfTodayUTC = new Date(today.getTime() - (12 * 60 * 60 * 1000));

  try {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { members: true }
    });
    
    if (!room) return;

    const memberIds = room.members.map(m => m.userId);
    
    console.log("Resetting scores for members:", memberIds);

    const resetScores = await prisma.scoreRecord.updateMany({
      where: { 
        userId: { in: memberIds },
        date: { gte: startOfTodayUTC }
      },
      data: {
        baseScore: 0,
        weightedScore: 0,
        finalScore: 0,
        streakBonus: 0,
        speedBonus: 0
      }
    });

    const resetSubmissions = await prisma.codeSubmission.updateMany({
      where: {
        userId: { in: memberIds },
        date: { gte: startOfTodayUTC }
      },
      data: {
        codeQuality: 0,
        complexityScore: 0,
        aiReview: null
      }
    });

    console.log(`Successfully reset ${resetScores.count} score records and ${resetSubmissions.count} code submissions for today.`);
  } finally {
    await prisma.$disconnect();
  }
}

reset();
