"use client";

import React from "react";
// import { IInfluencer } from './influencer.model';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Instagram,
	Youtube,
	Facebook,
	Twitter,
	Users,
	Heart,
	MessageSquare,
	Share2,
	Eye,
	UserRound,
	User,
	Mail,
} from "lucide-react";
import Image from "next/image";
import COVO_LOGOGRAM_BLACK_2 from "@/assets/images/COVO_LOGOGRAM_BLACK_2.png";

// interface InfluencerProfileProps {
//   influencerData: IInfluencer;
// }

const InfluencerDetails = ({ influencerData }) => {
	const {
		// profilePicture,
		firstName,
		lastName,
		username,
		email,
		selectedPlatforms,
		totalMetrics,
		contentAndAudience,
		location,
		personalBio,
		platforms,
	} = influencerData;

	const platformIcons = {
		youtube: <Youtube className="w-5 h-5" />,
		tiktok: <Heart className="w-5 h-5" />,
		instagram: <Instagram className="w-5 h-5" />,
		facebook: <Facebook className="w-5 h-5" />,
		twitter: <Twitter className="w-5 h-5" />,
	};

	const getPlatformMetrics = (platform: string) => {
		if (platforms && platforms[platform] && platforms[platform].metrics) {
			return platforms[platform].metrics;
		}
		return null;
	};

	return (
		<div className="h-[90vh] p-4 sm:p-6 md:p-8 lg:p-10 max-w-[1200px] ">
			<div className="flex flex-col lg:flex-row gap-6">
				{/* Profile Picture */}
				<aside className="lg:w-1/4 flex flex-col items-center lg:items-start ">
					<Avatar className="w-32 h-32 sm:w-40 sm:h-40 rounded-full mb-4 border-4">
						{/* <Image
							src={COVO_LOGOGRAM_BLACK_2}
							alt={firstName}
							width={500}
							height={500}
						/> */}
						<div
							// src={AshrafAtef}
							// alt="Profile Picture"
							// height={200}
							className="rounded-full w-[10rem] h-[10rem] flex items-center justify-center font-bold text-xl bg-slate-200 border-8 border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.3)] backdrop-blur-sm"
						>
							{firstName.slice(0, 1).toLocaleUpperCase() + lastName.slice(0, 1).toLocaleUpperCase()}
							{/* {firstName.toLocaleUpperCase()} */}
						</div>
					</Avatar>
					<div className="text-center lg:text-left">
						<h2 className="text-xl sm:text-2xl font-semibold">
							{firstName} {lastName}
						</h2>
						<p className="text-sm text-muted-foreground">@{username}</p>
					</div>
				</aside>

				{/* Profile Details */}
				<section className=" lg:w-3/4 ">
					<div className="space-y-4">
						{/* Selected Platforms */}
						<div className="border rounded-md p-4 bg-white dark:bg-gray-800 shadow-sm">
							<h3 className="text-lg font-semibold mb-2">Selected Platforms</h3>
							<div className="flex flex-wrap gap-2">
								{selectedPlatforms.map((platform) => (
									<Badge
										key={platform}
										variant="outline"
										className="flex items-center gap-1 text-xs sm:text-sm"
									>
										{platformIcons[platform]}
										{platform}
									</Badge>
								))}
							</div>
						</div>

						{/* Total Metrics */}
						<div className="border rounded-md p-4 bg-white dark:bg-gray-800 shadow-sm">
							<h3 className="text-lg font-semibold mb-2">Total Metrics</h3>
							<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
								<div className="flex items-center gap-2 text-sm">
									<Users className="w-4 h-4 text-muted-foreground" /> Followers:{" "}
									{totalMetrics?.followers}
								</div>
								<div className="flex items-center gap-2 text-sm">
									<Heart className="w-4 h-4 text-muted-foreground" /> Likes:{" "}
									{totalMetrics?.likes}
								</div>
								<div className="flex items-center gap-2 text-sm">
									<MessageSquare className="w-4 h-4 text-muted-foreground" />{" "}
									Comments: {totalMetrics?.comments}
								</div>
								<div className="flex items-center gap-2 text-sm">
									<Share2 className="w-4 h-4 text-muted-foreground" /> Shares:{" "}
									{totalMetrics?.shares}
								</div>
							</div>
						</div>

						{/* Content & Audience */}
						{contentAndAudience && (
							<div className="border rounded-md p-4 bg-white dark:bg-gray-800 shadow-sm">
								<h3 className="text-lg font-semibold mb-2">
									Content & Audience
								</h3>
								<p className="text-sm">
									Primary Niche: {contentAndAudience.primaryNiche}
								</p>
								{contentAndAudience.secondaryNiche && (
									<p className="text-sm">
										Secondary Niche: {contentAndAudience.secondaryNiche}
									</p>
								)}
								<p className="text-sm">
									Content Specialization:{" "}
									{contentAndAudience.contentSpecialisation}
								</p>
								<p className="text-sm">
									Brand Gifting:{" "}
									{contentAndAudience.brandGifting ? "Yes" : "No"}
								</p>
								<p className="text-sm">
									Paid Collaborations Only:{" "}
									{contentAndAudience.paidCollaborationsOnly ? "Yes" : "No"}
								</p>
							</div>
						)}

						{/* Location */}
						{location && (
							<div className="border rounded-md p-4 bg-white dark:bg-gray-800 shadow-sm flex flex-row gap-4 justify-between items-center">
								<div>
									<h3 className="text-lg font-semibold mb-2">Location</h3>
									<p className="text-sm">Country: {location.country}</p>
									<p className="text-sm">City: {location.city}</p>
								</div>
								<div>
									<h3 className="text-lg font-semibold mb-2">Email</h3>
									<p className="text-sm flex gap-2 items-center"><Mail /> {email}</p>
								</div>
							</div>
						)}

						{/* Personal Bio */}
						{personalBio && (
							<div className="border rounded-md p-4 bg-white dark:bg-gray-800 shadow-sm">
								<h3 className="text-lg font-semibold mb-2">Personal Bio</h3>
								<p className="text-sm">{personalBio}</p>
							</div>
						)}

						{/* Platform-specific Metrics */}
						{selectedPlatforms.map((platform) => {
							const metrics = getPlatformMetrics(platform);
							if (!metrics) return null;
							return (
								<div
									key={platform}
									className="border rounded-md p-4 bg-white dark:bg-gray-800 shadow-sm"
								>
									<h3 className="text-lg font-semibold mb-2">
										{platform} Metrics
									</h3>
									<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
										<div className="flex items-center gap-2 text-sm">
											<Users className="w-4 h-4 text-muted-foreground" />{" "}
											Followers: {metrics.followers}
										</div>
										<div className="flex items-center gap-2 text-sm">
											<Heart className="w-4 h-4 text-muted-foreground" /> Likes:{" "}
											{metrics.likes}
										</div>
										<div className="flex items-center gap-2 text-sm">
											<MessageSquare className="w-4 h-4 text-muted-foreground" />{" "}
											Comments: {metrics.comments}
										</div>
										<div className="flex items-center gap-2 text-sm">
											<Share2 className="w-4 h-4 text-muted-foreground" />{" "}
											Shares: {metrics.shares}
										</div>
										{metrics.views !== undefined && (
											<div className="flex items-center gap-2 text-sm">
												<Eye className="w-4 h-4 text-muted-foreground" /> Views:{" "}
												{metrics.views}
											</div>
										)}
										<div className="flex items-center gap-2 text-sm">
											Engagement Rate: {metrics.engagementRate}
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</section>
			</div>
		</div>
	);
};

export default InfluencerDetails;
