import PriceCard from "./price-card/priceCard";

export default function Price() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Plans & Pricing
          </h2>
          <p className="text-2xl lg:text-3xl font-semibold text-blue-600 mb-4">
            Choose a Plan That Works for You
          </p>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Start your influencer marketing journey with our flexible pricing plans designed to scale with your business.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="flex justify-center">
          <PriceCard />
        </div>

        {/* Bottom section */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Need a custom solution?
            </h3>
            <p className="text-gray-600 mb-6">
              Contact our sales team for enterprise pricing and custom features tailored to your business needs.
            </p>
            <button className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-300">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}