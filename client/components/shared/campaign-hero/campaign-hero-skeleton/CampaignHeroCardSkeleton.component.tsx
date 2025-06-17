import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function CampaignHeroCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0 mb-6">
        <CardTitle className="flex flex-row text-2xl font-semibold w-full justify-between">
          <Skeleton className="h-12 w-[70%] border-4" />
          <Skeleton className="h-12 w-[10%]" />
        </CardTitle>
      </CardHeader>

      <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {
          Array.from({ length: 3 }).map((_, index) => {
            return (<div className="space-y-4 col-span-1" key={index}>
              {[...Array(6)].map((_, index) => {
                return (
                  <div className="flex items-center" key={index}>
                    <Skeleton className="h-5 w-5 mr-2" />
                    <Skeleton className="h-4 w-[80%]" />
                  </div>
                )
              })}
            </div>)
          })
        }
      </CardContent>
    </Card>
  );
}

export default CampaignHeroCardSkeleton;