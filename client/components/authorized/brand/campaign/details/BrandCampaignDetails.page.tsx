'use client';

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton"
import { getCampaignByIdRoute } from "@/lib/api/campaign/get-campaign-by-id/getCampaignById";
import AppliedInfluencerCard from "./applied-influencers-box/applied-influencer-card/AppliedInfluencerCard.component";
import { getRecommendedInfluencersRoute } from "@/lib/api/campaign/get-recommended-influencers/getRecommendedInfluencers";
import { searchInfluencerRoute } from "@/lib/api/search/influencer/searchInfluencer.route";
import ShadcnTitle from "@/components/shared/page-title/PageTitle.component";
import CampaignHeroCard from "@/components/shared/campaign-hero/campaign-hero-card/CampaignHeroCard.component";
import RecommendedInfluencersBox from "./recommended-influencers-box/RecommendedInfluencersBox.component";
import PageSkeleton from "./page-skeleton/PageSkeleton.component";
import { editCampaignDataRoute } from "@/lib/api/campaign/edit-campaign/editCampaign.route";
import { toast } from "@/hooks/use-toast";
import { rejectInfluencerForCampaignRoute } from "@/lib/api/campaign/edit-campaign/rejectInfluencerForCampaign.route";
import { useRouter } from 'next/navigation';
import AppliedInfluencersBox from "./applied-influencers-box/AppliedInfluencersBox.component";
import RegisteredInfluencerContainer from "./registered-influencers-section/RegisteredInfluencerContainer.component";

export default function BrandCampaignDetails({ campaignId }: string) {
  const [campaignData, setCampaignData] = useState({});
  const [appliedInfluencers, setAppliedInfluencers] = useState([]);
  const [registeredInfluencers, setRegisteredInfluencers] = useState([]);
  const [influencersCount, setInfluencersCount] = useState(0);
  const [recommendedInfluencers, setRecommendedInfluencers] = useState([]);
  const { data: session } = useSession();
  const router = useRouter();
  const token = session?.user?.access_token;
  const id = session?.user?._id;
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    async function getBrandCampaigns() {
      try {
        if (token) {
          setIsLoading(true);
          const result = await getCampaignByIdRoute(token, campaignId, id);
          const recommendedResult = await getRecommendedInfluencersRoute(token, campaignId, id);

          // temporary fetching of all influencers becuase recommendedInfluencers route is not yet active
          const influencerResult = await searchInfluencerRoute({}, token)

          if (result.status === "success") {
            const campaignResultData = result.data.data;
            const appliedInfluencerArray = campaignResultData.applications.map((application) => {
              const { influencerId, message, offer } = application
              return {
                influencerId,
                message,
                offer
              }
            })

            const recommendedResultData = influencerResult.data.data.data;
            console.log("back-end data results", influencerResult.data.data.data);

            setCampaignData(campaignResultData);
            setAppliedInfluencers(appliedInfluencerArray);
            setInfluencersCount(appliedInfluencerArray.length);
            setRecommendedInfluencers(recommendedResultData);
            setRegisteredInfluencers(campaignResultData.influencerId);
          }
        }

        // recommendedInfluencer polyfill
        // if (result.status === "success" && recommendedResult.status === "success") {
        //   const campaignResultData = result.data.data;
        //   const influencerArray = campaignResultData.applications.map((application) => {
        //     return application.influencerId
        //   })

        //   const recommendedResultData = recommendedResult.data.data;
        //   const recommenededInfluencerArray = recommendedResult.applications.map((application) => {
        //     return application.influencerId
        //   })

        //   setCampaignData(campaignResultData);
        //   setAppliedInfluencers(influencerArray);
        //   setRecommendedInfluencers(recommendedResultData)
        // }

      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    getBrandCampaigns();

  }, [token, influencersCount, campaignId, id]);

  console.log("campaignData:", campaignData, "registeresInfluencers:", registeredInfluencers);

  const handleSubmitAcceptRequest = async (brandId: string, influencerId: string, campaignId: string, token: string) => {
    try {
      const response = await editCampaignDataRoute(token, campaignId, { brandId, influencerId: [influencerId] })

      console.log(response);
      if (response.status === 'success') {
        toast({
          title: "Accepted Influencer",
          // description: "Influencer now added to your campaign",
          description: response.data.message,
          duration: 2000,
        });
        console.log(influencersCount);
        setInfluencersCount(influencersCount - 1);
        console.log(influencersCount);
      } else {
        toast({
          title: "Error Accepting Influencer",
          description: response.message,
          duration: 2000,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Request Error",
        description: error.message,
        duration: 2000,
        variant: "destructive",
      });
    }
  }

  const handleSubmitRejectRequest = async (brandId: string, influencerId: string, campaignId: string, token: string) => {
    try {
      const response = await rejectInfluencerForCampaignRoute(token, campaignId, { brandId, influencerId: [influencerId] })

      console.log(response);
      if (response.status === 'success') {
        toast({
          title: "Rejected Influencer",
          description: "Influencer removed from your applications",
          duration: 2000,
        });
        console.log(influencersCount);
        setInfluencersCount(influencersCount - 1);
        console.log(influencersCount);
        router.push(`/brand/influencer-profile/${influencerId}`);
      } else {
        toast({
          title: "Error Rejecting Influencer",
          description: response.message,
          duration: 2000,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Request Error",
        description: error.message,
        duration: 2000,
        variant: "destructive",
      });
    }
  }

  // Handle redirect
  const handleClick = (influencerId: string) => {
    console.log("handleRedirect: ", influencerId);
    router.push(`/brand/influencer-profile/${influencerId}`);
  };


  return (
    <div className="w-full p-4 md:p-8 lg:p-10">
      <ShadcnTitle>Campaign Details</ShadcnTitle>
      <div className="flex flex-col max-w-[1400px] gap-6">
        {!isLoading ? (
          <>
            <section className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 lg:max-h-[60vh] ">
              {
                campaignData && campaignData.status ?
                  (
                    <>
                      <div className="md-sm:col-span-4 md-lg:col-span-2 lg:col-span-4">
                        <CampaignHeroCard campaignData={campaignData} />
                      </div>
                      <RecommendedInfluencersBox
                        recommendedInfluencers={recommendedInfluencers}
                        className="col-span-1 md-sm:col-span-4 md-lg:col-span-2 border-2 lg:max-h-[63%] max-h-[100%] "
                        handleClick={handleClick}
                      />
                    </>
                  ) : (
                    <div>No Data Found</div>
                  )
              }
            </section>

            <section className=" rounded-lg space-y-2 p-2 grid grid-cols-7 gap-2 ">
              <RegisteredInfluencerContainer
                className="col-span-7 md-sm:col-span-7 lg:col-span-4 xl:col-span-4 border-2 rounded-lg"
                influencers={registeredInfluencers}
                handleClick={handleClick} />
              <AppliedInfluencersBox
                appliedInfluencers={appliedInfluencers}
                credentials={{
                  campaignId,
                  brandId: id,
                  token
                }}
                handleSubmitAccept={handleSubmitAcceptRequest}
                handleSubmitReject={handleSubmitRejectRequest}
                className="col-span-7 md-sm:col-span-7  lg:col-span-3 xl:col-span-3 "
                handleClick={handleClick}
              />
            </section>
          </>
        ) : (
          <PageSkeleton />
        )}
      </div>
    </div>
  )
}