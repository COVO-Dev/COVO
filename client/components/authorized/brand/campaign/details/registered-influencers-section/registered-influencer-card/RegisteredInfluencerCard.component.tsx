import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // Assuming you have shadcn card components
import { CheckCircle, Mail, User, ShieldCheck, UserRoundX, MessageSquare, Heart, Share2, Eye, MapPin, Hexagon, Facebook, Youtube, Instagram, Twitter, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Fragment } from 'react';

export default function RegisteredInfluencerCard({ influencer, handleClick }: IInfluencerDataProp) {
  return (
    <Card
      className="w-full mx-auto shadow-md p-[1em] flex flex-col gap-2 hover:scale-105 duration-300 max-w-[1280px] "
    >
      <CardHeader className="flex flex-col sm-md:flex-row gap-2 justify-between pb-0 items-center ">
        <div>
          <CardTitle>{influencer.firstName} {influencer.lastName}</CardTitle>
          <CardDescription className="flex">
            <User className="w-4 h-4 text-gray-500  " />
            <p className="truncate min-w-[3em] md:max-w-[5em] lg-xl:max-w-full ">{influencer.username}</p>
            {
              influencer.isActive ?
                <CheckCircle className='w-4 h-4 text-[#00b88f]  ' />
                :
                <UserRoundX className='w-4 h-4 text-red-500' />
            }
          </CardDescription>
        </div>
        {influencer.totalMetrics ?
          <div className="flex space-x-2 border-4 border-black rounded-full  text-white justify-center w-[45%] lg:w-[50%] lg-xl:w-[40%] xl-lg:w-[45%] p-2 bg-black hover:text-black hover:bg-white duration-300  ">
            {/* <div className="flex space-x-2 border-4 border-black rounded-full  text-black justify-center  p-2 duration-300 "> */}
            <div className="flex gap-1  p-0">
              <Eye className="w-6 h-6   " />
              {influencer.totalMetrics.views || 0}
            </div>

            <div className="flex gap-1  p-0">
              <User className="w-6 h-6  " />
              {influencer.totalMetrics.followers || 0}
            </div>

            <div className="hidden gap-1 p-0 sm:flex lg-xl:flex">
              <Heart className="w-6 h-6" />
              {influencer.totalMetrics.likes || 0}
            </div>

            <div className="hidden gap-1 p-0 xl:flex ">
              <MessageSquare className="w-6 h-6" />
              {influencer.totalMetrics.comments || 0}
            </div>

            <div className="hidden 2xl:flex gap-1 p-0 ">
              <Share2 className="w-6 h-6" />
              {influencer.totalMetrics.shares || 0}
            </div>
          </div>
          : <></>
        }
      </CardHeader>

      <div className="flex justify-between px-7">
        <Button
          onClick={() => { handleClick(influencer._id) }}
        >Details</Button>
        <div className="flex items-center gap-2 ">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span>{influencer.location ? ` ${influencer.location.city}, ${influencer.location.country} ` : 'Unknown'}</span>
        </div >

      </div>
    </Card>

  );
};