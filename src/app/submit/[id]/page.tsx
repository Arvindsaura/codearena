import { Navbar } from "@/components/Navbar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CodeSubmitForm } from "./CodeSubmitForm";

export default async function SubmitPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/");

  const submission = await prisma.problemSubmission.findUnique({
    where: { id: params.id },
  });

  if (!submission || submission.userId !== session.user.id) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-8 max-w-2xl px-4 md:px-8">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Submit Code</h1>
        <p className="text-muted-foreground mb-6">
          Paste your code for <span className="font-semibold text-primary">{submission.problemSlug}</span> to get AI evaluation.
        </p>
        <CodeSubmitForm problemSlug={submission.problemSlug} submissionId={submission.id} />
      </div>
    </main>
  );
}
