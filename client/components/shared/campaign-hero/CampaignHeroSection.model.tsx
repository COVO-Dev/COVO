import ICampaignHeroProps from "./campaign-hero-card/CampaignHeroCard.model";

export default interface ICampaignHeroSectionProps extends ICampaignHeroProps {
  isLoading: boolean;
  className: string;
}