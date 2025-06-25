import CampaignHeroCardSkeleton from "./campaign-hero-skeleton/CampaignHeroCardSkeleton.component";
import ICampaignHeroSectionProps from "./CampaignHeroSection.model";
import CampaignHeroCard from "./campaign-hero-card/CampaignHeroCard.component";

export default function CampaignHeroSection({ campaignData, isLoading, className }: ICampaignHeroSectionProps) {
  return (
    <section className={className}>
      {(isLoading || Object.keys(campaignData).length == 0) ?
        <CampaignHeroCardSkeleton />
        :
        <CampaignHeroCard campaignData={campaignData} />
      }
    </section>
  )
}
