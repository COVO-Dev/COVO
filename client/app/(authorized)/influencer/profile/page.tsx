"use client";
// src/app/authorized/profile/page.tsx
import Image from "next/image";
// import AshrafAtef from "@/assets/images/Ashraf-Atef.jpeg";
import cover01 from "@/assets/images/cover-01.png";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import UpdateProfile from "./updateProfile";
import { useAppSelector } from "@/lib/store/hooks";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import UpdateProfilePicture from "./updateProfilePicture";
import userCheckPhotoRoute from "@/lib/api/upload/user-check-photo/userCheckPhotoRoute";
import { getRegisteredCampaignForInfluencerRoute } from "@/lib/api/campaign/get-registered-campaign-influencer/getRegisteredCampaignForInfluencerRoute";
import ShadcnTitle from "@/components/shared/page-title/PageTitle.component";
import { useRouter } from "next/navigation";
import ProfileCampaignSection from "@/components/shared/campaign-section/ProfileCampaignSection.component";

export default function ProfilePage() {
  const profile = useAppSelector((state) => state.profile);
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const [appliedCampaigns, setAppliedCampaigns] = useState([]);
  const { data: session, update } = useSession();
  const [error, setError] = useState<string | null>(null); // Add error state
  const token = session?.user?.access_token;
  const influencerId = session?.user?._id;
  const router = useRouter();

  console.log("profile object redux: \n", profile);

  useEffect(() => {
    const check = async (fileName) => {
      setIsLoading(true);
      try {
        if (fileName && token) {
          const result = await userCheckPhotoRoute(fileName, token)
          if (!result.success) {
            update({
              ...session,
              user: {
                ...session?.user,
                profilePicture: null
              }
            })
          }
          console.log(result);
        }
      } finally {
        setIsLoading(false);
      }
    };

    async function fetchData(token) {
      if (token) {
        setIsLoading(true); // Set loading to true before fetching
        try {
          // const result = await getAppliedCampaignForInfluencerRoute(
          //   token,
          //   influencerId
          // ); // Pass page and limit
          const result = await getRegisteredCampaignForInfluencerRoute(
            token,
            influencerId
          ); // Pass page and limit
          console.log(result)
          if (result.status === "success") {
            setAppliedCampaigns(result.data.data);
          } else {
            setError(result.message || "Failed to fetch data.");
            console.error("API Error:", result);
          }
        } catch (err: any) {
          setError(err.message || "An error occurred.");
          console.error("Fetch Error:", err);
        } finally {
          setIsLoading(false);
        }
      }
    }
    fetchData(token); // Fetch based on current page
    check(profile.profilePicture);
  }, [token, influencerId, profile.profilePicture]);

  const handleFallbackClick = () => {
    router.push('/influencer/campaign')
  }

  const handleCampaignClick = (brandId: string, campaignId: string) => {
    router.push(`/influencer/campaign/apply/${brandId}?campaignId=${campaignId}`)
  }

  console.log(appliedCampaigns);

  return (
    <div className="w-full h-full bg-sidebar">
      <div className="flex flex-wrap justify-center items-center border-b-[1px] border-sidebar-border pb-2">
        <div className="w-full h-[250px] flex justify-center items-center relative border-2">
          <div className="h-[90%] w-[95%] p-5  absolute">
            <Image
              src={cover01}
              alt="Cover Picture"
              layout="fill"
              objectFit="cover"
              className=" w-full h-full rounded-lg"
            />
            <div className="flex justify-between items-center  gap-4">
              <p className="text-lg w-[160px] text-center border-2 rounded-md text-white p-2 font-weight-[800] z-10 border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.3)] backdrop-blur-sm">
                Covo Score: 8.20
              </p>
              <UpdateProfile />
            </div>
          </div>
          <div className="relative w-[10rem] h-[10rem] max-h-[10rem] mt-[200px]">
            {profile.profilePicture ? (
              <>
                {!isLoading ?
                  <Image
                    src={profile.profilePicture}
                    alt="Profile Picture"
                    layout="fill"
                    className="rounded-full border-8 border-gray-300"
                    style={{ objectFit: "cover", objectPosition: "center" }}
                  /> :
                  <div
                    className="rounded-full z-10  w-[10rem] h-[10rem] flex items-center
                justify-center font-bold text-xl bg-slate-200 border-8
                border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.3)] backdrop-blur-sm"
                  >
                    <Loader2 className="animate-spin w-20 h-20" />
                  </div>
                }
              </>
            ) : (
              <div
                className="rounded-full z-10  w-[10rem] h-[10rem] flex items-center
                justify-center font-bold text-xl bg-slate-200 border-8
                border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.3)] backdrop-blur-sm"
              >
                {profile.firstName.slice(0, 2).toLocaleUpperCase()}
              </div>
            )}
            <UpdateProfilePicture token={token} id={influencerId} userRole={profile.role} />
          </div>
        </div>

        <div className="w-full h-auto flex flex-col justify-center items-center text-center max-w-[800px] px-4 mt-[90px] gap-4">
          <h2 className="text-3xl font-bold">{`${profile.firstName} ${profile.lastName}`}</h2>

          {profile.contentAndAudience && (
            <p className="text-2xltext-gray-600">
              {profile.contentAndAudience.primaryNiche} -{" "}
              {profile.contentAndAudience.secondaryNiche}
            </p>
          )}

          {profile.selectedPlatforms.length && (
            <div className="bg-sidebar-border flex p-5 gap-8 rounded-md">
              <p>
                {profile.platforms[profile.selectedPlatforms[0]]?.metrics.likes}{" "}
                Likes{" "}
              </p>
              <Separator orientation="vertical" className=" h-6" />
              <p>
                {
                  profile.platforms[profile.selectedPlatforms[0]]?.metrics
                    .followers
                }{" "}
                Followers
              </p>
              <Separator orientation="vertical" className=" h-6" />
              <p>
                {
                  profile.platforms[profile.selectedPlatforms[0]]?.metrics
                    .shares
                }{" "}
                Shares{" "}
              </p>
              <Separator orientation="vertical" className=" h-6" />
              <p>
                {profile.platforms[profile.selectedPlatforms[0]]?.metrics.views}{" "}
                Views{" "}
              </p>
            </div>
          )}

          <p className="text-gray-600 font-bold">About Me</p>
          <p className="text-gray-600">{profile.personalBio}</p>
        </div>
      </div>
      <div className="p-5 border-b-[1px] border-sidebar-border">
        <p className="text-3xl font-bold">Platforms</p>
        <div className="flex flex-wrap justify-center items-center">
          {profile.selectedPlatforms.map((platform) => (
            <div
              key={platform}
              className="bg-sidebar-border max-w-[480px] flex justify-center items-center p-5 gap-8 rounded-md m-2"
            >
              {/* <Image
								src={profile.platforms[platform]?.imageURL}
								alt="Social Media"
								width={40}
								height={40}
								className="flex justify-center items-center"
							/> */}
              <Separator orientation="vertical" className=" h-6 bg-black/50" />
              <p>{profile.platforms[platform]?.metrics.followers} followers</p>
              <Separator orientation="vertical" className=" h-6 bg-black/50" />
              <p>
                {profile.platforms[platform]?.metrics.engagementRate}%
                engagement rate
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* <section className="p-5 border-b-[1px] border-sidebar-border">
        <ShadcnTitle>Campaigns</ShadcnTitle>

        <div className="grid md-lg:grid-cols-2 gap-4 justify-center items-center lg:px-[1em]">
          {appliedCampaigns.map((campaign) => {
            // return <CampaignInfoCard campaignData={campaign} />;
            return <UserCampaignInfoCard campaignData={campaign} key={campaign._id} />;
          })}
        </div>
      </section> */}
      <ShadcnTitle className="ml-[1em] mt-[1em]">Campaigns</ShadcnTitle>
      <ProfileCampaignSection
        campaignDataArray={appliedCampaigns}
        isLoading={isLoading}
        handleCardClick={handleCampaignClick}
        handleFallbackCardClick={handleFallbackClick}
      />
    </div>
  );
}
