"use client";
import { Button } from "@/components/ui/button";
import { ExternalLink, Heart, MessageCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function Demo() {
	const sectionRef = useRef<HTMLElement>(null);
	const [isVisible, setIsVisible] = useState(false);
	const [hasTriggered, setHasTriggered] = useState(false);
	const [loadingStates, setLoadingStates] = useState([false, false, false]);
	const [contentLoadingStates, setContentLoadingStates] = useState([
		{ profile: false, stats: false, details: false },
		{ profile: false, stats: false, details: false },
		{ profile: false, stats: false, details: false }
	]);

	// Enhanced Intersection Observer for one-time scroll animations
	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && !hasTriggered) {
					setIsVisible(true);
					setHasTriggered(true);

					// Disconnect observer after first trigger to prevent re-execution
					observer.unobserve(entry.target);

					// Stagger the card entrance animations
					setTimeout(() => {
						setLoadingStates([true, false, false]);
						// Start progressive content loading for first card
						setTimeout(() => setContentLoadingStates(prev => [
							{ profile: true, stats: false, details: false },
							{ profile: false, stats: false, details: false },
							{ profile: false, stats: false, details: false }
						]), 300);
						setTimeout(() => setContentLoadingStates(prev => [
							{ profile: true, stats: true, details: false },
							{ profile: false, stats: false, details: false },
							{ profile: false, stats: false, details: false }
						]), 600);
						setTimeout(() => setContentLoadingStates(prev => [
							{ profile: true, stats: true, details: true },
							{ profile: false, stats: false, details: false },
							{ profile: false, stats: false, details: false }
						]), 900);
					}, 200);

					setTimeout(() => {
						setLoadingStates([true, true, false]);
						// Start progressive content loading for second card
						setTimeout(() => setContentLoadingStates(prev => [
							prev[0],
							{ profile: true, stats: false, details: false },
							{ profile: false, stats: false, details: false }
						]), 300);
						setTimeout(() => setContentLoadingStates(prev => [
							prev[0],
							{ profile: true, stats: true, details: false },
							{ profile: false, stats: false, details: false }
						]), 600);
						setTimeout(() => setContentLoadingStates(prev => [
							prev[0],
							{ profile: true, stats: true, details: true },
							{ profile: false, stats: false, details: false }
						]), 900);
					}, 500);

					setTimeout(() => {
						setLoadingStates([true, true, true]);
						// Start progressive content loading for third card
						setTimeout(() => setContentLoadingStates(prev => [
							prev[0],
							prev[1],
							{ profile: true, stats: false, details: false }
						]), 300);
						setTimeout(() => setContentLoadingStates(prev => [
							prev[0],
							prev[1],
							{ profile: true, stats: true, details: false }
						]), 600);
						setTimeout(() => setContentLoadingStates(prev => [
							prev[0],
							prev[1],
							{ profile: true, stats: true, details: true }
						]), 900);
					}, 800);
				}
			},
			{ threshold: 0.05, rootMargin: '50px' } // More responsive detection
		);

		if (sectionRef.current && !hasTriggered) {
			observer.observe(sectionRef.current);
		}

		return () => observer.disconnect();
	}, [hasTriggered]);

	// Demo influencer data matching the reference design
	const influencers = [
		{
			id: 1,
			name: "Sarah Johnson",
			username: "@sarahjohnson",
			avatar: "/images/avatar-sarah.jpg", // Placeholder - would need actual image
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
			avatar: "/images/avatar-marcus.jpg", // Placeholder - would need actual image
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
			avatar: "/images/avatar-emma.jpg", // Placeholder - would need actual image
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
		<section ref={sectionRef} id="demo" className="py-16 sm:py-20 lg:py-24 bg-white overflow-hidden">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Section Header with one-time scroll animations */}
				<div className={`text-center mb-12 sm:mb-16 transition-all duration-1000 ${hasTriggered ? 'animate-fade-in-up opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
					<h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-4 sm:mb-6 ${hasTriggered ? 'animate-slide-up animation-delay-200' : ''}`}>
						See What Brands See
					</h2>
					<p className={`text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed ${hasTriggered ? 'animate-fade-in-up animation-delay-400' : ''}`}>
						Get detailed insights into every influencer before you collaborate. Our platform shows
						you everything you need to make informed decisions.
					</p>
				</div>

				{/* Influencer Cards Grid with enhanced staggered animations */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 relative">
					{/* Subtle parallax background elements */}
					<div className="absolute inset-0 pointer-events-none opacity-10">
						<div className="absolute top-10 left-10 w-20 h-20 bg-blue-300 rounded-full blur-xl animate-float animation-delay-300"></div>
						<div className="absolute bottom-20 right-10 w-16 h-16 bg-purple-300 rounded-full blur-lg animate-float animation-delay-700"></div>
					</div>

					{influencers.map((influencer, index) => (
						<div
							key={influencer.id}
							className={`bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-2xl hover:-translate-y-4 hover:scale-105 transition-all duration-700 hover-lift gpu-accelerated relative z-10 ${
								loadingStates[index] ? 'animate-card-entrance-advanced' : 'opacity-0'
							}`}
							style={{
								animationDelay: `${index * 300}ms`,
								transformStyle: 'preserve-3d'
							}}
						>
							{/* Profile Header with progressive loading animation */}
							<div className="flex items-center mb-4">
								<div className="w-12 h-12 bg-gray-300 rounded-full mr-3 flex-shrink-0 relative overflow-hidden">
									{/* Loading shimmer effect */}
									{!contentLoadingStates[index].profile && (
										<div className="absolute inset-0 animate-shimmer"></div>
									)}
									{/* Actual avatar with progressive reveal */}
									<div className={`w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-full transition-all duration-500 ${
										contentLoadingStates[index].profile ? 'animate-progressive-reveal' : 'opacity-0'
									}`}></div>
								</div>
								<div className="flex-1 min-w-0">
									{/* Name with loading state */}
									{!contentLoadingStates[index].profile ? (
										<div className="h-5 bg-gray-200 rounded animate-shimmer-pulse mb-1"></div>
									) : (
										<h3 className="font-semibold text-gray-900 truncate animate-progressive-reveal">{influencer.name}</h3>
									)}
									{/* Username with loading state */}
									{!contentLoadingStates[index].profile ? (
										<div className="h-4 bg-gray-200 rounded animate-shimmer-pulse w-3/4"></div>
									) : (
										<p className="text-sm text-gray-500 truncate animate-progressive-reveal animation-delay-100">{influencer.username}</p>
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
											<div className="text-xs text-gray-500 animate-progressive-reveal animation-delay-200">COVO Score:</div>
											<div className="font-bold text-lg animate-progressive-reveal animation-delay-300">{influencer.covoScore}</div>
										</>
									)}
								</div>
							</div>

							{/* Stats Row with progressive loading */}
							<div className="grid grid-cols-2 gap-4 mb-4">
								<div>
									{!contentLoadingStates[index].stats ? (
										<div className="space-y-2">
											<div className="h-8 bg-gray-200 rounded animate-shimmer-pulse"></div>
											<div className="h-4 bg-gray-200 rounded animate-shimmer-pulse w-20"></div>
										</div>
									) : (
										<>
											<div className="text-2xl font-bold text-gray-900 animate-data-loading">{influencer.followers}</div>
											<div className="text-sm text-gray-500 animate-progressive-reveal animation-delay-100">Followers</div>
										</>
									)}
								</div>
								<div>
									{!contentLoadingStates[index].stats ? (
										<div className="space-y-2">
											<div className="h-8 bg-gray-200 rounded animate-shimmer-pulse"></div>
											<div className="h-4 bg-gray-200 rounded animate-shimmer-pulse w-24"></div>
										</div>
									) : (
										<>
											<div className="text-2xl font-bold text-gray-900 animate-data-loading animation-delay-200">{influencer.engagement}</div>
											<div className="text-sm text-gray-500 animate-progressive-reveal animation-delay-300">Engagement</div>
										</>
									)}
								</div>
							</div>

							{/* Engagement Details with progressive loading */}
							<div className="space-y-2 mb-4">
								{!contentLoadingStates[index].details ? (
									<>
										<div className="flex items-center justify-between">
											<div className="h-4 bg-gray-200 rounded animate-shimmer-pulse w-20"></div>
											<div className="h-4 bg-gray-200 rounded animate-shimmer-pulse w-12"></div>
										</div>
										<div className="flex items-center justify-between">
											<div className="h-4 bg-gray-200 rounded animate-shimmer-pulse w-24"></div>
											<div className="h-4 bg-gray-200 rounded animate-shimmer-pulse w-10"></div>
										</div>
									</>
								) : (
									<>
										<div className="flex items-center justify-between text-sm animate-progressive-reveal">
											<div className="flex items-center text-gray-600">
												<Heart className="w-4 h-4 mr-1" />
												Avg Likes
											</div>
											<span className="font-medium">{influencer.avgLikes}</span>
										</div>
										<div className="flex items-center justify-between text-sm animate-progressive-reveal animation-delay-100">
											<div className="flex items-center text-gray-600">
												<MessageCircle className="w-4 h-4 mr-1" />
												Avg Comments
											</div>
											<span className="font-medium">{influencer.avgComments}</span>
										</div>
									</>
								)}
							</div>

							{/* Demographics with progressive loading */}
							<div className="mb-4">
								{!contentLoadingStates[index].details ? (
									<>
										<div className="h-4 bg-gray-200 rounded animate-shimmer-pulse w-24 mb-2"></div>
										<div className="space-y-1">
											<div className="flex justify-between">
												<div className="h-3 bg-gray-200 rounded animate-shimmer-pulse w-8"></div>
												<div className="h-3 bg-gray-200 rounded animate-shimmer-pulse w-12"></div>
											</div>
											<div className="flex justify-between">
												<div className="h-3 bg-gray-200 rounded animate-shimmer-pulse w-12"></div>
												<div className="h-3 bg-gray-200 rounded animate-shimmer-pulse w-16"></div>
											</div>
											<div className="flex justify-between">
												<div className="h-3 bg-gray-200 rounded animate-shimmer-pulse w-14"></div>
												<div className="h-3 bg-gray-200 rounded animate-shimmer-pulse w-20"></div>
											</div>
										</div>
									</>
								) : (
									<>
										<h4 className="font-semibold text-sm text-gray-900 mb-2 animate-progressive-reveal">Demographics</h4>
										<div className="space-y-1 text-sm text-gray-600">
											<div className="flex justify-between animate-progressive-reveal animation-delay-100">
												<span>Age:</span>
												<span>{influencer.demographics.age}</span>
											</div>
											<div className="flex justify-between animate-progressive-reveal animation-delay-200">
												<span>Gender:</span>
												<span>{influencer.demographics.gender}</span>
											</div>
											<div className="flex justify-between animate-progressive-reveal animation-delay-300">
												<span>Location:</span>
												<span>{influencer.demographics.location}</span>
											</div>
										</div>
									</>
								)}
							</div>

							{/* Content Pillars with progressive loading */}
							<div className="mb-4">
								{!contentLoadingStates[index].details ? (
									<>
										<div className="h-4 bg-gray-200 rounded animate-shimmer-pulse w-28 mb-2"></div>
										<div className="flex flex-wrap gap-1">
											<div className="h-6 bg-gray-200 rounded-full animate-shimmer-pulse w-16"></div>
											<div className="h-6 bg-gray-200 rounded-full animate-shimmer-pulse w-20"></div>
											<div className="h-6 bg-gray-200 rounded-full animate-shimmer-pulse w-14"></div>
										</div>
									</>
								) : (
									<>
										<h4 className="font-semibold text-sm text-gray-900 mb-2 animate-progressive-reveal animation-delay-400">Content Pillars</h4>
										<div className="flex flex-wrap gap-1">
											{influencer.contentPillars.map((pillar, pillarsIndex) => (
												<span
													key={pillarsIndex}
													className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full animate-progressive-reveal"
													style={{ animationDelay: `${500 + pillarsIndex * 100}ms` }}
												>
													{pillar}
												</span>
											))}
										</div>
									</>
								)}
							</div>

							{/* Active Platforms with progressive loading */}
							<div className="mb-4">
								{!contentLoadingStates[index].details ? (
									<>
										<div className="h-4 bg-gray-200 rounded animate-shimmer-pulse w-32 mb-2"></div>
										<div className="flex gap-2">
											<div className="h-6 bg-gray-200 rounded animate-shimmer-pulse w-18"></div>
											<div className="h-6 bg-gray-200 rounded animate-shimmer-pulse w-16"></div>
										</div>
									</>
								) : (
									<>
										<h4 className="font-semibold text-sm text-gray-900 mb-2 animate-progressive-reveal animation-delay-600">Active Platforms</h4>
										<div className="flex gap-2">
											{influencer.activePlatforms.map((platform, platformIndex) => (
												<span
													key={platformIndex}
													className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded animate-progressive-reveal"
													style={{ animationDelay: `${700 + platformIndex * 100}ms` }}
												>
													{platform}
												</span>
											))}
										</div>
									</>
								)}
							</div>

							{/* Performance History with progressive loading */}
							<div className="mb-6">
								{!contentLoadingStates[index].details ? (
									<>
										<div className="h-4 bg-gray-200 rounded animate-shimmer-pulse w-36 mb-2"></div>
										<div className="grid grid-cols-2 gap-2">
											{[...Array(4)].map((_, i) => (
												<div key={i} className="flex justify-between">
													<div className="h-3 bg-gray-200 rounded animate-shimmer-pulse w-16"></div>
													<div className="h-3 bg-gray-200 rounded animate-shimmer-pulse w-8"></div>
												</div>
											))}
										</div>
									</>
								) : (
									<>
										<h4 className="font-semibold text-sm text-gray-900 mb-2 animate-progressive-reveal animation-delay-800">Performance History</h4>
										<div className="grid grid-cols-2 gap-2 text-xs">
											<div className="animate-progressive-reveal animation-delay-900">
												<span className="text-gray-500">Campaigns:</span>
												<span className="ml-1 font-medium">{influencer.performance.campaigns}</span>
											</div>
											<div className="animate-progressive-reveal animation-delay-1000">
												<span className="text-gray-500">Avg Reach:</span>
												<span className="ml-1 font-medium">{influencer.performance.avgReach}</span>
											</div>
											<div className="animate-progressive-reveal animation-delay-1100">
												<span className="text-gray-500">Quality Score:</span>
												<span className="ml-1 font-medium">{influencer.performance.qualityScore}</span>
											</div>
											<div className="animate-progressive-reveal animation-delay-1200">
												<span className="text-gray-500">Conversion:</span>
												<span className="ml-1 font-medium">{influencer.performance.conversion}</span>
											</div>
										</div>
									</>
								)}
							</div>

							{/* View Full Profile Button with enhanced animations */}
							{!contentLoadingStates[index].details ? (
								<div className="h-10 bg-gray-200 rounded-md animate-shimmer-pulse"></div>
							) : (
								<Button className="w-full bg-black hover:bg-gray-800 text-white py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-all duration-700 hover:scale-105 hover:shadow-xl hover:-translate-y-2 animate-progressive-reveal animation-delay-1300 group hover:bg-gradient-to-r hover:from-gray-800 hover:to-black">
									View Full Profile
									<ExternalLink className="w-4 h-4 transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12" />
								</Button>
							)}
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
