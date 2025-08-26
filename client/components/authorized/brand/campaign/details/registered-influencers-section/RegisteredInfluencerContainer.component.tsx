import ShadcnTitle from '@/components/shared/page-title/PageTitle.component';
import RegisteredInfluencerCard from './registered-influencer-card/RegisteredInfluencerCard.component';
import RegisteredInfluencerFallbackCard from './registered-influencer-card/RegisteredInfluencerFallbackCard.component';

interface InfluencerCardContainerProps {
  influencers: IInfluencerDataProp['influencer'][];
  className: string,
  handleClick: (influencerId: string) => void;
}

export default function RegisteredInfluencerContainer({ influencers, className, handleClick }: InfluencerCardContainerProps) {
  console.log(influencers)
  return (
    <div className={`space-y-4 p-[1em] ${className || ''}`}>
      <ShadcnTitle>Registered Influencers</ShadcnTitle>
      {influencers.length > 0 ? ( // Conditional rendering based on influencers being not null
        influencers.map((influencer) => (
          <RegisteredInfluencerCard
            key={influencer._id}
            influencer={influencer}
            handleClick={handleClick}
          />
        ))
      ) : (
        <RegisteredInfluencerFallbackCard /> // Display fallback when influencers is null
      )}
    </div>

  );
};
