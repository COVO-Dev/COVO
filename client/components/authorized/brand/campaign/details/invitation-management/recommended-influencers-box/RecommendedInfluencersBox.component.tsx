import { ScrollArea } from "@/components/ui/scroll-area";
import IRecommendedInfluencerProp from "./RecommendedInfluencersBox.model";
import InviteInfluencerDialog from "./invite-influencer-dialog/InviteInfluencerDialog.component";

export default function RecommendedInfluencersBox({
  recommendedInfluencers,
  className,
  handleClick,
  credentials,
}: IRecommendedInfluencerProp) {
  return (
    <article className={` rounded-lg flex flex-col ${className}`}>
      <h3 className="font-semibold p-4 border-b-2 ">Recommended Influencers</h3>
      <ScrollArea className=" overflow-y-scroll flex-grow space-y-2">
        {recommendedInfluencers.map((influencer) => {
          return (
            <div
              key={influencer._id}
              className="bg-secondary/20 border-b rounded-md p-4"
            >
              <div
                className="hover:cursor-pointer"
                onClick={() => handleClick(influencer._id)}
              >
                <p className="text-sm">
                  {influencer.firstName} {influencer.lastName}
                </p>
              </div>
              <div className="flex flex-row justify-between items-center mt-2">
                <div>
                  <p className="text-muted-foreground text-sm lg:max-w-[4em] lg:truncate lg-xl:max-w-[7em] xl-lg:max-w-full">
                    Recommendation score
                  </p>
                  <p className="text-sm">{(Math.random() * 100).toFixed(2)}</p>
                </div>
                <InviteInfluencerDialog
                  brandId={credentials.brandId}
                  campaignId={credentials.campaignId}
                  influencerId={influencer._id}
                  token={credentials.token}
                />
              </div>
            </div>
          );
        })}
      </ScrollArea>
    </article>
  );
}
