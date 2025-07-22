"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import getCurrentUserData from "@/utils/getCurrentUserData";
import InfluencerProfileUpdateForm from "@/components/authorized/influencer/profile-update/InfluencerProfileUpdateForm.component";

export default function InfluencerProfileEditPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        const data = await getCurrentUserData();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        router.push("/influencer/profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [session, status, router]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Profile</h2>
          <p className="text-gray-600 mb-4">Unable to load your profile data.</p>
          <button
            onClick={() => router.push("/influencer/profile")}
            className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
          >
            Return to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
       
      
      {/* Main Content */}
      <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-white">
        {/* Background gradient overlay matching authentication pages */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 opacity-60"></div>

        {/* Floating background elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 rounded-full blur-xl animate-float opacity-30"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-200 rounded-full blur-lg animate-float animation-delay-500 opacity-30"></div>
        <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-pink-200 rounded-full blur-2xl animate-float animation-delay-1000 opacity-30"></div>

        {/* Main container with COVO styling */}
        <div className="bg-white backdrop-blur-xl border border-gray-100 p-8 sm:p-10 lg:p-12 rounded-2xl shadow-2xl shadow-gray-900/10 z-40 w-full max-w-4xl relative">
          {/* Subtle gradient overlay for visual depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50/20 via-transparent to-gray-50/10 pointer-events-none rounded-2xl"></div>

          {/* Header */}
          <div className="text-center mb-8 relative z-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-black mb-4 tracking-tight">
              Update Your Profile
            </h1>
            <p className="text-gray-600 text-lg">
              Keep your information current to get the best collaboration opportunities
            </p>
          </div>

          {/* Form Component */}
          <div className="relative z-10">
            <InfluencerProfileUpdateForm 
              influencerData={userData}
              onSuccess={() => {
                // Navigate back to profile after successful update
                setTimeout(() => {
                  router.push("/influencer/profile");
                }, 2000);
              }}
              onCancel={() => router.push("/influencer/profile")}
            />
          </div>
        </div>
      </main>

     
    </div>
  );
}
