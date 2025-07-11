"use client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Clock, DollarSign, Instagram, Youtube } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function SeeWhatInfluencersSee() {
	const sectionRef = useRef<HTMLElement>(null);
	const [isVisible, setIsVisible] = useState(false);
	const [hasTriggered, setHasTriggered] = useState(false);
	const [loadingStates, setLoadingStates] = useState([false, false, false]);
	const [contentLoadingStates, setContentLoadingStates] = useState([
		{ profile: false, stats: false, details: false },
		{ profile: false, stats: false, details: false },
		{ profile: false, stats: false, details: false }
	]);

	// Intersection Observer for scroll-triggered animations
	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && !hasTriggered) {
					setIsVisible(true);
					setHasTriggered(true);
				}
			},
			{ threshold: 0.1 }
		);

		if (sectionRef.current) {
			observer.observe(sectionRef.current);
		}

		return () => {
			if (sectionRef.current) {
				observer.unobserve(sectionRef.current);
			}
		};
	}, [hasTriggered]);

	// Progressive loading animation for cards
	useEffect(() => {
		if (isVisible) {
			// Trigger card loading states with staggered delays
			const delays = [500, 800, 1100];
			delays.forEach((delay, index) => {
				setTimeout(() => {
					setLoadingStates(prev => {
						const newStates = [...prev];
						newStates[index] = true;
						return newStates;
					});
				}, delay);
			});

			// Progressive content loading for each card
			delays.forEach((baseDelay, cardIndex) => {
				const contentDelays = [
					baseDelay + 300, // profile
					baseDelay + 600, // stats
					baseDelay + 900  // details
				];

				contentDelays.forEach((delay, contentIndex) => {
					setTimeout(() => {
						setContentLoadingStates(prev => {
							const newStates = [...prev];
							const keys = ['profile', 'stats', 'details'];
							newStates[cardIndex][keys[contentIndex] as keyof typeof newStates[0]] = true;
							return newStates;
						});
					}, delay);
				});
			});
		}
	}, [isVisible]);

	// Demo brand campaign data matching the reference design
	const campaigns = [
		{
			id: 1,
			brandName: "EcoBeauty Co.",
			location: "Cape Town, South Africa",
			brandScore: 92,
			campaignTitle: "Sustainable Skincare Launch",
			description: "Promote our new eco-friendly skincare line with authentic reviews and tutorials",
			budget: "$2,500 - $5,000",
			deadline: "Dec 15, 2024",
			campaignType: "Product Review",
			responseTime: "Fast",
			platforms: ["Instagram"],
			targetNiches: ["Beauty", "Sustainability", "Skincare"],
			deliverables: [
				"1 Instagram post",
				"3 Instagram stories",
				"Usage rights for 6 months"
			],
			brandColor: "bg-teal-500",
			brandIcon: "🌿"
		},
		{
			id: 2,
			brandName: "FitLife Nutrition",
			location: "Johannesburg, South Africa",
			brandScore: 88,
			campaignTitle: "Protein Powder Collaboration",
			description: "Create engaging content showcasing our premium protein powder with workout routines",
			budget: "$1,500 - $3,000",
			deadline: "Jan 10, 2025",
			campaignType: "Sponsored Content",
			responseTime: "Fast",
			platforms: ["YouTube", "Instagram"],
			targetNiches: ["Fitness", "Nutrition", "Health"],
			deliverables: [
				"1 YouTube video (5-10 mins)",
				"2 Instagram posts",
				"4 Instagram stories"
			],
			brandColor: "bg-orange-500",
			brandIcon: "💪"
		},
		{
			id: 3,
			brandName: "TechGadget Hub",
			location: "Durban, South Africa",
			brandScore: 95,
			campaignTitle: "Smart Watch Review Series",
			description: "Comprehensive review of our latest smartwatch featuring health tracking and productivity features",
			budget: "$3,000 - $6,000",
			deadline: "Dec 30, 2024",
			campaignType: "Product Review",
			responseTime: "Fast",
			platforms: ["YouTube", "Instagram", "TikTok"],
			targetNiches: ["Technology", "Gadgets", "Reviews"],
			deliverables: [
				"1 YouTube review (10-15 mins)",
				"1 Instagram post",
				"3 TikTok videos",
				"5 Instagram stories"
			],
			brandColor: "bg-blue-500",
			brandIcon: "⌚"
		}
	];

	const getPlatformIcon = (platform: string) => {
		switch (platform) {
			case "Instagram":
				return <Instagram className="w-4 h-4" />;
			case "YouTube":
				return <Youtube className="w-4 h-4" />;
			case "TikTok":
				return <span className="w-4 h-4 text-xs font-bold flex items-center justify-center">📱</span>;
			default:
				return null;
		}
	};

	return (
		<div className="min-h-screen bg-white">
			
			{/* Background gradient overlay */}
			<div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 opacity-60 pointer-events-none"></div>

			{/* Hero Section */}
			<section className="pt-24 pb-16 bg-white relative z-10">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black mb-6 tracking-tight">
							See What Influencers See
						</h1>
						<p className="text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
							Discover how brands appear from an influencer's perspective. Explore campaign opportunities,
							brand profiles, and collaboration details.
						</p>
					</div>
				</div>
			</section>

			{/* Main Content Section */}
			<section ref={sectionRef} className="py-16 sm:py-20 lg:py-24 bg-white overflow-hidden relative z-10">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					{/* Campaign Cards Grid with enhanced staggered animations */}
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 relative">
						{/* Subtle parallax background elements */}
						<div className="absolute inset-0 pointer-events-none opacity-10">
							<div className="absolute top-10 left-10 w-20 h-20 bg-blue-300 rounded-full blur-xl animate-float animation-delay-300"></div>
							<div className="absolute bottom-20 right-10 w-16 h-16 bg-purple-300 rounded-full blur-lg animate-float animation-delay-700"></div>
						</div>

						{campaigns.map((campaign, index) => (
							<div
								key={campaign.id}
								className={`bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-2xl hover:-translate-y-4 hover:scale-105 transition-all duration-700 hover-lift gpu-accelerated relative z-10 ${
									loadingStates[index] ? 'animate-card-entrance-advanced' : 'opacity-0'
								}`}
								style={{
									animationDelay: `${index * 300}ms`,
									transformStyle: 'preserve-3d'
								}}
							>
								{/* Brand Header with progressive loading animation */}
								<div className="flex items-center mb-4">
									<div className={`w-12 h-12 ${campaign.brandColor} rounded-lg mr-3 flex-shrink-0 relative overflow-hidden flex items-center justify-center`}>
										{/* Loading shimmer effect */}
										{!contentLoadingStates[index].profile && (
											<div className="absolute inset-0 animate-shimmer"></div>
										)}
										{/* Brand icon with progressive reveal */}
										<div className={`text-white text-xl transition-all duration-500 ${
											contentLoadingStates[index].profile ? 'animate-progressive-reveal' : 'opacity-0'
										}`}>
											{campaign.brandIcon}
										</div>
									</div>
									<div className="flex-1 min-w-0">
										{/* Brand name with loading state */}
										{!contentLoadingStates[index].profile ? (
											<div className="h-5 bg-gray-200 rounded animate-shimmer-pulse mb-1"></div>
										) : (
											<h3 className="font-semibold text-gray-900 truncate animate-progressive-reveal">{campaign.brandName}</h3>
										)}
										{/* Location with loading state */}
										{!contentLoadingStates[index].profile ? (
											<div className="h-4 bg-gray-200 rounded animate-shimmer-pulse w-3/4"></div>
										) : (
											<p className="text-sm text-gray-500 truncate animate-progressive-reveal animation-delay-100">{campaign.location}</p>
										)}
									</div>
									<div className="text-right">
										{!contentLoadingStates[index].profile ? (
											<div className="space-y-1">
												<div className="h-3 bg-gray-200 rounded animate-shimmer-pulse w-16"></div>
												<div className="h-6 bg-gray-200 rounded animate-shimmer-pulse w-8"></div>
											</div>
										) : (
											<>
												<div className="text-xs text-gray-500 animate-progressive-reveal animation-delay-200">Brand Score:</div>
												<div className="font-bold text-lg animate-progressive-reveal animation-delay-300">{campaign.brandScore}</div>
											</>
										)}
									</div>
								</div>

								{/* Campaign Title and Description */}
								<div className="mb-4">
									{!contentLoadingStates[index].profile ? (
										<>
											<div className="h-5 bg-gray-200 rounded animate-shimmer-pulse mb-2"></div>
											<div className="h-4 bg-gray-200 rounded animate-shimmer-pulse w-full mb-1"></div>
											<div className="h-4 bg-gray-200 rounded animate-shimmer-pulse w-3/4"></div>
										</>
									) : (
										<>
											<h4 className="font-bold text-lg text-gray-900 mb-2 animate-progressive-reveal animation-delay-400">{campaign.campaignTitle}</h4>
											<p className="text-sm text-gray-600 leading-relaxed animate-progressive-reveal animation-delay-500">{campaign.description}</p>
										</>
									)}
								</div>

								{/* Budget and Deadline Row */}
								<div className="flex justify-between mb-4">
									{!contentLoadingStates[index].stats ? (
										<>
											<div className="text-left">
												<div className="h-4 bg-gray-200 rounded animate-shimmer-pulse w-20 mb-1"></div>
												<div className="h-3 bg-gray-200 rounded animate-shimmer-pulse w-16"></div>
											</div>
											<div className="text-right">
												<div className="h-4 bg-gray-200 rounded animate-shimmer-pulse w-20 mb-1"></div>
												<div className="h-3 bg-gray-200 rounded animate-shimmer-pulse w-16"></div>
											</div>
										</>
									) : (
										<>
											<div className="text-left animate-progressive-reveal animation-delay-600">
												<div className="font-semibold text-green-600 flex items-center gap-1">
													<DollarSign className="w-4 h-4" />
													{campaign.budget}
												</div>
												<div className="text-xs text-gray-500">Budget</div>
											</div>
											<div className="text-right animate-progressive-reveal animation-delay-700">
												<div className="font-semibold text-gray-900 flex items-center gap-1 justify-end">
													<Calendar className="w-4 h-4" />
													{campaign.deadline}
												</div>
												<div className="text-xs text-gray-500">Deadline</div>
											</div>
										</>
									)}
								</div>

								{/* Campaign Type and Response Time */}
								<div className="flex items-center justify-between mb-4">
									{!contentLoadingStates[index].stats ? (
										<>
											<div className="flex items-center space-x-1">
												<div className="w-4 h-4 bg-gray-200 rounded animate-shimmer-pulse"></div>
												<div className="h-3 bg-gray-200 rounded animate-shimmer-pulse w-20"></div>
											</div>
											<div className="flex items-center space-x-1">
												<div className="w-4 h-4 bg-gray-200 rounded animate-shimmer-pulse"></div>
												<div className="h-3 bg-gray-200 rounded animate-shimmer-pulse w-12"></div>
											</div>
										</>
									) : (
										<>
											<div className="animate-progressive-reveal animation-delay-800">
												<span className="text-xs text-gray-500">Campaign Type</span>
												<div className="font-medium text-sm">{campaign.campaignType}</div>
											</div>
											<div className="flex items-center space-x-1 animate-progressive-reveal animation-delay-900">
												<Clock className="w-4 h-4 text-green-500" />
												<span className="text-sm text-green-600 font-medium">{campaign.responseTime}</span>
											</div>
										</>
									)}
								</div>

								{/* Platforms */}
								<div className="mb-4">
									{!contentLoadingStates[index].details ? (
										<>
											<div className="h-4 bg-gray-200 rounded animate-shimmer-pulse w-20 mb-2"></div>
											<div className="flex flex-wrap gap-1">
												{[...Array(2)].map((_, i) => (
													<div key={i} className="h-6 bg-gray-200 rounded animate-shimmer-pulse w-16"></div>
												))}
											</div>
										</>
									) : (
										<>
											<h5 className="font-semibold text-sm text-gray-900 mb-2 animate-progressive-reveal animation-delay-600">Platforms</h5>
											<div className="flex flex-wrap gap-2">
												{campaign.platforms.map((platform, platformIndex) => (
													<div
														key={platform}
														className="flex items-center gap-1 text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded animate-progressive-reveal"
														style={{ animationDelay: `${600 + platformIndex * 100}ms` }}
													>
														{getPlatformIcon(platform)}
														{platform}
													</div>
												))}
											</div>
										</>
									)}
								</div>

								{/* Target Niches */}
								<div className="mb-4">
									{!contentLoadingStates[index].details ? (
										<>
											<div className="h-4 bg-gray-200 rounded animate-shimmer-pulse w-24 mb-2"></div>
											<div className="flex flex-wrap gap-1">
												{[...Array(3)].map((_, i) => (
													<div key={i} className="h-6 bg-gray-200 rounded animate-shimmer-pulse w-16"></div>
												))}
											</div>
										</>
									) : (
										<>
											<h5 className="font-semibold text-sm text-gray-900 mb-2 animate-progressive-reveal animation-delay-700">Target Niches</h5>
											<div className="flex flex-wrap gap-1">
												{campaign.targetNiches.map((niche, nicheIndex) => (
													<span
														key={niche}
														className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded animate-progressive-reveal"
														style={{ animationDelay: `${700 + nicheIndex * 100}ms` }}
													>
														{niche}
													</span>
												))}
											</div>
										</>
									)}
								</div>

								{/* Deliverables */}
								<div className="mb-6">
									{!contentLoadingStates[index].details ? (
										<>
											<div className="h-4 bg-gray-200 rounded animate-shimmer-pulse w-24 mb-2"></div>
											<div className="space-y-1">
												{[...Array(3)].map((_, i) => (
													<div key={i} className="h-3 bg-gray-200 rounded animate-shimmer-pulse w-full"></div>
												))}
											</div>
										</>
									) : (
										<>
											<h5 className="font-semibold text-sm text-gray-900 mb-2 animate-progressive-reveal animation-delay-800">Deliverables</h5>
											<div className="space-y-1">
												{campaign.deliverables.map((deliverable, deliverableIndex) => (
													<div
														key={deliverable}
														className="flex items-center text-xs text-gray-600 animate-progressive-reveal"
														style={{ animationDelay: `${800 + deliverableIndex * 100}ms` }}
													>
														<div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
														{deliverable}
													</div>
												))}
											</div>
										</>
									)}
								</div>

								{/* Apply Now Button */}
								{!contentLoadingStates[index].details ? (
									<div className="h-10 bg-gray-200 rounded-md animate-shimmer-pulse"></div>
								) : (
									<Button className="w-full bg-black hover:bg-gray-800 text-white py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-all duration-700 hover:scale-105 hover:shadow-xl hover:-translate-y-2 animate-progressive-reveal animation-delay-1300 group hover:bg-gradient-to-r hover:from-gray-800 hover:to-black">
										Apply Now
										<ArrowRight className="w-4 h-4 transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12" />
									</Button>
								)}
							</div>
						))}
					</div>
				</div>
			</section>

			
		</div>
	);
}
