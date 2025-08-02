"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getCampaignByIdRoute } from "@/lib/api/campaign/get-campaign-by-id/getCampaignById";
import { searchInfluencerRoute } from "@/lib/api/search/influencer/searchInfluencer.route";
import ShadcnTitle from "@/components/shared/page-title/PageTitle.component";
import CampaignHeroSection from "@/components/shared/campaign-hero/CampaignHeroSection.component";
import RecommendedInfluencersBox from "./invitation-management/recommended-influencers-box/RecommendedInfluencersBox.component";
import PageSkeleton from "./page-skeleton/PageSkeleton.component";
import { editCampaignDataRoute } from "@/lib/api/campaign/edit-campaign/editCampaign.route";
import { toast } from "@/hooks/use-toast";
import { rejectInfluencerForCampaignRoute } from "@/lib/api/campaign/edit-campaign/rejectInfluencerForCampaign.route";
import { useRouter } from "next/navigation";
import AppliedInfluencersBox from "./invitation-management/applied-influencers-box/AppliedInfluencersBox.component";
import RegisteredInfluencerContainer from "./registered-influencers-section/RegisteredInfluencerContainer.component";
import InvitationManagement from "./invitation-management/InvitationManagement.component";

export default function BrandCampaignDetails({
  campaignId,
}: {
  campaignId: string;
}) {
  const [campaignData, setCampaignData] = useState(null);
  const [appliedInfluencers, setAppliedInfluencers] = useState([]);
  const [registeredInfluencers, setRegisteredInfluencers] = useState([]);
  const [influencersCount, setInfluencersCount] = useState(0);
  const [recommendedInfluencers, setRecommendedInfluencers] = useState([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.user?.access_token;
  const id = session?.user?._id;

  useEffect(() => {
    if (!token || !id) {
      return;
    }

    const getBrandCampaigns = async () => {
      setIsLoading(true);
      try {
        // Fetch all data concurrently
        const [campaignResult, influencerResult] = await Promise.all([
          getCampaignByIdRoute(token, campaignId, id),
          searchInfluencerRoute({}, token), // Polyfill for recommended influencers
        ]);

        console.log(
          "Campaign Result: ",
          campaignResult?.data,
          "\nInfluencer Result: ",
          influencerResult?.data
        );
        // Process campaign data
        if (campaignResult.status === "success" && campaignResult.data?.data) {
          const campaignResultData = campaignResult.data.data;
          const appliedInfluencerArray = campaignResultData.applications.map(
            ({ influencerId, message, offer }) => ({
              influencerId,
              message,
              offer,
            })
          );

          setCampaignData(campaignResultData);
          setAppliedInfluencers(appliedInfluencerArray);
          setInfluencersCount(appliedInfluencerArray.length);
          setRegisteredInfluencers(campaignResultData.influencerId);
        } else {
          toast({
            title: "Error",
            description: "Failed to load campaign data.",
            variant: "destructive",
          });
        }

        // Process recommended influencers data
        if (
          influencerResult.status === "success" &&
          influencerResult.data?.data?.data
        ) {
          setRecommendedInfluencers(influencerResult.data.data.data);
        }
      } catch (error) {
        console.error(
          "An error occurred while fetching campaign details:",
          error
        );
        toast({
          title: "Request Error",
          description: "An unexpected error occurred while fetching data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    getBrandCampaigns();
  }, [token, id, campaignId]);

  const handleSubmitAcceptRequest = async (
    brandId: string,
    influencerId: string,
    campaignId: string,
    token: string
  ) => {
    try {
      const response = await editCampaignDataRoute(token, campaignId, brandId, {
        influencerId,
      });

      console.log(response);
      if (response.status === "success") {
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
  };

  const handleSubmitRejectRequest = async (
    brandId: string,
    influencerId: string,
    campaignId: string,
    token: string
  ) => {
    try {
      const response = await rejectInfluencerForCampaignRoute(
        token,
        campaignId,
        brandId,
        { influencerId }
      );

      console.log(response);
      if (response.status === "success") {
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
  };

  // Handle redirect
  const handleRedirect = (influencerId: string) => {
    console.log("handleRedirect: ", influencerId);
    router.push(`/brand/influencer-profile/${influencerId}`);
  };

  if (isLoading || !campaignData || !recommendedInfluencers) {
    return <PageSkeleton />;
  }

  // if (!campaignData) {
  //   return (
  //     <div className="flex items-center justify-center h-screen">
  //       <p>Could not load campaign details. Please try again later.</p>
  //     </div>
  //   );
  // }

  return (
    <div className="w-full p-4 md:p-8 lg:p-10">
      <ShadcnTitle title={campaignData?.title || "Campaign Details"} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <CampaignHeroSection
          campaignData={campaignData}
          isLoading={isLoading}
          className="lg:col-span-2"
        />

        <InvitationManagement
          className="lg:col-span-1"
          appliedInfluencersBox={
            <AppliedInfluencersBox
              appliedInfluencers={appliedInfluencers}
              credentials={{
                brandId: id,
                campaignId: campaignId,
                token: token,
              }}
              handleSubmitAccept={handleSubmitAcceptRequest}
              handleSubmitReject={handleSubmitRejectRequest}
              handleClick={handleRedirect}
            />
          }
          recommendedInfluencersBox={
            <RecommendedInfluencersBox
              recommendedInfluencers={recommendedInfluencers}
              handleClick={handleRedirect}
              credentials={{
                brandId: id,
                campaignId: campaignId,
                token: token,
              }}
            />
          }
        />

        {
          registeredInfluencers && registeredInfluencers.length > 0 && (
          <RegisteredInfluencerContainer
            influencers={registeredInfluencers}
            className="lg:col-span-3"
            handleClick={handleRedirect}
          />
          )
        }
        
      </div>
    </div>
  );
}
