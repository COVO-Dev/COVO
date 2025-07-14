"use client";
import ContactUs from "./ContactUs.component";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export default function ContactUsPage() {
  
  const { elementRef: heroRef, isVisible: heroVisible, hasTriggered: heroTriggered } = useScrollAnimation({
    threshold: 0.1,
    triggerOnce: true
  });

  return (
    <div className="min-h-screen bg-white">
     

      {/* Background gradient overlay matching Home page */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 opacity-60 pointer-events-none"></div>
      
      {/* Hero Section */}
      <section ref={heroRef} className="pt-32 pb-16 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Main heading with scroll-triggered animation */}
            <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-black mb-6 leading-tight tracking-tight ${heroTriggered ? 'animate-fade-in-up' : ''}`}>
              Contact Us
            </h1>
            
            {/* Subtitle */}
            <p className={`text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed ${heroTriggered ? 'animate-fade-in-up animation-delay-200' : ''}`}>
              Get in touch with our team. We're here to help you succeed with COVO.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Us Component */}
      <div className="relative z-10">
        <ContactUs />
      </div>

      
    </div>
  );
}
