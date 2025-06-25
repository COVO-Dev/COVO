import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Check, CalendarDays, MapPin, Users, Target, DollarSign, Goal, TrendingUp, FileText, User, Handshake } from "lucide-react";
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface ICampaignData {
	brandId: {
    firstName: string;
    lastName: string;
  }
	budgetRange: number;
	collaborationPreferences: {
		exclusiveCollaborations: boolean;
		hasWorkedWithInfluencers: boolean;
	};
	createdAt: Date;
	endDate: Date;
	geographicFocus: string;
	influencerId: string[];
	influencerType: string;
	isDeleted: false
	primaryGoals: string[];
	startDate: Date;
	status: string;
	targetAudience: string;
	title: string;
	trackingAndAnalytics: {
		performanceTracking: boolean,
		metrics: Array<string>,
		reportFrequency: string,
	}
	updatedAt: Date;
	__v: number;
	_id: string;
}



export default function BrandCampaignCard({ campaign }) {
  const formatDate = (date: string) => format(date, 'yyyy-MM-dd');
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US').format(amount);
  const router = useRouter()

  console.log("CampaignCard", campaign);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {  // Convert to lowercase for case-insensitivity
      case 'active':
        return 'text-green-500';
      case 'pending':
        return 'text-yellow-500';
      case 'completed':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };

  const handleApplyClick = (campaignId: string) => {
    console.log(campaignId)
    router.push(`/brand/campaign/details/${campaignId}`)
  }


  return (
    <Card className="p-4 shadow-md hover:shadow-lg transition duration-300 transform hover:scale-105 ">
      <CardHeader className="flex flex-row justify-between">
        <div>
          <CardTitle>{campaign.title}</CardTitle>
          <CardDescription>
            <p className="flex items-center">Brand: {campaign.brandId.firstName} {campaign.brandId.lastName}</p>
          </CardDescription>
        </div>
        <div>
          <p className={`text-sm  `}>Status: <em className={ `${getStatusColor(campaign.status)}` }>{campaign.status}</em></p>
        </div>
      </CardHeader>
      <CardDescription>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <p className="flex items-center"><CalendarDays className="w-4 h-4 mr-2" /> Start Date: {formatDate(campaign.startDate.toString())}</p>
            <p className="flex items-center"><CalendarDays className="w-4 h-4 mr-2" /> End Date: {formatDate(campaign.endDate.toString())}</p>
            <p className="flex items-center"><MapPin className="w-4 h-4 mr-2" /> Geo Focus: {campaign.geographicFocus}</p>
            <p className="flex items-center"><Users className="w-4 h-4 mr-2" /> Target Audience: {campaign.targetAudience}</p>
            <p className="flex items-center"><DollarSign className="w-4 h-4 mr-2" /> Budget Range: ${formatCurrency(campaign.budgetRange)}</p>
          </div>
          <div>
            <p className="flex items-center"><Handshake className="w-4 h-4 mr-2" /> Exclusive Collaborations: {campaign.collaborationPreferences.exclusiveCollaborations ? <Check className="text-green-500" /> : <span className="text-red-500">X</span>}</p>
            <p className="flex items-center"><Check className="w-4 h-4 mr-2" /> Has Worked with Influencers: {campaign.collaborationPreferences.hasWorkedWithInfluencers ? <Check className="text-green-500" /> : <span className="text-red-500">X</span>}</p>
            <p className="flex items-center"><TrendingUp className="w-4 h-4 mr-2" /> Performance Tracking: {campaign.trackingAndAnalytics.performanceTracking ? <Check className="text-green-500" /> : <span className="text-red-500">X</span>}</p>
            <p className="flex items-center"><FileText className="w-4 h-4 mr-2" /> Report Frequency: {campaign.trackingAndAnalytics.reportFrequency}</p>
            <p className="flex items-center"><Goal className="w-8 h-8 mr-2"/>Primary Goals: {campaign.primaryGoals.join(", ")}</p>
          </div>
        </div>
      </CardDescription>
      <CardFooter className="mt-4">
        <Button onClick={() => handleApplyClick(campaign._id)} >Details</Button>
      </CardFooter>
    </Card>
  );
};