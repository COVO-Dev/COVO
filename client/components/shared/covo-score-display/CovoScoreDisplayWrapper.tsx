"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { CovoScoreDisplayProps } from "@/types/covoScore.types";
import { CovoScoreShimmer } from './CovoScoreDisplay.component';

// Dynamically import the client component with no SSR
const CovoScoreDisplayClient = dynamic(
  () => import('./CovoScoreDisplayClient'),
  {
    ssr: false,
    loading: () => <CovoScoreShimmer size="md" className="" />,
  }
);

// Wrapper component that ensures client-side only rendering
export const CovoScoreDisplayWrapper: React.FC<CovoScoreDisplayProps> = (props) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Show shimmer during SSR and initial client load
  if (!isMounted) {
    return <CovoScoreShimmer size={props.size || "md"} className={props.className || ""} />;
  }

  return <CovoScoreDisplayClient {...props} />;
};

export default CovoScoreDisplayWrapper;
