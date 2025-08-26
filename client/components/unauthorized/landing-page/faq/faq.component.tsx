import GeneralButton from "./faq-buttons/general/General.button";
import ForBrandsButton from "./faq-buttons/for-brands/ForBrands.button";
import ForAgenciesButton from "./faq-buttons/for-agencies/ForAgencies.button";
import ForInfluencersButton from "./faq-buttons/for-influencers/ForInfluencers.button";
import TechnicalSupportButton from "./faq-buttons/technical-support/TechnicalSupport.button";
import { limelight } from "./faq.data";



export default function Faq() {
  return (
    <section className="flex flex-col justify-center items-center w-full h-full bg-custom-light-grayish-blue2 py-9 px-4">
			<div className="flex flex-col gap-2 justify-center items-center">
				<p className="text-5xl text-center uppercase text-custom-dark-desaturated-blue">{" "}Frequently Asked Questions About{" "}<strong className={`${limelight.className}`}>COVO</strong>{" "}</p>
				<p className="text-1xl font-[400] text-custom-dark-desaturated-blue text-center max-w-[800px]">COVO is a platform that connects brands with influencers. It simplifies influencer marketing by offering AI-powered matching, campaign management, and analytics. Brands can find suitable influencers, while influencers can connect with brands and manage campaigns efficiently. COVO provides features like secure payments, performance tracking, and support.</p>
			</div>
			<br />
      <div className="flex flex-wrap gap-2 justify-center items-center max-w-[900px] h-auto">
        <GeneralButton />
        <ForBrandsButton />
        <ForAgenciesButton />
        <ForInfluencersButton />
        <TechnicalSupportButton />
      </div>
		</section>
  );
}