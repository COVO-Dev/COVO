"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube,
  Mail,
  Phone,
  MapPin
} from "lucide-react";

interface FooterProps {
  className?: string;
}

export default function Footer({ className = "" }: FooterProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, sectionId: string) => {
    e.preventDefault();

    if (pathname === '/Home') {
      const section = document.getElementById(sectionId);
      if (section) {
        window.history.pushState({}, '', href);
        section.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      router.push(href);
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  
    console.log("Newsletter subscription:", email);
    setEmail("");
  };

  const currentYear = new Date().getFullYear();

  const navigationLinks = [
    { label: "Home", href: "/#home", sectionId: "home" },
    { label: "Demo", href: "/#demo", sectionId: "demo" },
    { label: "How it Works", href: "/#how-it-works", sectionId: "how-it-works" },
    { label: "Pricing", href: "/#pricing", sectionId: "pricing" },
  ];

  const legalLinks = [
    { label: "Privacy Policy", href: "/privacy-policy" },
    {label: "Deactivation Policy", href: "/deactivation-policy"},
    { label: "Terms and Conditions", href: "/terms-and-conditions" },
    {label: "FAQ", href: "/faq"},
    // { label: "Cookie Policy", href: "/cookie-policy" },
    // { label: "Accessibility Statement", href: "/accessibility" },
  ];

  const supportLinks = [
    // { label: "Help Center", href: "/help" },
    { label: "Contact Us", href: "/contact-us" },
    // { label: "Community", href: "/community" },
    // { label: "Status", href: "/status" },
  ];

  const socialLinks = [
    { icon: Instagram, href: "https://instagram.com/covo", label: "Instagram" },
    { icon: Twitter, href: "https://twitter.com/covo", label: "Twitter" },
    { icon: Linkedin, href: "https://linkedin.com/company/covo", label: "LinkedIn" },
    { icon: Youtube, href: "https://youtube.com/covo", label: "YouTube" },
    { icon: Facebook, href: "https://facebook.com/covo", label: "Facebook" },
  ];

  return (
    <footer className={`bg-black text-white py-16 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Company Information */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <Image
                src="/images/COVO_WHITE_NO_BG.png"
                alt="COVO"
                width={120}
                height={40}
                className="h-10 w-auto transition-transform duration-200 hover:scale-105"
                priority
              />
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Connecting brands with perfect influencers through intelligent matching.
            </p>
            
            {/* Contact Information */}
            <div className="space-y-3">
              <div className="flex items-center text-gray-300 hover:text-white transition-colors duration-200">
                <Mail className="w-4 h-4 mr-3 flex-shrink-0" />
                <a href="mailto:hello@covo.com" className="hover:underline">
                  hello@covo.com
                </a>
              </div>
              <div className="flex items-center text-gray-300 hover:text-white transition-colors duration-200">
                <Phone className="w-4 h-4 mr-3 flex-shrink-0" />
                <a href="tel:+1234567890" className="hover:underline">
                  +1 (234) 567-890
                </a>
              </div>
              <div className="flex items-start text-gray-300">
                <MapPin className="w-4 h-4 mr-3 flex-shrink-0 mt-0.5" />
                <span>South Africa</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Navigation</h3>
            <ul className="space-y-3">
              {navigationLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    onClick={(e) => handleAnchorClick(e, link.href, link.sectionId)}
                    className="text-gray-300 hover:text-white transition-colors duration-200 hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Legal & Support</h3>
            <ul className="space-y-3">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200 hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {supportLinks.map((link, index) => (
                <li key={index + legalLinks.length}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200 hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Join Our Newsletter</h3>
            <p className="text-gray-300 mb-4 text-sm">
              Stay updated with the latest features and partnerships.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-200 hover:border-gray-600"
                required
              />
              <button
                type="submit"
                className="w-full px-4 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 hover:scale-105 transition-all duration-200 transform"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            
            {/* Copyright */}
            <div className="text-gray-400 text-sm">
              © {currentYear} COVO. All rights reserved.
            </div>

            {/* Social Media Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-200 hover:scale-110 transform"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
