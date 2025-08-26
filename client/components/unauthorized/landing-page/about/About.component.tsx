import AboutBox from "./about-box/AboutBox.component";
import { AboutArray, limelight, roboto } from "./about.data";

export default function About() {
	return (
		<section className="flex flex-col w-full h-full bg-custom-light-grayish-blue2 py-9 px-4">
			<div className="grid gap-2">
				<p className="text-5xl text-center uppercase text-custom-dark-desaturated-blue">{" "}FIND YOUR PERFECT MATCH WITH {" "}<strong className={`${limelight.className}`}>COVO</strong>{" "}</p>
				<p className="text-1xl font-[600] text-custom-dark-desaturated-blue text-center">Connect With Top Brands & Unlock Exciting Opportunities.</p>
			</div>
			<br />
			<div className="flex flex-wrap gap-2 justify-center items-center">
				{AboutArray.map((about) => {
					return (
						<AboutBox
							key={about.id}
							imageURL={about.imageURL}
							title={about.title}
							text={about.text}
							className={`bg-white w-[400px] h-[400px] rounded-lg border-custom-light-grayish-blue border-2 flex flex-col justify-center items-center p-4
                          bg-[url("/svg/BG.svg")]
                          ${roboto.className} px-[1.5em] py-[1em]`}
						/>
					);
				})}
			</div>
		</section>
	);
}
