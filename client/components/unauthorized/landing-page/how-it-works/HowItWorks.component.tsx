"use client";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useEffect, useRef, useState } from "react";

const steps = [
	{
		id: 1,
		number: "1",
		title: "Create Your Profile",
		description: "Sign up and complete your profile with your goals, preferences, and requirements. Our system learns what makes a perfect match for you."
	},
	{
		id: 2,
		number: "2",
		title: "Get Matched",
		description: "Our intelligent algorithm analyzes thousands of data points to present you with highly compatible collaboration opportunities."
	},
	{
		id: 3,
		number: "3",
		title: "Collaborate & Succeed",
		description: "Connect directly with your matches, negotiate terms, and execute successful campaigns with our built-in project management tools."
	}
];

export default function HowItWorks() {
	// Scroll animations for different sections
	const { elementRef: headerRef, hasTriggered: headerTriggered } = useScrollAnimation({
		threshold: 0.1,
		triggerOnce: true
	});

	// Custom animation state for steps
	const stepsRef = useRef<HTMLDivElement>(null);
	const [stepsVisible, setStepsVisible] = useState(false);

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setStepsVisible(true);
				}
			},
			{ threshold: 0.1 }
		);

		if (stepsRef.current) {
			observer.observe(stepsRef.current);
		}

		return () => {
			if (stepsRef.current) {
				observer.unobserve(stepsRef.current);
			}
		};
	}, []);

	return (
		<section className="py-24 bg-white">
			<div className="container mx-auto px-4">
				{/* Section header with scroll-triggered animations */}
				<div ref={headerRef as any} className={`text-center mb-20 transition-all duration-1000 ${headerTriggered ? 'animate-fade-in-up opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
					<h2 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-6 ${headerTriggered ? 'animate-slide-up animation-delay-200' : ''}`}>
						How COVO Works
					</h2>
					<p className={`text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed ${headerTriggered ? 'animate-fade-in-up animation-delay-600' : ''}`}>
						Get started in minutes with our streamlined process designed for both brands and influencers.
					</p>
				</div>

				{/* Steps with reliable animations */}
				<div ref={stepsRef} className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-20 max-w-7xl mx-auto">
					{steps.map((step, index) => (
						<div
							key={step.id}
							className={`text-center transition-all duration-800 ${
								stepsVisible ? 'animate-card-flip opacity-100' : 'opacity-100'
							}`}
							style={{
								animationDelay: stepsVisible ? `${index * 300}ms` : '0ms',
								transform: stepsVisible ? 'translateY(0)' : 'translateY(20px)'
							}}
						>
							{/* Step number circle */}
							<div className="mb-10">
								<div className="w-24 h-24 mx-auto bg-black rounded-full flex items-center justify-center transition-all duration-500 hover:scale-110 hover:shadow-lg">
									<span className="text-3xl font-bold text-white">
										{step.number}
									</span>
								</div>
							</div>

							{/* Step content */}
							<div className="space-y-6">
								<h3 className="text-2xl font-bold text-black">
									{step.title}
								</h3>
								<p className="text-gray-600 leading-relaxed text-lg max-w-xs mx-auto">
									{step.description}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
