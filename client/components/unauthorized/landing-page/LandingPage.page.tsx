"use client";
import Hero from "./hero/Hero.component";
import HowItWorks from "./how-it-works/HowItWorks.component";
import Demo from "./demo/Demo.component";
import About from "./about/About.component";
import Benefits from "./benefits/Benefits.component";
import Price from "./price/Price.component";
import Pricing from "./pricing/Pricing.component";
import Features from "./features/features.component";
import Faq from "./faq/faq.component";
import { useParallax } from "@/hooks/useScrollAnimation";
import { useEffect, useState } from "react";

export default function LandingPagePage() {
	const { elementRef: parallaxRef, offset } = useParallax(0.3);
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		setIsLoaded(true);
	}, []);

	return (
		<div className="relative">
			{/* Parallax background elements */}
			<div
				ref={parallaxRef}
				className="fixed inset-0 pointer-events-none z-0 opacity-20"
				style={{ transform: `translateY(${offset}px)` }}
			>
				<div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 rounded-full blur-xl animate-float"></div>
				<div className="absolute top-40 right-20 w-24 h-24 bg-purple-200 rounded-full blur-lg animate-float animation-delay-500"></div>
				<div className="absolute bottom-40 left-1/4 w-40 h-40 bg-pink-200 rounded-full blur-2xl animate-float animation-delay-1000"></div>
			</div>

			<div className={`bg-custom-light-grayish-blue2 relative z-10 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
				<section id="home">
					<Hero />
				</section>
				
				<section id="demo">
					<Demo />
				</section>
				<section id="how-it-works">
					<HowItWorks />
				</section>

				<section id="pricing">
					<Pricing />
				</section>

				{/* <section id="about">
					<About />
				</section>
				<section id="benefits">
					<Benefits />
				</section>
				<section id="features">
					<Features />
				</section>
				<section id="faq">
					<Faq />
				</section> */}
				<br />
			</div>
		</div>
	);
}
