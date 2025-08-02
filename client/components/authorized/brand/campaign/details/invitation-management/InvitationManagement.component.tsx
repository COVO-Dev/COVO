"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";

interface IInvitationManagementProps {
  appliedInfluencersBox?: React.ReactNode;
  recommendedInfluencersBox?: React.ReactNode;
  className?: string;
}

export default function InvitationManagement({
  appliedInfluencersBox,
  recommendedInfluencersBox,
  className,
}: IInvitationManagementProps) {
  const hasApplied = !!appliedInfluencersBox;
  const hasRecommended = !!recommendedInfluencersBox;

  // Define a suitable maximum height for the entire InvitationManagement component.
  // You might need to adjust '500px' based on your layout needs.
  const MAX_HEIGHT_CLASS = "max-h-[370px]";
  // Assuming TabsList has a fixed height (e.g., ~44px for default Shadcn TabsList)
  // This ensures the content area takes the remaining height.
  const CONTENT_AREA_HEIGHT_CLASS = "h-[calc(100%-44px)]";

  // If both are present, render tabs
  if (hasApplied && hasRecommended) {
    return (
      <Tabs
        defaultValue="applicants"
        // Apply flex-col to stack TabsList and TabsContent vertically
        // Apply max-h and overflow-hidden to contain the entire component's height
        className={`flex flex-col ${className} ${MAX_HEIGHT_CLASS} overflow-hidden`}
      >
        <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
          {" "}
          {/* flex-shrink-0 prevents TabsList from shrinking */}
          <TabsTrigger value="applicants">Applicants</TabsTrigger>
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
        </TabsList>
        {/* TabsContent should flex-grow to fill remaining space and allow scrolling */}
        <TabsContent
          value="applicants"
          className={`flex-grow overflow-y-auto ${CONTENT_AREA_HEIGHT_CLASS}`}
        >
          {appliedInfluencersBox}
        </TabsContent>
        <TabsContent
          value="recommended"
          className={`flex-grow overflow-y-auto ${CONTENT_AREA_HEIGHT_CLASS}`}
        >
          {recommendedInfluencersBox}
        </TabsContent>
      </Tabs>
    );
  }

  // If only one is present, render it directly without tabs
  if (hasApplied) {
    return (
      <div
        // Apply flex-col, max-h, and overflow-hidden to the single box container
        className={`flex flex-col ${className} ${MAX_HEIGHT_CLASS} overflow-hidden`}
      >
        {/* The content box itself should flex-grow and allow scrolling */}
        <div
          className={`flex-grow overflow-y-auto ${CONTENT_AREA_HEIGHT_CLASS}`}
        >
          {appliedInfluencersBox}
        </div>
      </div>
    );
  }

  if (hasRecommended) {
    return (
      <div
        // Apply flex-col, max-h, and overflow-hidden to the single box container
        className={`flex flex-col ${className} ${MAX_HEIGHT_CLASS} overflow-hidden`}
      >
        {/* The content box itself should flex-grow and allow scrolling */}
        <div
          className={`flex-grow overflow-y-auto ${CONTENT_AREA_HEIGHT_CLASS}`}
        >
          {recommendedInfluencersBox}
        </div>
      </div>
    );
  }

  // If neither is present, render null
  return null;
}
