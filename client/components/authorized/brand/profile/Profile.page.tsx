'use client';
// src/app/authorized/profile/page.tsx

import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import facebook from "@/assets/images/Social_Media_Icons/facebook.png";
import instagram from "@/assets/images/Social_Media_Icons/instagram.png";
import tiktok from "@/assets/images/Social_Media_Icons/tiktok.png";
import youtube from "@/assets/images/Social_Media_Icons/youtube.png";
import { AreaChartComponent } from "./area-chart/AreaChart.component";
import UserAvatar from "./user-avatar/UserAvatar.component";
import { useEffect, useState } from "react";
import { getCampaignByBrandIdRoute } from "@/lib/api/campaign/get-campaign-by-brand-id/getCampaignByBrandId.route";
import { useAppSelector } from "@/lib/store/hooks";
import { setCampaignData } from "@/lib/store/campaign/campaign.slice";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Check,
	CalendarDays,
	MapPin,
	Users,
	Target,
	DollarSign,
	TrendingUp,
	FileText,
} from "lucide-react"; // Import icons
import { formatDate } from "date-fns"; // For date formatting (install: npm install date-fns)
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
	const token = session?.user?.access_token;
	const id = session?.user?._id;
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
				if (token) {
					const result = await getCampaignByBrandIdRoute(token, id);
					console.log("server data", result.data.data.data);
					if (result.status === "success") {
						const campaignResultDataArray = result.data.data.data;
						setCampaignData(campaignResultDataArray);
					}
					// setCampaignData(result.data.data.data);
				}
			} catch (error) {
				console.error(error);
			} finally {
				setIsLoading(false);
			}
		}
		getBrandCampaigns();
		check(profile.logo);
	}, [token, id, profile.logo]);

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
