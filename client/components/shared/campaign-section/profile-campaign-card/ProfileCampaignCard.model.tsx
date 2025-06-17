import ICampaignHeroProps from "../../campaign-hero/campaign-hero-card/CampaignHeroCard.model";

export default interface IProfileCampaignCardProps extends ICampaignHeroProps {
  handleCardClick: (brandId: string, campaignId: string) => void;
}
