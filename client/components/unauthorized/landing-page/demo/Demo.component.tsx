"use client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Eye, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function Demo() {
	const sectionRef = useRef<HTMLElement>(null);
	const [hasTriggered, setHasTriggered] = useState(false);

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && !hasTriggered) {
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

	return (
		<section ref={sectionRef} id="demo" className="py-16 sm:py-20 lg:py-24 bg-white overflow-hidden">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Section Header with one-time scroll animations */}
				<div className={`text-center mb-12 sm:mb-16 transition-all duration-1000 ${hasTriggered ? 'animate-fade-in-up opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
					<h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-4 sm:mb-6 ${hasTriggered ? 'animate-slide-up animation-delay-200' : ''}`}>
						Explore Different Perspectives
					</h2>
					<p className={`text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed ${hasTriggered ? 'animate-fade-in-up animation-delay-400' : ''}`}>
						Discover how our platform looks from both sides of the collaboration.
						See detailed insights and opportunities from different viewpoints.
					</p>
				</div>

				{/* Two Button Layout */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
					{/* See What Brands See Button */}
					<div className={`transition-all duration-1000 ${hasTriggered ? 'animate-fade-in-up animation-delay-600' : 'opacity-0 translate-y-10'}`}>
						<Link href="/see-what-brands-see">
							<div className="group bg-white border-2 border-gray-200 hover:border-black rounded-2xl p-8 lg:p-10 transition-all duration-500 hover:shadow-2xl hover:shadow-gray-900/10 hover:scale-[1.02] hover:-translate-y-2 cursor-pointer relative overflow-hidden">
								{/* Subtle gradient overlay for glassmorphism effect */}
								<div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 via-white/30 to-gray-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

								<div className="relative z-10 text-center">
									{/* Icon */}
									<div className="w-16 h-16 lg:w-20 lg:h-20 bg-black group-hover:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
										<Eye className="w-8 h-8 lg:w-10 lg:h-10 text-white transition-transform duration-500 group-hover:scale-110" />
									</div>

									{/* Title */}
									<h3 className="text-2xl lg:text-3xl font-bold text-black mb-4 group-hover:text-gray-900 transition-colors duration-300">
										See What Brands See
									</h3>

									{/* Description */}
									<p className="text-gray-600 text-base lg:text-lg leading-relaxed mb-8">
										Get detailed insights into every influencer before you collaborate.
										View comprehensive analytics, demographics, and performance metrics.
									</p>

									{/* CTA Button */}
									<Button className="bg-black hover:bg-gray-800 text-white px-8 py-4 text-base font-medium rounded-xl flex items-center justify-center gap-3 transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:-translate-y-1 w-full group/btn">
										Explore Brand View
										<ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover/btn:translate-x-2 group-hover/btn:scale-110" />
									</Button>
								</div>
							</div>
						</Link>
					</div>

					{/* See What Influencers See Button */}
					<div className={`transition-all duration-1000 ${hasTriggered ? 'animate-fade-in-up animation-delay-800' : 'opacity-0 translate-y-10'}`}>
						<Link href="/see-what-influencers-see">
							<div className="group bg-white border-2 border-gray-200 hover:border-black rounded-2xl p-8 lg:p-10 transition-all duration-500 hover:shadow-2xl hover:shadow-gray-900/10 hover:scale-[1.02] hover:-translate-y-2 cursor-pointer relative overflow-hidden">
								{/* Subtle gradient overlay for glassmorphism effect */}
								<div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 via-white/30 to-gray-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

								<div className="relative z-10 text-center">
									{/* Icon */}
									<div className="w-16 h-16 lg:w-20 lg:h-20 bg-black group-hover:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
										<Users className="w-8 h-8 lg:w-10 lg:h-10 text-white transition-transform duration-500 group-hover:scale-110" />
									</div>

									{/* Title */}
									<h3 className="text-2xl lg:text-3xl font-bold text-black mb-4 group-hover:text-gray-900 transition-colors duration-300">
										See What Influencers See
									</h3>

									{/* Description */}
									<p className="text-gray-600 text-base lg:text-lg leading-relaxed mb-8">
										Discover how brands appear from an influencer's perspective.
										Explore campaign opportunities, brand profiles, and collaboration details.
									</p>

									{/* CTA Button */}
									<Button className="bg-black hover:bg-gray-800 text-white px-8 py-4 text-base font-medium rounded-xl flex items-center justify-center gap-3 transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:-translate-y-1 w-full group/btn">
										Explore Influencer View
										<ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover/btn:translate-x-2 group-hover/btn:scale-110" />
									</Button>
								</div>
							</div>
						</Link>
					</div>
				</div>

				{/* Subtle parallax background elements */}
				<div className="absolute inset-0 pointer-events-none opacity-5">
					<div className="absolute top-20 left-10 w-32 h-32 bg-blue-300 rounded-full blur-xl animate-float animation-delay-300"></div>
					<div className="absolute bottom-20 right-10 w-24 h-24 bg-purple-300 rounded-full blur-lg animate-float animation-delay-700"></div>
				</div>
			</div>
		</section>
	);
}