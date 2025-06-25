import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SearchX } from "lucide-react"; // Import SearchOff icon
import Image from 'next/image';
import noDataSVG from '@/assets/svg/undraw_no-data_ig65.svg';

const NoCampaignsFoundFallback = () => {
  return (
    <Card className="p-4 shadow-md flex flex-row-reverse items-center justify-center gap-4">
      <CardHeader className="flex flex-col items-center">
        <SearchX className="w-12 h-12 text-gray-500" />
        <CardTitle className="mt-2">No Campaigns Found</CardTitle>
        <CardDescription>
          We couldn't find any campaigns matching your criteria.
        </CardDescription>
        <p className="text-gray-500">
          Try adjusting your search or filter options.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col items-center ">
        <div className="mt-4">
          <Image
            src={noDataSVG}
            alt="No Campaigns Found"
            width={150} // Adjust as needed
            height={200} // Adjust as needed
            className="object-contain" // ensure the image scales nicely.
          />
        </div>


      </CardContent>
    </Card>
  );
};

export default NoCampaignsFoundFallback;