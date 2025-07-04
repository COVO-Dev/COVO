import GeneralButton from "./faq-buttons/general/General.button";
import ForBrandsButton from "./faq-buttons/for-brands/ForBrands.button";
import ForAgenciesButton from "./faq-buttons/for-agencies/ForAgencies.button";
import ForInfluencersButton from "./faq-buttons/for-influencers/ForInfluencers.button";
import TechnicalSupportButton from "./faq-buttons/technical-support/TechnicalSupport.button";
import { limelight } from "./faq.data";

export default function Faq() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions About{" "}
            <span className={`text-blue-600 ${limelight.className}`}>COVO</span>
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
          <div className="bg-gray-50 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Still have questions?
            </h3>
            <p className="text-gray-600 mb-6">
              Our support team is here to help you get the most out of COVO.
            </p>
            <button className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-300">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}