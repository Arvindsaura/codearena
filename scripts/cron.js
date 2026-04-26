const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');

console.log("Starting CodeArena Cron Jobs...");

// Run daily at 23:50 to process unattempted, assign -2, update streaks
cron.schedule('50 23 * * *', async () => {
  console.log("Running Daily End-of-Day Cron Job...");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const users = await prisma.user.findMany();
    for (const user of users) {
      if (!user.leetcodeUser) continue;
      
      const record = await prisma.scoreRecord.findUnique({
        where: { userId_date: { userId: user.id, date: today } }
      });

      if (!record || record.baseScore === 0) {
        // No score log or no attempt = penalty
        await prisma.scoreRecord.upsert({
          where: { userId_date: { userId: user.id, date: today } },
          create: {
            userId: user.id,
            date: today,
            baseScore: -2,
            weightedScore: -2,
            finalScore: -2,
          },
          update: {
            baseScore: -2,
            weightedScore: -2,
            finalScore: -2,
          }
        });
      }
    }
    console.log("Daily Cron Job Completed");
  } catch (err) {
    console.error("Cron Error:", err);
  }
});
