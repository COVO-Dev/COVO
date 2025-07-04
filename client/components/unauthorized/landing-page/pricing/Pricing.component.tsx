"use client";
import { useScrollAnimation, useStaggeredAnimation } from "@/hooks/useScrollAnimation";
import { pricingPlans } from "./pricing.data";

export default function Pricing() {
	// Scroll animations for different sections
	const { elementRef: headerRef, hasTriggered: headerTriggered } = useScrollAnimation({
		threshold: 0.1,
		triggerOnce: true
	});

	const { elementRef: cardsRef, visibleItems } = useStaggeredAnimation(
		pricingPlans.length,
		200
	);

	return (
		<section className="py-24 bg-white">
			<div className="container mx-auto px-4">
				{/* Section header with scroll-triggered animations */}
				<div ref={headerRef as any} className={`text-center mb-20 transition-all duration-1000 ${headerTriggered ? 'animate-fade-in-up opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
					<h2 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-6 ${headerTriggered ? 'animate-slide-up animation-delay-200' : ''}`}>
						Creator Subscription Tiers
					</h2>
					<p className={`text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed ${headerTriggered ? 'animate-fade-in-up animation-delay-600' : ''}`}>
						Choose the plan that works best for your creator journey. Unlock more opportunities as you grow.
					</p>
				</div>

				{/* Pricing cards with staggered animations */}
				<div ref={cardsRef as any} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-6xl mx-auto">
					{pricingPlans.map((plan, index) => (
						<div
							key={plan.id}
							className={`relative bg-white border border-gray-200 rounded-xl p-6 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 hover:scale-105 ${
								plan.popular ? 'ring-2 ring-black shadow-lg' : 'hover:border-gray-300'
							} ${
								visibleItems[index] ? 'animate-card-flip opacity-100' : 'opacity-100'
							}`}
							style={{ animationDelay: `${index * 200}ms` }}
						>
							{/* Most Popular Badge */}
							{plan.popular && (
								<div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
									<span className="bg-black text-white px-4 py-1 rounded-full text-sm font-medium">
										Most Popular
									</span>
								</div>
							)}

							{/* Plan Type Label */}
							<div className="text-center mb-3">
								<span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
									{plan.planType}
								</span>
							</div>

							{/* Plan Name */}
							<h3 className="text-xl font-bold text-black text-center mb-6">
								{plan.name}
							</h3>

							{/* Price */}
							<div className="text-center mb-2">
								<span className="text-3xl font-bold text-black">
									{plan.price}
								</span>
								{plan.duration && (
									<span className="text-gray-600 text-base">{plan.duration}</span>
								)}
							</div>

							{/* Description */}
							<p className="text-gray-500 text-center mb-8 text-sm">
								{plan.description}
							</p>

							{/* Features */}
							<ul className="space-y-3 mb-8">
								{plan.features.map((feature, featureIndex) => (
									<li key={featureIndex} className="flex items-start">
										<svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
										</svg>
										<span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
									</li>
								))}
							</ul>

							{/* CTA Button */}
							<button className="w-full py-3 px-6 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors duration-300">
								{plan.buttonText}
							</button>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
