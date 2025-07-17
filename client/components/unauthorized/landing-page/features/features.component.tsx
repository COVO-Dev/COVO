import Image from "next/image";
import { cardInformation } from "./features.data";

export default function Features() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Powerful Features
          </h2>
          <p className="text-2xl lg:text-3xl font-semibold text-blue-600 mb-4">
            Find Your Perfect Influencer Match
          </p>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Seamlessly discover and collaborate with influencers who align with your brand's goals using our advanced technology.
          </p>
        </div>

        {/* Features list */}
        <div className="max-w-4xl mx-auto space-y-12">
          {cardInformation.map((cardObject, index) => (
            <div
              key={cardObject.id}
              className={`flex flex-col lg:flex-row items-center gap-8 lg:gap-12 ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Image */}
              <div className="flex-shrink-0">
                <div className="w-64 h-64 bg-white rounded-2xl shadow-lg flex items-center justify-center p-8">
                  <Image
                    src={cardObject.url}
                    alt={cardObject.text}
                    width={200}
                    height={200}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 text-center lg:text-left">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  {cardObject.text}
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {cardObject.supText}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom section */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to experience these features?
            </h3>
            <p className="text-gray-600 mb-6">
              Start your free trial today and see how COVO can transform your influencer marketing.
            </p>
            <button className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-300">
              Get Started Free
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}