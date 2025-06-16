import type ICampaignHeroProps from "../campaign-hero/campaign-hero-card/CampaignHeroCard.model";

export default interface ICampaignSectionProps {
  campaignDataArray: ICampaignHeroProps['campaignData'][]
  className?: string;
  isLoading: boolean;
  handleCardClick?: (brandId: string, campaignId: string) => void;
  handleFallbackCardClick: (campaignId: string) => void;
}