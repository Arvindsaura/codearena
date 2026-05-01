import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeCode } from "@/lib/ai";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { codeSubmissionId, newCode } = await req.json();
  if (!codeSubmissionId) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  let codeSub = await prisma.codeSubmission.findUnique({
    where: { id: codeSubmissionId }
  });

  if (!codeSub || codeSub.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // If new code is provided, update it first
  if (newCode) {
    codeSub = await prisma.codeSubmission.update({
      where: { id: codeSubmissionId },
      data: { code: newCode }
    });
  }

  const aiResult = await analyzeCode(codeSub.code);
  const { codeQuality, complexityScore, formattedReview } = aiResult;

  const oldQuality = codeSub.codeQuality || 0;
  const oldComplexity = codeSub.complexityScore || 0;

  const updated = await prisma.codeSubmission.update({
    where: { id: codeSubmissionId },
    data: {
      codeQuality,
      complexityScore,
      aiReview: formattedReview,
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
    },
    include: {
      problemSubmit: true
    }
  });

  // Update ScoreRecord if score changed
  if (updated.problemSubmit) {
    const diffBase = (codeQuality + complexityScore) - (oldQuality + oldComplexity);
    const multiplier = updated.problemSubmit.difficulty === "Easy" ? 1.0 : updated.problemSubmit.difficulty === "Hard" ? 2.2 : 1.5;
    const diffWeighted = diffBase * multiplier;

    await prisma.scoreRecord.update({
      where: {
        userId_date: {
          userId: session.user.id,
          date: codeSub.date
        }
      },
      data: {
        baseScore: { increment: diffBase },
        weightedScore: { increment: diffWeighted },
        finalScore: { increment: diffWeighted }
      }
    });
  }

  revalidatePath("/");
  revalidatePath("/room/[roomId]");

  return NextResponse.json({ success: true, submission: updated });
}
