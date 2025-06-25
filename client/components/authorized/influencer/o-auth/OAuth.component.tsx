'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react"; // Import loading icon
import Image from 'next/image';
import COVO_White from '@/assets/images/COVO_WHITE_NO_BG.png';
import noDataSVG from '@/assets/svg/undraw_no-data_ig65.svg';
import { useAppSelector } from '@/lib/store/hooks';

// Import social media icons (you can use lucide-react or custom SVG components)
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import OAuthSignupButton from './SignUpButton.component';

export default function OAuthHero({ isLoading, platformAuthUrl, className }) {
  const { selectedPlatforms } = useAppSelector((state) => state.profile)

  return (
    <Card className={`w-[90%] sm:max-w-[70%] md-sm:max-w-[90%] lg:max-w-[920px] md-sm:p-2 shadow-md rounded-lg flex flex-col md:flex-row ${className} bg-custom-light-grayish-blue  items-center `}>
      <CardHeader className="flex flex-col items-center md:w-1/2 ">
        <div className="bg-black rounded-lg w-full md:w-auto flex justify-center">
          <Image
            src={COVO_White}
            alt="Brand Logo"
            width={300}
            height={300}
            className="object-contain"
          />
        </div>
      </CardHeader>
      <div className="md:border-l border-b border-gray-400 w-[90%] md:w-0 h-0 md:h-full" />

      <CardContent className="bg-[url('/svg/BG.svg')] py-6 w-[78%] md:w-1/2 flex flex-col md:flex-row items-center md-sm:justify-center md-lg:px-[2em] lg-md:px-[3em] lg-xl:px-[4em] md:h-full ">

        <div className="flex flex-col gap-2 w-[100%] md-sm:h-[100%] justify-start ">
          <CardTitle className="text-2xl font-semibold mx-auto">Sign-Up </CardTitle>
          <div className="flex flex-col flex-1 justify-center space-y-4 items-center ">
            {isLoading ? (
              <div className="flex justify-center items-center ">
                <Loader2 className="animate-spin w-40 h-40" />
              </div>
            ) :
              <>
                {
                  platformAuthUrl
                    .map((platform: string, index: number) => {
                      const platformName = Object.keys(platform)[0].toLowerCase();
                      const platformUrl = platform[platformName];
                      const disabled = selectedPlatforms
                        .map(platformString => platformString.toLowerCase())
                        .includes(
                          platformName
                        )

                      return (
                        <OAuthSignupButton
                          key={index}
                          platformName={platformName}
                          platformUrl={platformUrl}
                          disabled={disabled}
                        />
                      );
                    })
                }
              </>
            }
          </div>
        </div>
      </CardContent>
    </Card >
  );
};
