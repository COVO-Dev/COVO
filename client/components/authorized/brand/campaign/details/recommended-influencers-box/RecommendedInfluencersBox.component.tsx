import { ScrollArea } from "@radix-ui/react-scroll-area";
import IRecommendedInfluencerProp from "./RecommendedInfluencersBox.model";
import { Button } from '@/components/ui/button';

export default function RecommendedInfluencersBox({ recommendedInfluencers, className, handleClick }: IRecommendedInfluencerProp) {
  return (
    <article className={` rounded-lg flex flex-col ${className}`}>
      <h3 className="font-semibold p-4 border-b-2 ">Recommended Influencers</h3>
      <ScrollArea className=" overflow-y-scroll flex-grow space-y-2">
        {recommendedInfluencers.map((influencer) => {
          return (
            <div key={influencer._id} className="bg-secondary/20 border-b rounded-md p-4 hover:bg-gray-200 duration-150 hover:cursor-pointer" onClick={() => handleClick(influencer._id)}>
              <p className="text-sm">{influencer.firstName} {influencer.lastName}</p>
              <div className="flex flex-row justify-between">
                <div>
                  <p className="text-muted-foreground text-sm lg:max-w-[4em] lg:truncate lg-xl:max-w-[7em] xl-lg:max-w-full">Recommendation score</p>
                  <p className="text-sm">{(Math.random() * 100).toFixed(2)}</p>
                </div>
                <Button >Request</Button>
              </div>
            </div>
          )
        })}
      </ScrollArea>
    </article>
  )
}