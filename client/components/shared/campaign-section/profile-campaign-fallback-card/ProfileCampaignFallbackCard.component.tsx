import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BadgePlus } from "lucide-react";
import Image from 'next/image';
import manyPixelsEmpty from '@/assets/svg/manypixels_404-page-not-found-73.svg'
import { Button } from "@/components/ui/button";
import IProfileCampaignFallbackCardProps from "./ProfileCampaignFallabackCard.model";

const ProfileCampaignFallbackCard = ({ className, handleClick }: IProfileCampaignFallbackCardProps) => {
  return (
    <Card className={`w-full mx-auto shadow-md flex flex-col sm-md:flex-row items-center justify-between gap-2 max-w-[1280px] bg-red-100 border-red-300 border-4 ${className}`}>
      <CardHeader className="flex flex-row sm-md:flex-row gap-2 justify-between py-0 items-center  ">
        <Image
          src={manyPixelsEmpty}
          alt="No campaigns"
          width={180} // Adjust as needed
          height={180} // Adjust as needed
          className="object-contain"
        />
        <CardTitle className="text-3xl md-sm:text-2xl  ">No campaigns yet</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-row px-7 py-7 justify-end md-lg:justify-center w-full md:w-auto ">
        <div className="">
          <Button onClick={handleClick}><BadgePlus className='w-12 h-12' /> Add campaign</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCampaignFallbackCard;