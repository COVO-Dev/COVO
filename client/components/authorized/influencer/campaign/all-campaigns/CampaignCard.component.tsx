import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Check, CalendarDays, MapPin, Users, Target, DollarSign, Goal, TrendingUp, FileText, User, Handshake } from "lucide-react";
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import ICampaignHeroProps from '@/components/shared/campaign-hero/campaign-hero-card/CampaignHeroCard.model';

export default function CampaignCard({ campaignData }: ICampaignHeroProps) {
  const formatDate = (date: string) => format(date, 'yyyy-MM-dd');
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US').format(amount);
  const router = useRouter()


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

  const handleApplyClick = (brandId: string, campaignId: string) => {
    router.push(`/influencer/campaign/apply/${brandId}?campaignId=${campaignId}`)
  }

  return (
    <Card className="p-4 shadow-md hover:shadow-lg transition duration-300 transform hover:scale-105 ">
      <CardHeader className="flex flex-row justify-between">
        <div>
          <CardTitle>{campaignData.title}</CardTitle>
          <CardDescription>
            <p className="flex items-center">Brand: {campaignData.brandId.firstName} {campaignData.brandId.lastName}</p>
          </CardDescription>
        </div>
        <div>
          <p className={`text-sm  `}>Status: <em className={`${getStatusColor(campaignData.status)}`}>{campaignData.status}</em></p>
        </div>
      </CardHeader>
      <CardDescription>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <p className="flex items-center"><CalendarDays className="w-4 h-4 mr-2 min-w-[1em] " /> Start Date: {formatDate(campaignData.startDate.toString())}</p>
            <p className="flex items-center"><CalendarDays className="w-4 h-4 mr-2 min-w-[1em] " /> End Date: {formatDate(campaignData.endDate.toString())}</p>
            <p className="flex items-center"><MapPin className="w-4 h-4 mr-2 min-w-[1em] " /> Geo Focus: {campaignData.geographicFocus}</p>
            <span className="flex items-center truncate "><Target className="w-4 h-4 mr-2 min-w-[1em] " /> <p className="truncate max-w-[95%] overflow-ellipsis ">Audience: {campaignData.targetAudience}</p></span>
            <p className="flex items-center"><DollarSign className="w-4 h-4 mr-2 min-w-[1em] " /> Budget Range: ${formatCurrency(campaignData.budgetRange)}</p>
          </div>
          <div>
            <p className="flex items-center"><Handshake className="w-4 h-4 mr-2 min-w-[1em] " /> Exclusive Collaborations: {campaignData.collaborationPreferences.exclusiveCollaborations ? <Check className="text-green-500" /> : <span className="text-red-500">X</span>}</p>
            <p className="flex items-center"><Check className="w-4 h-4 mr-2 min-w-[1em] " /> Has Worked with Influencers: {campaignData.collaborationPreferences.hasWorkedWithInfluencers ? <Check className="text-green-500" /> : <span className="text-red-500">X</span>}</p>
            <p className="flex items-center"><TrendingUp className="w-4 h-4 mr-2 min-w-[1em] " /> Performance Tracking: {campaignData.trackingAndAnalytics.performanceTracking ? <Check className="text-green-500" /> : <span className="text-red-500">X</span>}</p>
            <p className="flex items-center"><FileText className="w-4 h-4 mr-2 min-w-[1em] " /> Report Frequency: {campaignData.trackingAndAnalytics.reportFrequency}</p>
            <p className="flex items-center"><Goal className="w-4 h-4 mr-2 min-w-[1em] " />Primary Goals: {campaignData.primaryGoals.join(", ")}</p>
          </div>
        </div>
      </CardDescription>
      <CardFooter className="mt-4">
        <Button disabled={campaignData.status === 'completed'} onClick={() => handleApplyClick(campaignData.brandId._id, campaignData._id)} >Apply</Button>
      </CardFooter>
    </Card>
  );
};