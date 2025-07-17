"use client";
import Image from "next/image";
import COVO_LOGOGRAM_BLACK from "@/assets/images/COVO_LOGOGRAM_BLACK.png";

export default function TermsAndConditions() {
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
              Terms and Conditions
            </h1>
            <p className="text-gray-600 text-lg mb-4">
              The terms governing your use of the COVO platform and services.
            </p>
            <p className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Content Container with scroll */}
          <div className="relative z-10 max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar">
            
            {/* Important Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-amber-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">Legal Agreement</h3>
                  <div className="mt-2 text-sm text-amber-700">
                    <p>
                      By accessing and using the COVO platform, you agree to be bound by these Terms and Conditions. 
                      Please read them carefully before using our services. If you do not agree to these terms, 
                      please do not use our platform.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 1: Acceptance of Terms */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-black mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms and Conditions ("Terms") constitute a legally binding agreement between you ("User," "you," 
                or "your") and COVO ("Company," "we," "us," or "our") regarding your use of the COVO platform and 
                related services. By creating an account, accessing, or using our services, you acknowledge that you 
                have read, understood, and agree to be bound by these Terms.
              </p>
            </section>

            {/* Section 2: Description of Service */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-black mb-4">2. Description of Service</h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                COVO is a digital platform that connects brands with influencers for marketing collaborations. Our services include:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-black rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>Facilitating connections between brands and influencers</div>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-black rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>Campaign management and analytics tools</div>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-black rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>Payment processing and financial management</div>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-black rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>Performance tracking and reporting</div>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-black rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>Communication and collaboration tools</div>
                </li>
              </ul>
            </section>

            {/* Section 3: User Accounts and Registration */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-black mb-4">3. User Accounts and Registration</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-black mb-2">Account Creation</h3>
                  <p className="text-gray-700 leading-relaxed">
                    To use our services, you must create an account by providing accurate, current, and complete 
                    information. You are responsible for maintaining the confidentiality of your account credentials 
                    and for all activities that occur under your account.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-black mb-2">Eligibility</h3>
                  <p className="text-gray-700 leading-relaxed">
                    You must be at least 18 years old and have the legal capacity to enter into contracts to use our 
                    services. By using COVO, you represent and warrant that you meet these requirements.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-black mb-2">Account Security</h3>
                  <p className="text-gray-700 leading-relaxed">
                    You agree to notify us immediately of any unauthorized use of your account or any other breach of 
                    security. We are not liable for any loss or damage arising from your failure to comply with this 
                    security obligation.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4: User Conduct and Responsibilities */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-black mb-4">4. User Conduct and Responsibilities</h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                When using our platform, you agree to:
              </p>
              <ul className="space-y-2 text-gray-700 mb-4">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>Provide accurate and truthful information</div>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>Comply with all applicable laws and regulations</div>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>Respect the intellectual property rights of others</div>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>Maintain professional conduct in all interactions</div>
                </li>
              </ul>
              <p className="text-gray-700 mb-4 leading-relaxed">
                You agree NOT to:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>Use the platform for any illegal or unauthorized purpose</div>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>Violate any laws in your jurisdiction</div>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>Transmit any harmful, threatening, or offensive content</div>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>Attempt to gain unauthorized access to our systems</div>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>Interfere with or disrupt the platform's functionality</div>
                </li>
              </ul>
            </section>

            {/* Section 5: Intellectual Property */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-black mb-4">5. Intellectual Property</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-black mb-2">COVO's Intellectual Property</h3>
                  <p className="text-gray-700 leading-relaxed">
                    The COVO platform, including its design, functionality, content, and trademarks, is owned by COVO 
                    and protected by intellectual property laws. You may not copy, modify, distribute, or create 
                    derivative works without our express written permission.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-black mb-2">User Content</h3>
                  <p className="text-gray-700 leading-relaxed">
                    You retain ownership of content you submit to the platform. However, by submitting content, you 
                    grant COVO a non-exclusive, worldwide, royalty-free license to use, display, and distribute your 
                    content in connection with our services.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 6: Payment Terms */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-black mb-4">6. Payment Terms</h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Payment terms vary based on your user type and the specific services used:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-black rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>All payments are processed securely through our platform</div>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-black rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>Service fees and commission rates are clearly disclosed</div>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-black rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>Refunds are subject to our refund policy</div>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-black rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>Users are responsible for applicable taxes</div>
                </li>
              </ul>
            </section>

            {/* Section 7: Limitation of Liability */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-black mb-4">7. Limitation of Liability</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">
                  To the maximum extent permitted by law, COVO shall not be liable for any indirect, incidental, 
                  special, consequential, or punitive damages, including but not limited to loss of profits, data, 
                  or business opportunities, arising from your use of our services.
                </p>
              </div>
            </section>

            {/* Section 8: Termination */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-black mb-4">8. Termination</h2>
              <p className="text-gray-700 leading-relaxed">
                Either party may terminate this agreement at any time. COVO reserves the right to suspend or terminate 
                your account for violation of these Terms. Upon termination, your right to use the platform ceases 
                immediately, and we may delete your account and data in accordance with our data retention policies.
              </p>
            </section>

            {/* Section 9: Changes to Terms */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-black mb-4">9. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify users of material changes 
                through the platform or via email. Your continued use of the platform after such modifications 
                constitutes acceptance of the updated Terms.
              </p>
            </section>

            {/* Contact Information */}
            <section className="mb-8 bg-gray-50 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-black mb-4">Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have questions about these Terms and Conditions, please contact us:
              </p>
              <div className="space-y-2">
                <p>
                  <strong>Email:</strong> <a href="mailto:legal@covo.co.za" className="text-blue-600 hover:text-blue-800 underline">legal@covo.co.za</a>
                </p>
                <p>
                  <strong>General Support:</strong> <a href="mailto:support@covo.co.za" className="text-blue-600 hover:text-blue-800 underline">support@covo.co.za</a>
                </p>
              </div>
            </section>

          </div>
        </div>
      </main>

     
    </div>
  );
}
