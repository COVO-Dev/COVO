import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SearchX, User, MapPin } from "lucide-react";
import Image from 'next/image';
import udrawEmpty from '@/assets/svg/undraw_void_wez2.svg';

const RegisteredInfluencerFallbackCard = () => {
  return (
    <Card className="w-full mx-auto shadow-md p-[1em] flex flex-col gap-2 max-w-[1280px] bg-red-100 border-red-300 border-4">
      <CardHeader className="flex flex-col sm-md:flex-row gap-2 justify-between pb-0 items-center">
        <div className="flex md:flex-col items-center  ">
          <div className="flex items-center gap-2 ">
            <SearchX className="w-10 h-10 text-gray-500" />
            <CardTitle className="text-xl">No Influencers Found</CardTitle>
          </div>
          <CardDescription className="flex items-center   ">
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Image
            src={udrawEmpty} // Replace with your image path
            alt="No Influencers Found"
            width={100} // Adjust as needed
            height={70} // Adjust as needed
            className="object-contain"
          />
        </div>
      </CardHeader>

      <CardContent className="flex justify-between px-7"></CardContent>
    </Card>
  );
};

export default RegisteredInfluencerFallbackCard;