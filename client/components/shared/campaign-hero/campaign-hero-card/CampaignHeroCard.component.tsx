import { createElement } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from 'date-fns';
import { Badge, CalendarDays, Check, DollarSign, FileText, Goal, Handshake, ListChecks, LucideIcon, MapPin, Target, TrendingUp, X } from "lucide-react";
import type ICampaignHeroProps from "./CampaignHeroCard.model";

export default function CampaignHeroCard({ campaignData }: ICampaignHeroProps) {
  const formatDate = (date: string) => format(date, 'yyyy-MM-dd');
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US').format(amount);
  const renderIcon = (icon: LucideIcon, className?: string) => {
    return createElement(icon, { className: `w-4 h-4 mr-2 min-w-[1em] ${className}` });
  };
  console.log(campaignData);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0 mb-6">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-semibold">{campaignData.title}</CardTitle>
        </div>
        <Badge className={`${getStatusColor(campaignData.status)}`}>{campaignData.status}</Badge>
      </CardHeader>

      <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ... (Your CardContent as before) */}
        <div className="space-y-4 col-span-1">
          <p className="flex items-center">{renderIcon(CalendarDays)} Start Date: {formatDate(campaignData.startDate)}</p>
          <p className="flex items-center">{renderIcon(CalendarDays)} End Date: {formatDate(campaignData.endDate)}</p>
          <p className="flex items-center">{renderIcon(MapPin)} Geo Focus: {campaignData.geographicFocus}</p>
          <span className="flex items-center truncate">{renderIcon(Target)}Audience: <p className="truncate">{campaignData.targetAudience}</p></span>
          <p className="flex items-center">{renderIcon(DollarSign)} Budget Range: ${formatCurrency(campaignData.budgetRange)}</p>
          <p className="flex items-center">{renderIcon(Goal)} Influencer Type: {campaignData.influencerType}</p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-row justify-between ">
            <p className="flex items-center">{renderIcon(Handshake)} Exclusive Collaborations: </p>
            {
              campaignData.collaborationPreferences.exclusiveCollaborations ?
                <Check className="text-green-500 w-6 h-6" />
                : <X className="text-red-500 w-6 h-6" />
            }
          </div>

          <div className="flex flex-row justify-between ">
            <p className="flex items-center">{renderIcon(Check)} Has Worked with Influencers:</p>
            {
              campaignData.collaborationPreferences.hasWorkedWithInfluencers ?
                <Check className="text-green-500" />
                : <X className="text-red-500 w-6 h-6" />
            }
          </div>

          <div className="flex flex-row justify-between ">
            <p className="flex items-center">{renderIcon(TrendingUp)} Performance Tracking:</p>
            {
              campaignData.trackingAndAnalytics.performanceTracking ?
                <Check className="text-green-500" />
                : <X className="text-red-500 w-6 h-6" />
            }
          </div>

          <p className="flex items-center">{renderIcon(FileText)} Report Frequency: {campaignData.trackingAndAnalytics.reportFrequency}</p>
          <p className="flex items-center">{renderIcon(ListChecks)} Metrics: {campaignData.trackingAndAnalytics.metrics.join(", ")}</p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col">
            <p>Styles:</p>
            <ul className="list-disc list-inside">
              {campaignData.collaborationPreferences.styles.map((style, index) => (
                <li key={index}>{style}</li>
              ))}
            </ul>
          </div>
          <p className="flex items-center truncate">{renderIcon(Goal)} Primary Goals: {campaignData.primaryGoals.join(", ")}</p>
          <p className="flex items-center">Recommended Influencers: {campaignData.recommendedInfluencers.length}</p>
          <p className="flex items-center">Applications: {campaignData.applications.length}</p>
        </div>
      </CardContent>
    </Card>
  )
}
