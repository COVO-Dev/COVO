import IAppliedInfluencerBoxProps from "./AppliedInfluencersBox.model";
import AppliedInfluencerCard from "./applied-influencer-card/AppliedInfluencerCard.component";
import List from '@mui/material/List';
import AppliedInfluencerCardFallback from "./applied-influencer-card/AppliedInfluencerCardFallback.component";

export default function AppliedInfluencersBox({ appliedInfluencers, className, credentials, handleSubmitAccept, handleSubmitReject, handleClick }: IAppliedInfluencerBoxProps) {
  return (
    <List
      className={`${className} border-2 rounded-lg `}
      subheader={<h3 className="font-semibold p-4 border-b-2 space-y-2 ">Applied Influencers</h3>}
    >
      {appliedInfluencers.length > 0 ? (
        appliedInfluencers.map((influencer) => (
          <AppliedInfluencerCard
            key={influencer.influencerId._id}
            userData={influencer}
            credentials={credentials}
            handleSubmitAccept={handleSubmitAccept}
            handleSubmitReject={handleSubmitReject}
            handleClick={handleClick}
          />
        ))
      ) : (
        <AppliedInfluencerCardFallback /> // Render fallback if array is empty
      )}
    </List>


  )
}