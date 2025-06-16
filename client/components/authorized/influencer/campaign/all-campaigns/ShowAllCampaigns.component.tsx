"use client";

import { useEffect, useState, Fragment } from "react";
import { useSession } from "next-auth/react";
import { getAllCampaignsRoute } from "@/lib/api/campaign/get-all-campaigns/getAllCampaigns.route";
import { useRouter } from "next/navigation";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import CampaignCard from "./CampaignCard.component";
import Search from "../../../brand/discover/search-bar/Search.component";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import CampaignHeroCard from "@/components/shared/campaign-hero/campaign-hero-card/CampaignHeroCard.component";

interface ICampaignData {
	brandId: {
		firstName: string;
		lastName: string;
	};
	budgetRange: number;
	collaborationPreferences: {
		exclusiveCollaborations: boolean;
		hasWorkedWithInfluencers: boolean;
	};
	createdAt: Date;
	endDate: Date;
	geographicFocus: string;
	influencerId: string[];
	influencerType: string;
	isDeleted: false;
	primaryGoals: string[];
	startDate: Date;
	status: string;
	targetAudience: string;
	title: string;
	trackingAndAnalytics: {
		performanceTracking: boolean;
		metrics: Array<string>;
		reportFrequency: string;
	};
	updatedAt: Date;
	__v: number;
	_id: string;
}

export default function ShowAllCampaigns() {
	const [campaignData, setCampaignData] = useState<ICampaignData[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	// console.log("cred", session?.user?.access_token);
	const { data: session } = useSession();
	const token = session?.user?.access_token;
	const router = useRouter();

	const skeletonCards = Array(9)
		.fill(null)
		.map((_, index) => (
			<div
				key={index}
				className="rounded-xl border bg-card text-card-foreground p-4 shadow-md "
			>
				{" "}
				{/* Responsive widths */}
				<Card className="p-4 shadow-md animate-pulse flex flex-col gap-2">
					<Skeleton className="h-10 w-[60%] mb-2" />
					<Skeleton className="h-4 w-[80%]" />
					<Skeleton className="h-4 w-[80%]" />
					<Skeleton className="h-4 w-[100px]" />
				</Card>
			</div>
		));
	const [paginationInfo, setPaginationInfo] = useState({
		currentPage: 1,
		totalPages: 1,
		totalCount: 0,
	});

	async function getBrandCampaigns(page: number = 1, token: string) {
		// Accept token argument
		try {
			setIsLoading(true);
			const result = await getAllCampaignsRoute({ page: page }, token); // Use currentToken

			if (result.status === "success") {
				// ... (rest of the function remains the same)
				const campaignResultDataArray = result.data.data.data;
				setCampaignData([...campaignResultDataArray]);
				console.log(campaignResultDataArray);

				// Update pagination info
				setPaginationInfo({
					currentPage: result.data.data.currentPage,
					totalPages: result.data.data.totalPages,
					totalCount: result.data.data.totalCount,
				});
			}
		} catch (error) {
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		getBrandCampaigns(paginationInfo.currentPage, token);
	}, [token, paginationInfo.currentPage]); // token is the dependency array

	const handlePageChange = (page: number) => {
		getBrandCampaigns(page, token); // Call with the new page
	};

	return (
		<div className="flex flex-col gap-3 px-[1em] md:px-[2em] lg:px-[3em] justify-center items-center pb-[1em] ">
			<Search />
			<div className="grid grid-cols-1  gap-4 py-[1em] px-[1em] border-2 border-round lg:w-[80%] rounded-xl">
				{" "}
				{/* Responsive Grid */}
				{isLoading ? (
					skeletonCards
				) : campaignData ? (
					campaignData.map((campaign) => (
						<Fragment key={campaign._id}>
							{" "}
							<CampaignCard campaignData={campaign} />
						</Fragment>
					))
				) : (
					<p>No campaigns found.</p>
				)}
			</div>

			<Pagination>
				<PaginationContent>
					{paginationInfo.currentPage > 1 && (
						<PaginationPrevious
							onClick={() => handlePageChange(paginationInfo.currentPage - 1)}
						/>
					)}
					{/* Display page numbers (simplified example) */}
					{Array.from(
						{ length: paginationInfo.totalPages },
						(_, i) => i + 1
					).map((page) => (
						<PaginationItem key={page}>
							<PaginationLink
								isActive={page === paginationInfo.currentPage}
								onClick={() => handlePageChange(page)}
							>
								{page}
							</PaginationLink>
						</PaginationItem>
					))}

					{paginationInfo.currentPage < paginationInfo.totalPages && (
						<PaginationItem>
							<PaginationNext
								onClick={() => handlePageChange(paginationInfo.currentPage + 1)}
							/>
						</PaginationItem>
					)}
				</PaginationContent>
			</Pagination>
		</div>
	);
}
