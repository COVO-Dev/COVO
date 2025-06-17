import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Coins, MapPin, Users, Flag, Target } from "lucide-react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import IProfileCampaignCardProps from "./ProfileCampaignCard.model";

export default function ProfileCampaignCard({ campaignData, handleCardClick }: IProfileCampaignCardProps) {
  return (
    <Card
      className="w-full rounded-md border col-span-2 md-lg:col-span-1 hover:bg-gray-200 duration-300 hover:scale-105"
      onClick={() => handleCardClick(campaignData.brandId._id, campaignData._id)}
    >
      <CardHeader>
        <CardTitle className="flex text-lg font-semibold justify-between items-center">
          <span className="truncate max-w-[80%]">{campaignData.title}</span>
          <span className={`text-base ${campaignData.status.toLowerCase() === 'active' ? 'text-green-500'
            : campaignData.status.toLowerCase() === 'pending' ?
              'text-yellow-500' : campaignData.status.toLowerCase() === 'completed' ?
                'text-blue-500' :
                'text-gray-500'
            }  `}>{campaignData.status.toUpperCase()}</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Brand: {campaignData.brandId.firstName} {campaignData.brandId.lastName}
        </p>
      </CardHeader>
      <CardContent className="grid gap-4 grid-cols-2">

        <div className="col-span-1">
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 min-w-[1em] text-muted-foreground" />
            <span className="text-sm truncate">Target Audience: {campaignData.targetAudience}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Coins className="h-4 w-4 min-w-[1em] text-muted-foreground" />
            <span className="text-sm">Budget: ${campaignData.budgetRange}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 min-w-[1em] text-muted-foreground" />
            <span className="text-sm">Focus: {campaignData.geographicFocus}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 min-w-[1em] text-muted-foreground" />
            <span className="text-sm">Influencer Type: {campaignData.influencerType}</span>
          </div>
        </div>

        <div>
          {campaignData.primaryGoals && campaignData.primaryGoals.length > 0 && (
            <div>
              <div className="flex items-center space-x-2">
                <Flag className="h-4 w-4 min-w-[1em] text-muted-foreground" />
                <span className="text-sm">Goals:</span>
              </div>
              <ul className="list-disc pl-6 text-sm">
                {campaignData.primaryGoals.map((goal) => (
                  <li key={goal}>{goal}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 min-w-[1em] text-muted-foreground" />
            <span className="text-sm">
              Start Date: {format(new Date(campaignData.startDate), "PPP", { locale: enUS })}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 min-w-[1em] text-muted-foreground" />
            <span className="text-sm">
              End Date: {format(new Date(campaignData.endDate), "PPP", { locale: enUS })}
            </span>
          </div>
          {/* <div>
            <span className="text-xs text-muted-foreground">ID: {campaignData._id}</span>
          </div> */}
        </div>
      </CardContent>
    </Card>
  );
};

// export default UserCampaignInfoCard;