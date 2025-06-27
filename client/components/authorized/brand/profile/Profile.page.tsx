'use client';
// src/app/authorized/profile/page.tsx

import UserAvatar from "./user-avatar/UserAvatar.component";
import { useEffect, useState } from "react";
import { getCampaignByBrandIdRoute } from "@/lib/api/campaign/get-campaign-by-brand-id/getCampaignByBrandId.route";
import { useAppSelector } from "@/lib/store/hooks";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ProfileCampaignSection from "@/components/shared/campaign-section/ProfileCampaignSection.component";
import ShadcnTitle from "@/components/shared/page-title/PageTitle.component";
import userCheckPhotoRoute from "@/lib/api/upload/user-check-photo/userCheckPhotoRoute";

// interface ICampaignData {
// 	brandId: string;
// 	budgetRange: number;
// 	collaborationPreferences: {
// 		exclusiveCollaborations: boolean;
// 		hasWorkedWithInfluencers: boolean;
// 	};
// 	createdAt: Date;
// 	endDate: Date;
// 	geographicFocus: string;
// 	influencerId: string[];
// 	influencerType: string;
// 	isDeleted: false;
// 	primaryGoals: string[];
// 	startDate: Date;
// 	status: string;
// 	targetAudience: string;
// 	title: string;
// 	trackingAndAnalytics: {
// 		performanceTracking: boolean;
// 		metrics: Array<string>;
// 		reportFrequency: string;
// 	};
// 	updatedAt: Date;
// 	__v: number;
// 	_id: string;
// }

export default function ProfilePage() {
	const [campaignData, setCampaignData] = useState([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	// console.log("cred", session?.user?.access_token);
	const { data: session, update } = useSession();
	// Type-safe session property access
	const token = (session?.user as { access_token?: string })?.access_token;
	const id = (session?.user as { _id?: string })?._id;
	const router = useRouter();
	const profile = useAppSelector((state) => state.profile);

	useEffect(() => {
		const check = async (fileName: string | undefined) => {
			setIsLoading(true);
			try {
				if (fileName && token) {
					const result = await userCheckPhotoRoute(fileName, token)
					if (!result.success) {
						update({
							...session,
							user: {
								...session?.user,
								logo: null
							}
						})
					}
					console.log(result);
				}
			} finally {
				setIsLoading(false);
			}
		};

		async function getBrandCampaigns() {
			// setIsLoading(true);
			try {
				if (token && id) {
					const result = await getCampaignByBrandIdRoute(token, id);
					console.log("server data", result);
					
					if (result.status === "success" && result.data) {
						// Safely access nested data properties
						const campaignResultDataArray = result.data.data?.data || result.data.data || result.data || [];
						console.log("Campaign data array:", campaignResultDataArray);
						setCampaignData(campaignResultDataArray);
					} else {
						console.warn("No campaign data available or request failed:", result);
						setCampaignData([]);
					}
				} else {
					console.warn("Missing token or user ID, cannot fetch campaigns");
					setCampaignData([]);
				}
			} catch (error) {
				console.error("Error fetching brand campaigns:", error);
				setCampaignData([]);
			} finally {
				setIsLoading(false);
			}
		}
		
		// Only call functions if we have session data
		if (session?.user) {
			getBrandCampaigns();
			if (profile?.logo) {
				check(profile.logo);
			}
		}
	}, [token, id, profile?.logo, session?.user, session, update]);

	const handleFallbackCardClick = () => {
		router.push("/brand/campaign/create-campaign");
	}

	const handleCampaignCardClick = (brandId: string, campaignId: string) => {
		router.push(`/brand/campaign/details/${campaignId}`)
	}

	console.log(session?.user, profile);

	return (
		<div className="w-full h-full bg-sidebar">
			<UserAvatar token={token} id={id} isLoading={isLoading} user={profile} />

			<div className="p-5 border-b-[1px] border-sidebar-border">
				{/* <p className="text-3xl font-bold">Campaigns</p> */}

				<ShadcnTitle className="ml-[1em] mt-[1em]">Campaigns</ShadcnTitle>
				<ProfileCampaignSection
					campaignDataArray={campaignData}
					isLoading={isLoading}
					handleFallbackCardClick={handleFallbackCardClick}
					handleCardClick={handleCampaignCardClick}
				/>
			</div>
		</div>
	);
}
