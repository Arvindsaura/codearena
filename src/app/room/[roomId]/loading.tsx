import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="container max-w-7xl py-10 space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="flex flex-wrap gap-4">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <Card className="md:col-span-3 border-zinc-800 bg-zinc-900/20">
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-64 w-full rounded-xl" />
          </CardContent>
        </Card>
        <div className="space-y-6">
           <Skeleton className="h-40 w-full rounded-2xl" />
           <Skeleton className="h-60 w-full rounded-2xl" />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
        </div>
        <div className="space-y-6">
           <Skeleton className="h-8 w-48" />
           <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
