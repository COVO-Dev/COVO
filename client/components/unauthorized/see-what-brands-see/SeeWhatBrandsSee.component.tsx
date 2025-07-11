"use client";
import { Button } from "@/components/ui/button";
import { ExternalLink, Heart, MessageCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function SeeWhatBrandsSee() {
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

	// Demo influencer data
	const influencers = [
		{
			id: 1,
			name: "Sarah Johnson",
			username: "@sarahjohnson",
			covoScore: 94,
			followers: "127K",
			engagement: "4.2%",
			avgLikes: "5.3K",
			avgComments: "284",
			demographics: {
				age: "25-34",
				gender: "65% Female",
				location: "US, UK, CA"
			},
			contentPillars: ["Fashion", "Lifestyle", "Beauty"],
			activePlatforms: ["Instagram", "TikTok"],
			performance: {
				campaigns: 23,
				avgReach: "89K",
				qualityScore: "96%",
				conversion: "2.1%"
			}
		},
		{
			id: 2,
			name: "Marcus Chen",
			username: "@marcustech",
			covoScore: 88,
			followers: "89K",
			engagement: "5.8%",
			avgLikes: "4.1K",
			avgComments: "342",
			demographics: {
				age: "18-35",
				gender: "72% Male",
				location: "US, DE, JP"
			},
			contentPillars: ["Technology", "Gaming", "Finance"],
			activePlatforms: ["YouTube", "Instagram"],
			performance: {
				campaigns: 18,
				avgReach: "67K",
				qualityScore: "94%",
				conversion: "3.2%"
			}
		},
		{
			id: 3,
			name: "Emma Rodriguez",
			username: "@emmafit",
			covoScore: 91,
			followers: "203K",
			engagement: "3.9%",
			avgLikes: "7.2K",
			avgComments: "156",
			demographics: {
				age: "22-35",
				gender: "78% Female",
				location: "US, AU, UK"
			},
			contentPillars: ["Fitness", "Health", "Wellness"],
			activePlatforms: ["Instagram", "YouTube"],
			performance: {
				campaigns: 31,
				avgReach: "145K",
				qualityScore: "98%",
				conversion: "1.8%"
			}
		}
	];

	return (
		<div className="min-h-screen bg-white">
			
			
			{/* Hero Section */}
			<section className="pt-24 pb-16 bg-white relative z-10">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black mb-6 tracking-tight">
							See What Brands See
						</h1>
						<p className="text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
							Get detailed insights into every influencer before you collaborate. Our platform shows
							you everything you need to make informed decisions.
						</p>
					</div>
				</div>
			</section>

			{/* Main Content Section */}
			<section ref={sectionRef} className="py-16 sm:py-20 lg:py-24 bg-white overflow-hidden relative z-10">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					{/* Influencer Cards Grid */}
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 relative">
						{influencers.map((influencer, index) => (
							<div
								key={influencer.id}
								className={`bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-2xl hover:-translate-y-4 hover:scale-105 transition-all duration-700 relative z-10 ${
									loadingStates[index] ? 'animate-card-entrance-advanced' : 'opacity-0'
								}`}
								style={{
									animationDelay: `${index * 300}ms`,
								}}
							>
								{/* Profile Header */}
								<div className="flex items-center mb-4">
									<div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mr-3 flex-shrink-0"></div>
									<div className="flex-1 min-w-0">
										<h3 className="font-semibold text-gray-900 truncate">{influencer.name}</h3>
										<p className="text-sm text-gray-500 truncate">{influencer.username}</p>
									</div>
									<div className="text-right">
										<div className="text-xs text-gray-500">COVO Score:</div>
										<div className="font-bold text-lg">{influencer.covoScore}</div>
									</div>
								</div>

								{/* Stats Row */}
								<div className="flex justify-between mb-4">
									<div className="text-center">
										<div className="font-semibold text-gray-900">{influencer.followers}</div>
										<div className="text-xs text-gray-500">Followers</div>
									</div>
									<div className="text-center">
										<div className="font-semibold text-gray-900">{influencer.engagement}</div>
										<div className="text-xs text-gray-500">Engagement</div>
									</div>
									<div className="text-center">
										<div className="font-semibold text-gray-900">{influencer.avgLikes}</div>
										<div className="text-xs text-gray-500">Avg Likes</div>
									</div>
								</div>

								{/* Engagement metrics */}
								<div className="flex items-center justify-between mb-4">
									<div className="flex items-center space-x-1">
										<Heart className="w-4 h-4 text-red-500" />
										<span className="text-sm text-gray-600">{influencer.avgLikes}</span>
									</div>
									<div className="flex items-center space-x-1">
										<MessageCircle className="w-4 h-4 text-blue-500" />
										<span className="text-sm text-gray-600">{influencer.avgComments}</span>
									</div>
								</div>

								{/* Demographics */}
								<div className="mb-4">
									<h4 className="font-semibold text-sm text-gray-900 mb-2">Demographics</h4>
									<div className="text-xs text-gray-600 space-y-1">
										<div>Age: {influencer.demographics.age}</div>
										<div>Gender: {influencer.demographics.gender}</div>
										<div>Location: {influencer.demographics.location}</div>
									</div>
								</div>

								{/* Content Pillars */}
								<div className="mb-4">
									<h4 className="font-semibold text-sm text-gray-900 mb-2">Content Pillars</h4>
									<div className="flex flex-wrap gap-1">
										{influencer.contentPillars.map((pillar) => (
											<span key={pillar} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
												{pillar}
											</span>
										))}
									</div>
								</div>

								{/* Active Platforms */}
								<div className="mb-6">
									<h4 className="font-semibold text-sm text-gray-900 mb-2">Active Platforms</h4>
									<div className="flex flex-wrap gap-1">
										{influencer.activePlatforms.map((platform) => (
											<span key={platform} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
												{platform}
											</span>
										))}
									</div>
								</div>

								{/* Performance History */}
								<div className="mb-6">
									<h4 className="font-semibold text-sm text-gray-900 mb-2">Performance History</h4>
									<div className="grid grid-cols-2 gap-2 text-xs">
										<div>
											<span className="text-gray-500">Campaigns:</span>
											<span className="ml-1 font-medium">{influencer.performance.campaigns}</span>
										</div>
										<div>
											<span className="text-gray-500">Avg Reach:</span>
											<span className="ml-1 font-medium">{influencer.performance.avgReach}</span>
										</div>
										<div>
											<span className="text-gray-500">Quality Score:</span>
											<span className="ml-1 font-medium">{influencer.performance.qualityScore}</span>
										</div>
										<div>
											<span className="text-gray-500">Conversion:</span>
											<span className="ml-1 font-medium">{influencer.performance.conversion}</span>
										</div>
									</div>
								</div>

								{/* View Full Profile Button */}
								<Button className="w-full bg-black hover:bg-gray-800 text-white py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-all duration-700 hover:scale-105 hover:shadow-xl hover:-translate-y-2 group">
									View Full Profile
									<ExternalLink className="w-4 h-4 transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12" />
								</Button>
							</div>
						))}
					</div>
				</div>
			</section>

			
		</div>
	);
}
