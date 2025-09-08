"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ReactTyped } from "react-typed";
import Rectangle from "@/assets/images/Rectangle.png";

export default function Hero() {
	return (
		<div className='bg-[url("/svg/BG.svg")] bg-no-repeat bg-cover w-full md:h-[700px] flex flex-wrap pb-9'>
			{/* Text Section */}
			<div className="order-2 md:order-1 md:w-1/2 md:h-full h-1/2 flex justify-center items-center">
				<div className="flex flex-col justify-center h-1/2 w-[70%] text-custom-dark-desaturated-blue">
					<p className="text-4xl font-[900] subpixel-antialiased">
						The easiest way to work with global brands and influencers
					</p>
					<p className="text-2xl subpixel-antialiased font-[400]">
						Join our growing community of{" "}
						<ReactTyped
							className="text-custom-lark-blue"
							strings={["500+ creators", "250+ brands"]}
							typeSpeed={50}
							backSpeed={30}
							backDelay={1500}
							loop={true}
							showCursor={true}
							cursorChar="|"
						/>
					</p>

					<Button className="w-[200px] h-[50px] mt-4 bg-custom-lark-blue hover:bg-custom-dark-desaturated-blue text-lg font-[500]">
						Start 7 day free trial
					</Button>
				</div>
			</div>

			{/* Image Section */}
			<div className="order-1 md:order-2 md:w-1/2 md:h-full h-1/2 flex justify-center items-center">
				<Image src={Rectangle} width={600} height={600} alt="Rectangle" />
			</div>
		</div>
	);
}
