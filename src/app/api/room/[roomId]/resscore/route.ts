import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeCode } from "@/lib/ai";

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

  // 2. Fetch all members and their latest submissions
  const members = await prisma.roomMember.findMany({
    where: { roomId },
    include: {
      user: {
        include: {
          codeSubmits: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: { problemSubmit: true }
          }
        }
      }
    }
  });

  // 3. Perform bulk re-scoring
  console.log(`🚀 Bulk re-scoring started for room ${roomId}...`);
  
  for (const member of members) {
    const latestSub = member.user.codeSubmits[0];
    if (latestSub && latestSub.problemSubmit) {
      try {
        const aiResult = await analyzeCode(latestSub.code);
        
        const oldQuality = latestSub.codeQuality || 0;
        const oldComplexity = latestSub.complexityScore || 0;

        // Update CodeSubmission
        await prisma.codeSubmission.update({
          where: { id: latestSub.id },
          data: {
            codeQuality: aiResult.codeQuality,
            complexityScore: aiResult.complexityScore,
            aiReview: aiResult.formattedReview,
            algorithmElegance: aiResult.algorithmElegance,
            approachCleverness: aiResult.approachCleverness,
            codeStructure: aiResult.codeStructure,
            optimizationLevel: aiResult.optimizationLevel,
            robustness: aiResult.robustness,
            patternUsage: aiResult.patternUsage,
            constraintHandling: aiResult.constraintHandling,
            codeClarity: aiResult.codeClarity,
            microOptimizations: aiResult.microOptimizations,
            riskFactor: aiResult.riskFactor
          }
        });

        // Update ScoreRecord
        const diffBase = (aiResult.codeQuality + aiResult.complexityScore) - (oldQuality + oldComplexity);
        const multiplier = latestSub.problemSubmit.difficulty === "Easy" ? 1.0 : latestSub.problemSubmit.difficulty === "Hard" ? 2.2 : 1.5;
        const diffWeighted = diffBase * multiplier;

        await prisma.scoreRecord.update({
          where: {
            userId_date: {
              userId: member.userId,
              date: latestSub.date
            }
          },
          data: {
            baseScore: { increment: diffBase },
            weightedScore: { increment: diffWeighted },
            finalScore: { increment: diffWeighted }
          }
        });
      } catch (e) {
        console.error(`Failed to re-score user ${member.userId}:`, e);
      }
    }
  }

  // 4. Clear votes after success
  await prisma.restartVote.deleteMany({ where: { roomId } });

  return NextResponse.json({ success: true });
}
