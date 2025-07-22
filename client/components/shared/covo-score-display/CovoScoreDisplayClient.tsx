"use client";

import React from "react";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useInfluencerCovoScore, useCurrentUserCovoScore } from "@/hooks/useCovoScore";
import { CovoScoreDisplayProps } from "@/types/covoScore.types";
import { CovoScoreShimmer } from "./CovoScoreDisplay.component";

// Client component that uses hooks
const CovoScoreDisplayClient: React.FC<CovoScoreDisplayProps> = ({
  influencerId,
  className = "",
  showLabel = true,
  size = "md"
}) => {
  const { data: session, status } = useSession();
  const userRole = (session?.user as { role?: string })?.role;

  // Always call hooks first (React rule)
  const { covoScore, isLoading, error, refetch } = influencerId
    ? useInfluencerCovoScore(influencerId)
    : useCurrentUserCovoScore();

  // Show loading shimmer during session loading
  if (status === "loading") {
    return <CovoScoreShimmer size={size} className={className} />;
  }

  // Determine the score type and label based on user role
  const isInfluencerScore = influencerId || userRole === "Influencer";

  const getScoreLabel = () => {
    if (!showLabel) return "";
    return isInfluencerScore ? "Covo Score:" : "Reliability:";
  };

  // Size variants
  const sizeClasses = {
    sm: {
      container: "w-32 h-12 text-sm",
      loader: "w-3 h-3",
      text: "text-sm",
      icon: "w-3 h-3"
    },
    md: {
      container: "w-40 h-14 text-base",
      loader: "w-4 h-4", 
      text: "text-base",
      icon: "w-4 h-4"
    },
    lg: {
      container: "w-48 h-16 text-lg",
      loader: "w-5 h-5",
      text: "text-lg", 
      icon: "w-5 h-5"
    }
  };

  const currentSize = sizeClasses[size];

  // Format the score for display based on type
  const formatScore = (score: number | null): string => {
    if (score === null) return "N/A";
    if (isInfluencerScore) {
      return score.toFixed(2); // Influencer scores: 2 decimal places
    } else {
      return score.toFixed(1); // Brand ratings: 1 decimal place
    }
  };

  // Base glassmorphism container classes
  const containerClasses = cn(
    // Base layout
    "flex items-center justify-center",
    "border-2 rounded-lg p-2 font-semibold",
    "relative overflow-hidden",
    
    // Glassmorphism effects
    "bg-white/10 backdrop-blur-sm",
    "border-white/20",
    "shadow-[0_0_10px_rgba(255,255,255,0.3)]",
    
    // Hover effects
    "hover:bg-white/15 hover:border-white/30",
    "hover:shadow-[0_0_15px_rgba(255,255,255,0.4)]",
    "transition-all duration-300",
    
    // Size classes
    currentSize.container,
    currentSize.text,
    
    // Custom classes
    className
  );

  // Loading state
  if (isLoading) {
    return (
      <div className={containerClasses}>
        <div className="flex items-center gap-2 text-white">
          <Loader2 className={cn("animate-spin", currentSize.loader)} />
          <span className="animate-pulse">Loading...</span>
        </div>
      </div>
    );
  }

  // Error state with retry option
  if (error) {
    const isNetworkError = error.includes('server') || error.includes('connect') || error.includes('fetch failed');
    const errorText = isNetworkError ? "Offline" : "Error";
    const errorColor = isNetworkError ? "text-yellow-200 group-hover:text-yellow-100" : "text-red-200 group-hover:text-red-100";

    return (
      <div className={cn(containerClasses, "cursor-pointer group")} onClick={refetch}>
        <div className={cn("flex items-center gap-2", errorColor)}>
          <AlertCircle className={currentSize.icon} />
          <span className="truncate" title={error}>{errorText}</span>
          <RefreshCw className={cn("opacity-0 group-hover:opacity-100 transition-opacity", currentSize.icon)} />
        </div>
      </div>
    );
  }

  // Success state - display the score
  const scoreValue = covoScore?.overall;
  const displayScore = formatScore(scoreValue ?? null);

  // Color coding based on score and type
  const getScoreColor = (score: number | null): string => {
    if (score === null) return "text-gray-300";

    if (isInfluencerScore) {
      // Influencer Covo Score (0-100 scale)
      if (score >= 90) return "text-green-200";
      if (score >= 80) return "text-yellow-200";
      if (score >= 70) return "text-orange-200";
      return "text-red-200";
    } else {
      // Brand Reliability Rating (0-5 scale)
      if (score >= 4) return "text-green-200";
      if (score >= 3) return "text-yellow-200";
      if (score >= 2) return "text-orange-200";
      return "text-red-200";
    }
  };

  return (
    <div className={containerClasses}>
      <div className={cn("flex items-center gap-2", getScoreColor(scoreValue || null))}>
        {showLabel && <span>{getScoreLabel()}</span>}
        <span className="font-bold">{displayScore}</span>
      </div>
    </div>
  );
};

export default CovoScoreDisplayClient;
