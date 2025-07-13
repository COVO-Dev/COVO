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

  // If both are present, render tabs
  if (hasApplied && hasRecommended) {
    return (
      <Tabs defaultValue="applicants" className={className}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="applicants">Applicants</TabsTrigger>
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
        </TabsList>
        <TabsContent value="applicants">{appliedInfluencersBox}</TabsContent>
        <TabsContent value="recommended">
          {recommendedInfluencersBox}
        </TabsContent>
      </Tabs>
    );
  }

  // If only one is present, render it directly without tabs
  if (hasApplied) {
    return <div className={className}>{appliedInfluencersBox}</div>;
  }

  if (hasRecommended) {
    return <div className={className}>{recommendedInfluencersBox}</div>;
  }

  // If neither is present, render null
  return null;
}
