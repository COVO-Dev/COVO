"use client";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import Link from "next/link";

export default function Hero() {
	const trustedCompanies = [
		{ id: 1, name: "Dis-Chem" },
		{ id: 2, name: "Woolworths Beauty" },
		{ id: 3, name: "Foschini" },
		{ id: 4, name: "Edgars" },
		{ id: 5, name: "Truworths" },
		{ id: 6, name: "Superbalist" },
		{ id: 7, name: "Zando" },
		{ id: 8, name: "Spree" },
		{ id: 9, name: "Dis-Chem" },
	];

	const { elementRef: heroRef, isVisible: heroVisible, hasTriggered: heroTriggered } = useScrollAnimation({
		threshold: 0.1,
		triggerOnce: true
	});

	// Typing animation state
	const [displayedText, setDisplayedText] = useState("");
	const [isScrollPaused, setIsScrollPaused] = useState(false);
	const [typingStarted, setTypingStarted] = useState(false);
	const fullText = "Where influencers and brands get work done";


	useEffect(() => {
		if (heroVisible && !typingStarted) {
			setTypingStarted(true);
			let currentIndex = 0;
			const typingInterval = setInterval(() => {
				if (currentIndex <= fullText.length) {
					setDisplayedText(fullText.slice(0, currentIndex));
					currentIndex++;
				} else {
					clearInterval(typingInterval);
				}
			}, 80);

			return () => clearInterval(typingInterval);
		}
	}, [heroVisible, typingStarted, fullText]);

	
	const handleCompanyHover = (isHovered: boolean) => {
		setIsScrollPaused(isHovered);
	};

	return (
		<>
			{/* Hero Section */}
			<section ref={heroRef} className="pt-20 sm:pt-24 lg:pt-28 pb-16 sm:pb-20 lg:pb-24 bg-white">
				<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center">
						{/* Main heading with scroll-triggered typing animation */}
						<h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-black mb-6 sm:mb-8 leading-tight tracking-tight ${heroTriggered ? 'animate-fade-in-up' : ''}`}>
							{displayedText || "Where influencers and brands get work done"}
							{typingStarted && displayedText.length < fullText.length && (
								<span className="animate-pulse">|</span>
							)}
						</h1>

						{/* Subheading */}
						<p className={`text-base sm:text-lg md:text-xl lg:text-xl text-gray-600 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed px-2 ${heroTriggered ? 'animate-fade-in-up animation-delay-200' : ''}`}>
							COVO uses advanced matching algorithms to connect brands with the perfect influencers. See exactly who you're working with before you commit.
						</p>

						{/* CTA Buttons with scroll-triggered animations */}
						<div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-10 px-4 ${heroTriggered ? 'animate-fade-in-up animation-delay-400' : ''}`}>
							
							<Link href="/signup">
							<Button
								className={`bg-black hover:bg-gray-800 text-white px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-medium rounded-md flex items-center justify-center gap-2 transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:-translate-y-1 w-full sm:w-auto min-w-[200px] group ${heroTriggered ? 'animate-float' : ''}`}
							>
								Sign up as a Brand
								<ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-2 group-hover:scale-110" />
							</Button>
							</Link>
							
							<Link href="/signup?type=influencer">
								<Button
									variant="outline"
									className={`border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-medium rounded-md flex items-center justify-center gap-2 transition-all duration-500 hover:scale-110 hover:shadow-xl hover:-translate-y-1 w-full sm:w-auto min-w-[200px] group ${heroTriggered ? 'animate-float animation-delay-200' : ''}`}
								>
									Sign up as an Influencer
									<ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-2 group-hover:scale-110" />
								</Button>
							</Link>
						</div>

						
					</div>
				</div>
			</section>

								{/* Trusted By Section */}

			<section className="pt-6 pb-8 bg-gray-50">
						<div className={heroTriggered ? "animate-fade-in-up animation-delay-600" : ""}>
							{/* Trusted By heading */}
							<div className="text-center mb-8">
								<h2 className={`text-2xl font-bold text-gray-900 ${heroTriggered ? 'animate-slide-up' : ''}`}>
									Trusted By
								</h2>
							</div>
						</div>
				<div className="relative w-full overflow-hidden">
					<div className={`flex transition-all duration-1000 ease-in-out ${isScrollPaused ? 'animate-scroll-paused' : 'animate-scroll-smooth'}`}>
						{/* First set of company names */}
						<div className="flex min-w-full justify-around items-center py-4">
							{trustedCompanies.map((company) => (
								<div
									key={company.id}
									className="flex-shrink-0 mx-6 sm:mx-8 lg:mx-12"
									onMouseEnter={() => handleCompanyHover(true)}
									onMouseLeave={() => handleCompanyHover(false)}
								>
									<span className="text-sm sm:text-base md:text-lg font-medium text-gray-600 hover:text-gray-900 hover:scale-110 transition-all duration-500 whitespace-nowrap cursor-pointer hover:font-semibold">
										{company.name}
									</span>
								</div>
							))}
						</div>
						{/* Duplicate set for seamless loop */}
						<div className="flex min-w-full justify-around items-center py-4">
							{trustedCompanies.map((company) => (
								<div
									key={`dup-${company.id}`}
									className="flex-shrink-0 mx-6 sm:mx-8 lg:mx-12"
									onMouseEnter={() => handleCompanyHover(true)}
									onMouseLeave={() => handleCompanyHover(false)}
								>
									<span className="text-sm sm:text-base md:text-lg font-medium text-gray-600 hover:text-gray-900 hover:scale-110 transition-all duration-500 whitespace-nowrap cursor-pointer hover:font-semibold">
										{company.name}
									</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>
		</>
	);
}
