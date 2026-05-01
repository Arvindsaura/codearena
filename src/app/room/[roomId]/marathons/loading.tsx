import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="container max-w-5xl py-10 space-y-8 animate-in fade-in duration-500">
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="grid gap-8">
        {[1, 2].map((i) => (
          <Card key={i} className="border-zinc-800 bg-zinc-900/20 overflow-hidden">
            <CardHeader className="bg-zinc-900/40 border-b border-zinc-800 p-6">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-8 w-8 rounded-full border-2 border-zinc-900" />
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-800">
                <div className="p-6 space-y-4">
                  <Skeleton className="h-4 w-32" />
                  <div className="space-y-2">
                    {[1, 2, 3].map((j) => (
                      <Skeleton key={j} className="h-12 w-full rounded-xl" />
                    ))}
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <Skeleton className="h-4 w-32" />
                  <div className="space-y-2">
                    {[1, 2, 3].map((j) => (
                      <Skeleton key={j} className="h-10 w-full rounded-xl" />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
