import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeCode } from "@/lib/ai";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { codeSubmissionId } = await req.json();
  if (!codeSubmissionId) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  const codeSub = await prisma.codeSubmission.findUnique({
    where: { id: codeSubmissionId }
  });

  if (!codeSub || codeSub.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { codeQuality, complexityScore, review } = await analyzeCode(codeSub.code);

  const updated = await prisma.codeSubmission.update({
    where: { id: codeSubmissionId },
    data: {
      codeQuality,
      complexityScore,
      aiReview: review
    }
  });

  return NextResponse.json({ success: true, submission: updated });
}
