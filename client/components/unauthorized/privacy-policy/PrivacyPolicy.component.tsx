"use client";
import Image from "next/image";
import COVO_LOGOGRAM_BLACK from "@/assets/images/COVO_LOGOGRAM_BLACK.png";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
     
      
      <main className="min-h-screen flex items-start justify-center p-6 pt-18 relative overflow-hidden bg-white">
        {/* Background gradient overlay matching authentication pages */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 opacity-60"></div>

        {/* Main container with authentication page styling */}
        <div className='bg-white backdrop-blur-xl border border-gray-100 p-8 sm:p-10 lg:p-12 rounded-2xl shadow-2xl shadow-gray-900/10 z-40 w-[95%] max-w-6xl relative my-8'>
          {/* Subtle gradient overlay for visual depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50/20 via-transparent to-gray-50/10 pointer-events-none rounded-2xl"></div>

          {/* Header Section */}
          <div className="text-center mb-12 relative z-10">
            {/* COVO Logo */}
            <div className="flex justify-center mb-8">
              <div className='w-[120px] h-[120px] flex items-center justify-center'>
                <Image src={COVO_LOGOGRAM_BLACK} alt="COVO Logo" width={120} height={120} />
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold text-black mb-4 tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-gray-600 text-lg mb-4">
              This Privacy Policy sets forth the terms under which COVO collects, processes, stores, and discloses personal and non-personal information of its users, in strict compliance with the Protection of Personal Information Act (POPIA) and any other applicable data protection legislation.
            </p>
            <p className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Content Container with scroll */}
          <div className="relative z-10 max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar">
            
            {/* Important Notice */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Important Notice</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      By accessing or using the COVO platform, users consent to the practices described herein. This policy
                      ensures compliance with the Protection of Personal Information Act (POPIA) and other applicable data
                      protection legislation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 1: Collection of Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-black mb-4">Collection of Information</h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                We collect and process the following categories of information:
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-black rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>
                    <strong>Personal Information:</strong> This includes, but is not limited to, your full name, email
                    address, phone number, and any other information you voluntarily provide during the registration
                    process or while using the Platform.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-black rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>
                    <strong>Organisational and Contact Information:</strong> For brands, we collect information related
                    to your organisation, including decision-maker contact details, brand information, and business roles.
                    For influencers, we collect social media profiles, public information, and relevant data related to
                    your professional identity.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-black rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>
                    <strong>Usage Data:</strong> We automatically collect technical information such as your IP address,
                    browser type, operating system, and details of your interactions with the Platform (e.g., pages visited,
                    features used).
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-black rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>
                    <strong>Campaign and Influencer Analytics:</strong> We collect and process data related to campaign
                    performance, influencer engagement, and metrics such as reach, audience demographics, and engagement rates.
                  </div>
                </li>
              </ul>
            </section>

            {/* Section 2: Purpose of Processing */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-black mb-4">Purpose of Processing</h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                The information collected is processed for the following purposes:
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-black rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>
                    <strong>Platform Functionality:</strong> To provide services, such as facilitating connections between
                    influencers and brands, managing profiles, and ensuring efficient Platform operations.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-black rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>
                    <strong>Campaign Management:</strong> To offer detailed analytics and insights regarding campaign
                    performance and influencer effectiveness, optimising brand-influencer collaborations.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-black rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>
                    <strong>Communication:</strong> To keep you informed about updates, notifications, and relevant
                    information about your account or the Platform's services.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-black rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>
                    <strong>Compliance:</strong> To comply with applicable laws and regulations.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-black rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>
                    <strong>Marketing and Promotions:</strong> To send relevant promotional materials and marketing
                    content, subject to your consent, where required by law.
                  </div>
                </li>
              </ul>
            </section>

            {/* Section 3: Disclosure of Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-black mb-4">Disclosure of Information</h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                We do not disclose your personal data to third parties except in the following circumstances:
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-black rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>
                    <strong>Service Providers:</strong> We may engage third-party service providers to perform functions
                    such as data hosting, analytics, and customer support. These third parties are bound by confidentiality
                    obligations.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-black rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>
                    <strong>Legal Requirements:</strong> We may disclose your information if required by law or to protect
                    the rights, property, or safety of COVO, its users, or others.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-black rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>
                    <strong>Business Transactions:</strong> In the event of a merger, acquisition, or sale of assets, your
                    personal data may be transferred as part of that transaction, and you will be notified of any changes
                    to the Policy.
                  </div>
                </li>
              </ul>
            </section>

            {/* Section 4: Data Security and Retention */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-black mb-4">Data Security and Retention</h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                We implement strict security measures to protect your data from unauthorised access, disclosure, or
                destruction, including encryption, firewalls, and secure servers. While we strive to protect your personal
                data, no transmission method over the internet is completely secure, and we cannot guarantee absolute security.
              </p>
              <p className="text-gray-700 mb-4 leading-relaxed">
                We retain personal data for as long as necessary to fulfil the purposes outlined in this Policy and comply
                with legal obligations. Once these purposes are achieved, the data will either be securely deleted or
                anonymized, as required by law.
              </p>
            </section>

            {/* Section 5: Data Subject Rights */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-black mb-4">Data Subject Rights</h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                In compliance with applicable data protection laws, you have the following rights:
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-black rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>
                    <strong>Right of Access:</strong> You may request access to the personal data we hold about you
                    and how it is processed.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-black rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>
                    <strong>Right to Rectification:</strong> You may request the correction of any inaccurate or
                    incomplete information.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-black rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>
                    <strong>Right to Erasure:</strong> You may request the deletion of your personal data, subject to
                    legal and contractual limitations.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-black rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>
                    <strong>Right to Object:</strong> You may object to the processing of your data on legitimate grounds.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-black rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>
                    <strong>Right to Restrict Processing:</strong> You may request that we limit the processing of your
                    personal data in certain circumstances.
                  </div>
                </li>
              </ul>
            </section>

            {/* Section 6: Consent and Lawfulness of Processing */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-black mb-4">Consent and Lawfulness of Processing</h2>
              <p className="text-gray-700 leading-relaxed">
                By providing your personal information and continuing to use the Platform, you consent to the collection,
                processing, and use of your data as described in this Policy. We ensure that personal data is processed
                lawfully, fairly, and transparently, in compliance with POPIA and other relevant data protection laws.
              </p>
            </section>

            {/* Section 7: Amendments to the Privacy Policy */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-black mb-4">Amendments to the Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify or update this Policy at any time. Users will be notified of any material
                changes through the Platform or via email. Your continued use of the Platform following such amendments
                constitutes acceptance of the revised terms.
              </p>
            </section>

            {/* Section 8: External Links */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-black mb-4">External Links</h2>
              <p className="text-gray-700 leading-relaxed">
                Our website may contain links to other websites we do not manage. We are not responsible for the content
                or privacy practices of these external sites. Please review their respective privacy policies before
                sharing any personal information.
              </p>
            </section>

            {/* Section 9: Use of Cookies */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-black mb-4">Use of Cookies</h2>
              <p className="text-gray-700 leading-relaxed">
                We use cookies to collect information about your interactions with our website. Cookies are small data
                files stored on your device to help us recognize you during subsequent visits and understand how you
                navigate our site. This enables us to tailor content to your preferences.
              </p>
            </section>

            {/* Section 10: Publicly Available Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-black mb-4">Publicly Available Information</h2>
              <p className="text-gray-700 leading-relaxed">
                We may access and analyse information from publicly available sources using advanced tools. For example,
                we may identify common corporate email formats (e.g., firstname.lastname@company.com) and use this
                information only after verifying its accuracy.
              </p>
            </section>

            {/* Section 11: Additional Information Collection */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-black mb-4">Additional Information Collection</h2>
              <p className="text-gray-700 leading-relaxed">
                We may collect personal information when you engage with our website, such as entering competitions,
                signing up for updates, accessing content via mobile or web browser, contacting us through email or
                social media, or mentioning us on social platforms. This information may be used to personalise your
                experience, communicate with you, conduct analytics and market research, and develop our business.
              </p>
            </section>

            {/* Section 12: Policy Updates */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-black mb-4">Policy Updates</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy to reflect changes in our business operations, industry standards, or
                legal requirements. We will notify you of any material changes, and if necessary, obtain your consent for
                new uses of your personal information.
              </p>
            </section>

            {/* Contact Information */}
            <section className="mb-8 bg-gray-50 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-black mb-4">Contact Us</h2>
              <p className="text-gray-700 leading-relaxed">
                For any inquiries or to exercise your data subject rights, please contact us at:
              </p>
              <p className="mt-2">
                <strong>Email:</strong> <a href="mailto:support@covo.co.za" className="text-blue-600 hover:text-blue-800 underline">support@covo.co.za</a>
              </p>
            </section>

          </div>
        </div>
      </main>

    
    </div>
  );
}
