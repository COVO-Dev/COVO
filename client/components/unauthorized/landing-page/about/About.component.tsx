"use client";
import AboutBox from "./about-box/AboutBox.component";
import { AboutArray, limelight, roboto } from "./about.data";
import { useScrollAnimation, useStaggeredAnimation } from "@/hooks/useScrollAnimation";

export default function About() {
	const { elementRef: headerRef, isVisible: headerVisible, hasTriggered: headerTriggered } = useScrollAnimation({ triggerOnce: true });
	const { elementRef: gridRef, visibleItems, hasTriggered: gridTriggered } = useStaggeredAnimation(AboutArray.length, 150);
	const { elementRef: ctaRef, isVisible: ctaVisible, hasTriggered: ctaTriggered } = useScrollAnimation({ triggerOnce: true });
	return (
		<section className="py-20 bg-gray-50 overflow-hidden">
			<div className="container mx-auto px-4">
				{/* Section header with one-time scroll animation */}
				<div ref={headerRef} className={`text-center mb-16 transition-all duration-1000 ${headerTriggered ? 'animate-fade-in-up opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
					<h2 className={`text-4xl lg:text-5xl font-bold text-gray-900 mb-6 ${headerTriggered ? 'animate-slide-up animation-delay-200' : ''}`}>
						Find Your Perfect Match with{" "}
						<span className={`text-blue-600 ${limelight.className} ${headerTriggered ? 'animate-bounce-in animation-delay-400' : ''}`}>COVO</span>
					</h2>
					<p className={`text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed ${headerTriggered ? 'animate-fade-in-up animation-delay-600' : ''}`}>
						Connect with top brands and unlock exciting opportunities. Our platform makes influencer marketing seamless and profitable for everyone.
					</p>
				</div>

				{/* Features grid with one-time staggered animations */}
				<div ref={gridRef} className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
					{AboutArray.map((about, index) => {
						return (
							<div
								key={about.id}
								className={`transition-all duration-800 ${
									visibleItems[index] ? 'animate-card-flip opacity-100' : 'opacity-0'
								}`}
								style={{ animationDelay: `${index * 150}ms` }}
							>
								<AboutBox
									imageURL={about.imageURL}
									title={about.title}
									text={about.text}
									className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-500 p-8 text-center group hover:-translate-y-4 hover-lift gpu-accelerated ${roboto.className}`}
								/>
							</div>
						);
					})}
				</div>

				{/* Call to action with one-time enhanced animations */}
				<div ref={ctaRef} className={`text-center mt-16 transition-all duration-1000 ${ctaTriggered ? 'animate-scale-in opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
					<div className="bg-blue-600 rounded-2xl p-8 lg:p-12 text-white hover:bg-blue-700 transition-all duration-500 hover:scale-105 hover:shadow-2xl animate-pulse-glow">
						<h3 className={`text-3xl lg:text-4xl font-bold mb-4 ${ctaTriggered ? 'animate-slide-up animation-delay-200' : ''}`}>
							Ready to get started?
						</h3>
						<p className={`text-xl mb-8 opacity-90 ${ctaTriggered ? 'animate-fade-in-up animation-delay-400' : ''}`}>
							Join thousands of creators and brands already using COVO
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<button className={`px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 hover:scale-110 hover:-translate-y-1 transition-all duration-500 group ${ctaTriggered ? 'animate-slide-in-left animation-delay-600' : ''}`}>
								Start as Creator
								<span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
							</button>
							<button className={`px-8 py-4 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 hover:scale-110 hover:-translate-y-1 transition-all duration-500 group ${ctaTriggered ? 'animate-slide-in-right animation-delay-600' : ''}`}>
								Start as Brand
								<span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
							</button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
