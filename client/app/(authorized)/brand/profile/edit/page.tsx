"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import getCurrentUserData from "@/utils/getCurrentUserData";
import BrandProfileUpdateForm from "@/components/authorized/brand/profile-update/BrandProfileUpdateForm.component";

export default function BrandProfileEditPage() {
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
        router.push("/brand/profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [session, status, router]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          <span className="text-gray-600 font-medium">Loading your profile...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating geometric shapes */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-pink-100 to-orange-100 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-20 w-40 h-40 bg-gradient-to-br from-green-100 to-blue-100 rounded-full opacity-20 animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-32 w-28 h-28 bg-gradient-to-br from-yellow-100 to-pink-100 rounded-full opacity-20 animate-pulse delay-3000"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDAsIDAsIDAsIDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
      </div>

      {/* Main content */}
      <main className="relative z-10 container mx-auto px-4 py-8 sm:py-12 lg:py-16 flex items-center justify-center min-h-screen">
        {/* Main container with COVO styling */}
        <div className="bg-white backdrop-blur-xl border border-gray-100 p-8 sm:p-10 lg:p-12 rounded-2xl shadow-2xl shadow-gray-900/10 z-40 w-full max-w-4xl relative">
          {/* Subtle gradient overlay for visual depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50/20 via-transparent to-gray-50/10 pointer-events-none rounded-2xl"></div>

          {/* Header */}
          <div className="text-center mb-8 relative z-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-black mb-4 tracking-tight">
              Update Your Brand Profile
            </h1>
            <p className="text-gray-600 text-lg">
              Keep your brand information current to attract the best influencer partnerships
            </p>
          </div>

          {/* Form Component */}
          <div className="relative z-10">
            <BrandProfileUpdateForm 
              brandData={userData}
              onSuccess={() => {
                // Navigate back to profile after successful update
                setTimeout(() => {
                  router.push("/brand/profile");
                }, 2000);
              }}
              onCancel={() => router.push("/brand/profile")}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
