import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function ProfileCampaignCardSkeleton() {
  return (
    <Card className="w-full rounded-md border col-span-2 md-lg:col-span-1 hover:bg-gray-200 duration-300 hover:scale-105 ">
      <CardHeader>
        <CardTitle className="flex text-lg font-semibold justify-between items-center">
          <Skeleton className="h-5 w-[70%]" />
          <Skeleton className="h-4 w-[20%]" />
        </CardTitle>

        <Skeleton className="h-4 w-[50%]" />

      </CardHeader>
      <CardContent className="grid gap-4 grid-cols-2">
        {
          Array.from({ length: 3 }).map((_, index) => {
            return (<div className="space-y-4 col-span-1" key={index}>
              {[...Array(3)].map((_, index) => {
                return (
                  <div className="flex items-center space-x-2" key={index}>
                    <Skeleton className="h-4 w-4" />
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

export default ProfileCampaignCardSkeleton;