import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card";

export default function PageSkeleton() {
  return (
    <div className="flex flex-col max-w-[1400px] gap-6" >
      <section className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">

        <div className="md:col-span-2 lg:col-span-4">
          <div className="w-full rounded-xl border bg-card text-card-foreground p-4 shadow-md ">
            <Card className="p-4 shadow-md animate-pulse flex flex-col gap-2">
                <Skeleton className="h-10 w-[60%] mb-2" />
                <Skeleton className="h-4 w-[80%]" />
                <Skeleton className="h-4 w-[80%]" />
                <Skeleton className="h-4 w-[100px]" />
            </Card>
          </div>
        </div>

        <div className="col-span-1 md:col-span-2 lg:col-span-2 border-2 h-[70%] max-h-[100%] rounded-lg flex flex-col">
          <Card className="p-4 shadow-md animate-pulse flex flex-col gap-2">
              <Skeleton className="h-6 w-[80%] mb-2 " />
              <Skeleton className="h-4 w-[60%] " />
              <Skeleton className="h-4 w-[60%]" />
              <Skeleton className="h-4 w-[60%]" />
              <Skeleton className="h-4 w-[60%]" />
          </Card>
        </div>
      </section>

      <section className="col-span-1 lg:col-span-3">
        <Card className="p-4 shadow-md animate-pulse flex flex-col gap-2">
            <Skeleton className="h-10 w-[60%] mb-2" />
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-[100px]" />
        </Card>
      </section>
    </div>
  )
}