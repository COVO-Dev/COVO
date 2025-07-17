"use client";
import Image from "next/image";
import { cardInformation } from "./Benefits.data";
import { useScrollAnimation, useStaggeredAnimation } from "@/hooks/useScrollAnimation";
import { Limelight } from "next/font/google";

const limelight = Limelight({
	subsets: ["latin"],
	weight: "400"
});

export default function Benefits() {
	// Scroll animations for different sections
	const { elementRef: headerRef, isVisible: headerVisible, hasTriggered: headerTriggered } = useScrollAnimation({
		threshold: 0.1,
		triggerOnce: true
	});

	const { elementRef: gridRef, visibleItems, hasTriggered: gridTriggered } = useStaggeredAnimation(
		cardInformation.length,
		200
	);

	const { elementRef: ctaRef, isVisible: ctaVisible, hasTriggered: ctaTriggered } = useScrollAnimation({
		threshold: 0.1,
		triggerOnce: true
	});

	return (
		<section className="py-20 bg-white">
			<div className="container mx-auto px-4">
				{/* Section header with scroll-triggered animations */}
				<div ref={headerRef} className={`text-center mb-16 transition-all duration-1000 ${headerTriggered ? 'animate-fade-in-up opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
					<h2 className={`text-4xl lg:text-5xl font-bold text-gray-900 mb-6 ${headerTriggered ? 'animate-slide-up animation-delay-200' : ''}`}>
						Why Choose{" "}
						<span className={`text-blue-600 ${limelight.className} ${headerTriggered ? 'animate-bounce-in animation-delay-400' : ''}`}>COVO</span>?
					</h2>
					<p className={`text-2xl lg:text-3xl font-semibold text-blue-600 mb-4 ${headerTriggered ? 'animate-fade-in-up animation-delay-600' : ''}`}>
						One Platform — Cost-Effective Influencer Marketing
					</p>
					<p className={`text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed ${headerTriggered ? 'animate-fade-in-up animation-delay-800' : ''}`}>
						Simplify your influencer marketing with our all-in-one platform, offering cost-effective solutions
						while streamlining your influencer marketing efforts and maximizing ROI with our affordable platform.
					</p>
				</div>

				{/* Benefits grid with staggered animations */}
				<div ref={gridRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
					{cardInformation.map((cardObject, index) => (
						<div
							key={cardObject.id}
							className={`bg-gray-50 hover:bg-white rounded-2xl p-8 text-center group hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 hover:scale-105 border border-gray-100 gpu-accelerated ${
								visibleItems[index] ? 'animate-card-flip opacity-100' : 'opacity-0'
							}`}
							style={{ animationDelay: `${index * 200}ms` }}
						>
							{/* Enhanced Icon with animations */}
							<div className="mb-6">
								<div className="w-20 h-20 mx-auto bg-blue-100 rounded-2xl flex items-center justify-center group-hover:bg-blue-200 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 group-hover:shadow-lg">
									<Image
										src={cardObject.url}
										alt={cardObject.text}
										width={40}
										height={40}
										className="w-10 h-10 group-hover:scale-110 transition-transform duration-300"
									/>
								</div>
							</div>

							{/* Enhanced Content with animations */}
							<div className="space-y-4">
								<h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-all duration-300 group-hover:scale-105">
									{cardObject.text}
								</h3>
								<p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
									{cardObject.supText}
								</p>
							</div>
						</div>
					))}
				</div>

				{/* Enhanced Bottom CTA with scroll animation */}
				<div ref={ctaRef} className={`text-center mt-16 transition-all duration-1000 ${ctaTriggered ? 'animate-scale-in opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
					<div className={`inline-flex items-center space-x-2 bg-blue-50 px-6 py-3 rounded-full hover:bg-blue-100 hover:scale-105 transition-all duration-300 hover:shadow-lg ${ctaTriggered ? 'animate-bounce-in animation-delay-400' : ''}`}>
						<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
						<span className="text-blue-700 font-medium">Trusted by 750+ brands and creators worldwide</span>
					</div>
				</div>
			</div>
		</section>
	);
}
