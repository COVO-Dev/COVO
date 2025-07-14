"use client";
import Image from "next/image";
import COVO_LOGOGRAM_BLACK from "@/assets/images/COVO_LOGOGRAM_BLACK.png";

export default function DeactivationPolicy() {
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
              Deactivation Policy
            </h1>
            <p className="text-gray-600 text-lg mb-4">
              At COVO, we strive to offer flexibility and control over your experience. This policy explains what happens when a user account is deactivated, either voluntarily or by us, and how we handle data during and after deactivation.
            </p>
            <p className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Content Container with scroll */}
          <div className="relative z-10 max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar">
            
            {/* Section 1: Voluntary Deactivation */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-black mb-4">1. Voluntary Deactivation</h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                You may deactivate your account at any time by:
              </p>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-black rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>Visiting your Account Settings, or</div>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-black rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>
                    Contacting us directly at{" "}
                    <a href="mailto:support@covo.co.za" className="text-blue-600 hover:text-blue-800 underline">
                      support@covo.co.za
                    </a>
                  </div>
                </li>
              </ul>

              <p className="text-gray-700 mb-4 leading-relaxed">
                When you deactivate your account:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>Your profile and activity become hidden from other users.</div>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>You stop receiving communications from COVO.</div>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>You can restore full access at any time by logging back in or reaching out to support.</div>
                </li>
              </ul>
            </section>

            {/* Section 2: Involuntary Deactivation */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-black mb-4">2. Involuntary Deactivation</h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                We may deactivate an account without prior notice under the following circumstances:
              </p>
              <ul className="space-y-2 text-gray-700 mb-4">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>Breach of our Terms of Service or Community Guidelines</div>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>Fraudulent, harmful, or suspicious activity</div>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>Extended inactivity (e.g., no logins or interactions for 12 months or longer)</div>
                </li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                When possible, we will notify users prior to deactivation and offer an opportunity to respond or appeal.
              </p>
            </section>

            {/* Section 3: Data Retention */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-black mb-4">3. Data Retention</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-blue-800 text-sm">
                  <strong>Important:</strong> Deactivation does not equal deletion. Your account information; including messages, profile details, and engagement history may be retained, in accordance with our Privacy Policy and applicable laws.
                </p>
              </div>

              <p className="text-gray-700 mb-4 leading-relaxed">
                We retain this information to:
              </p>
              <ul className="space-y-2 text-gray-700 mb-6">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>Maintain platform integrity</div>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>Comply with legal obligations</div>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>Support account reactivation</div>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>Improve user experience and safety</div>
                </li>
              </ul>

              <p className="text-gray-700 leading-relaxed">
                You may request permanent deletion of your account and associated data by contacting{" "}
                <a href="mailto:support@covo.co.za" className="text-blue-600 hover:text-blue-800 underline">
                  support@covo.co.za
                </a>
                . Please note that deletion is irreversible and may require identity verification.
              </p>
            </section>

            {/* Contact Information */}
            <section className="mb-8 bg-gray-50 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-black mb-4">Need Help?</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have questions about account deactivation or need assistance with the process, please contact our support team:
              </p>
              <div className="space-y-2">
                <p>
                  <strong>Support:</strong> <a href="mailto:support@covo.co.za" className="text-blue-600 hover:text-blue-800 underline">support@covo.co.za</a>
                </p>
              </div>
            </section>

          </div>
        </div>
      </main>

     
    </div>
  );
}
