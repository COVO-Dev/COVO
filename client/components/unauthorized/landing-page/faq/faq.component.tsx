import GeneralButton from "./faq-buttons/general/General.button";
import ForBrandsButton from "./faq-buttons/for-brands/ForBrands.button";
import ForAgenciesButton from "./faq-buttons/for-agencies/ForAgencies.button";
import ForInfluencersButton from "./faq-buttons/for-influencers/ForInfluencers.button";
import TechnicalSupportButton from "./faq-buttons/technical-support/TechnicalSupport.button";
import { limelight } from "./faq.data";
import Link from "next/link";

export default function Faq() {
  return (
    <section className="py-20 bg-white relative">
     
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/20 via-transparent to-gray-50/10 pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
       
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-black mb-6 tracking-tight">
            Everything You Need to Know About{" "}
            <span className="text-black font-bold">COVO</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
            COVO is a platform that connects brands with influencers. It simplifies influencer marketing by offering
            AI-powered matching, campaign management, and analytics. Brands can find suitable influencers, while
            influencers can connect with brands and manage campaigns efficiently. COVO provides features like secure
            payments, performance tracking, and support.
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="lg:col-span-3 flex justify-center">
            <GeneralButton />
          </div>
          <ForBrandsButton />
          <ForAgenciesButton />
          <ForInfluencersButton />
          <div className="md:col-span-2 lg:col-span-1 flex justify-center">
            <TechnicalSupportButton />
          </div>
        </div>

        {/* Bottom section */}
        <div className="text-center mt-16">
          <div className="bg-white backdrop-blur-xl border border-gray-100 rounded-2xl p-8 max-w-2xl mx-auto shadow-2xl shadow-gray-900/10 relative">
            {/* Subtle gradient overlay for visual depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-50/20 via-transparent to-gray-50/10 pointer-events-none rounded-2xl"></div>

            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-black mb-4 tracking-tight">
                Still have questions?
              </h3>
              <p className="text-gray-600 mb-6 text-lg">
                Our support team is here to help you get the most out of COVO.
              </p>
              <Link 
                href="/contact-us"
                className="inline-block px-8 py-4 bg-black hover:bg-gray-800 text-white font-medium rounded-xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}