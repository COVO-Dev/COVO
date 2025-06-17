import ICampaignSectionProps from './ProfileCampaignSection.model';
import ProfileCampaignCard from './profile-campaign-card/ProfileCampaignCard.component';
import ProfileCampaignCardSkeleton from './profile-campaign-skeleton/ProfileCampaignCardSkeleton.component';
import ProfileCampaignFallbackCard from './profile-campaign-fallback-card/ProfileCampaignFallbackCard.component';

export default function ProfileCampaignSection({ campaignDataArray, className, handleCardClick, handleFallbackCardClick, isLoading }: ICampaignSectionProps) {
  console.log(campaignDataArray)
  return (
    <section className={`grid grid-cols-1 md-lg:grid-cols-2 gap-4 justify-center items-center p-[1em] lg:px-[2em] space-y-4 ${className || ''}`}>
      {
        isLoading ?
          <ProfileCampaignCardSkeleton /> :
          !isLoading && campaignDataArray.length > 0 ?
            <>
              {campaignDataArray.map((campaignData) => (
                <ProfileCampaignCard
                  key={campaignData._id}
                  campaignData={campaignData}
                  handleCardClick={handleCardClick}
                />
              ))}
            </>
            : <ProfileCampaignFallbackCard className="col-span-2 md-lg:col-span-2" handleClick={handleFallbackCardClick} />

      }
      {/* {campaignDataArray.length > 0 ? (
        campaignDataArray.map((campaignData) => (
          <UserCampaignInfoCard
            key={campaignData._id}
            campaignData={campaignData}
            handleClick={handleClick}
          />
        ))
      ) : (
        <RegisteredInfluencerFallbackCard />
      )} */}
    </section>

  );
};
