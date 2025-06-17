"use client";

import { useEffect, useState, Fragment, createElement } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import {
	Card,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getCampaignByIdRoute } from "@/lib/api/campaign/get-campaign-by-id/getCampaignById";
import ApplyToCampaignForm from "./form/ApplyToCampaignForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { applyToCampaignRoute } from "@/lib/api/campaign/apply-to-campaign/applyToCampaign.route";
import {
	IApplyToCampaign,
	applyToCampaignSchema,
} from "@/lib/api/campaign/apply-to-campaign/applyToCampaign.validation";
import CampaignHeroCard from "@/components/shared/campaign-hero/campaign-hero-card/CampaignHeroCard.component";
import ICampaignHeroProps from "@/components/shared/campaign-hero/campaign-hero-card/CampaignHeroCard.model";
import CampaignHeroSection from "@/components/shared/campaign-hero/CampaignHeroSection.component";
import ApplyToCampaignSection from "./ApplyToCampaignSection.component";

export default function ApplyToCampaign({ campaignId, brandId }) {
	const [campaignData, setCampaignData] = useState<ICampaignHeroProps['campaignData']>({});
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [applied, setApplied] = useState<boolean>(false);
	const { data: session } = useSession();
	const token = session?.user?.access_token;
	const id = session?.user?._id;
	const router = useRouter();

	// const form = useForm<IApplyToCampaign>({
	// 	resolver: zodResolver(applyToCampaignSchema),
	// });

	const skeletonCards = (
		<div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 rounded-xl border bg-card text-card-foreground p-4 shadow-md ">
			<Card className="p-4 shadow-md animate-pulse">
				<Skeleton className="h-10 w-[60%] mb-2" />
				<Skeleton className="h-4 w-[80%]" />
				<Skeleton className="h-4 w-[80%]" />
				<Skeleton className="h-4 w-[100px]" />
			</Card>
		</div>
	);

	useEffect(() => {
		async function getBrandCampaigns() {
			try {
				setIsLoading(true);
				if (token) {
					const result = await getCampaignByIdRoute(token, campaignId, brandId);
					console.log("server data", result.data.data);
					if (result.status === "success") {
						const campaignResultData = result.data.data;
						setCampaignData(campaignResultData);
						console.log(campaignResultData, id);

						const influencerHasApplied = campaignResultData.applications
							.map((application) => application.influencerId._id)
							.includes(id)
						const influencerHasRegistered = campaignResultData.influencerId
							.map(influencer => influencer._id)
							.includes(id);

						if (influencerHasApplied || influencerHasRegistered) setApplied(true);
						console.log("influencerHasApplied: ", influencerHasApplied, "influencerHasRegistered", influencerHasRegistered, applied);
					}
				}
			} catch (error) {
				console.error(error);
			} finally {
				setIsLoading(false);
			}
		}
		getBrandCampaigns();
	}, [token, applied]);


	// console.log(hasApplied);
	const form = useForm<IApplyToCampaign>({
		resolver: zodResolver(applyToCampaignSchema),
	});

	const handleFormSubmit = async () => {
		// function onSubmit(values: z.infer < typeof formSchema > ) {
		try {
			console.log(form.getValues());
			const returnData = await applyToCampaignRoute(
				token,
				form.getValues(),
				campaignId,
				id
			);
			console.log("Returned Data from server:", returnData);

			if (returnData.status === "success") {
				toast({
					title: "Form submitted!",
					description: "Redirecting to Campaigns",
				});
				router.push("/influencer/campaign");
			} else {
				toast({
					title: returnData.status,
					description: returnData.message,
					variant: "destructive",
				});
			}
		} catch (error) {
			console.error(error);
			toast({
				title: "Validation Error",
				description: "Please fill out all required fields before submitting.",
				variant: "destructive",
			});
		}
	};
	console.log(form);

	return (
		<div className="w-full p-6 md:p-8 lg:p-10">
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<CampaignHeroSection
					className='lg:col-span-2'
					campaignData={campaignData}
					isLoading={isLoading}
				/>
				<ApplyToCampaignSection
					className="lg:col-span-1 border rounded p-4"
					handleSubmit={handleFormSubmit}
					hasApplied={applied}
					isLoading={isLoading}
					form={form}
				/>
			</div>
		</div>
	);
}
