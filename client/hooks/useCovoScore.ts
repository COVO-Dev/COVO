"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { getCovoScoreRoute } from "@/lib/api/get-details/getCovoScore.route";
import { getBrandReliabilityRoute } from "@/lib/api/get-details/getBrandReliability.route";
import { UseCovoScoreReturn, CovoScore } from "@/types/covoScore.types";

/**
 * Custom hook for fetching and managing Covo score data
 * @param influencerId - ID of the influencer to fetch Covo score for
 * @param autoFetch - Whether to automatically fetch data on mount (default: true)
 * @param pollingInterval - Polling interval in milliseconds (0 = no polling, default: 0)
 * @returns UseCovoScoreReturn object with score data, loading state, error, and refetch function
 */
export const useCovoScore = (
  influencerId?: string,
  autoFetch: boolean = true,
  pollingInterval: number = 0
): UseCovoScoreReturn => {
  const [covoScore, setCovoScore] = useState<CovoScore | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { data: session } = useSession();
  const token = (session?.user as { access_token?: string })?.access_token;
  const currentUserId = (session?.user as { _id?: string })?._id;
  const userRole = (session?.user as { role?: string })?.role;

  // Use current user's ID if no influencerId is provided
  const targetInfluencerId = influencerId || currentUserId;

  // Determine what type of score to fetch based on user role
  const shouldFetchInfluencerScore = influencerId ? true : userRole === "Influencer";
  const shouldFetchBrandScore = !influencerId && userRole === "Brand";
  const shouldFetchAnyScore = shouldFetchInfluencerScore || shouldFetchBrandScore;

  /**
   * Fetches Covo score data from the API
   */
  const fetchCovoScore = useCallback(async () => {
   
    if (!shouldFetchAnyScore) {
      setCovoScore(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    // Validate required parameters
    if (!token) {
      setError("Authentication token not available. Please log in.");
      setIsLoading(false);
      return;
    }

    if (!targetInfluencerId) {
      setError("Influencer ID not available.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (shouldFetchInfluencerScore) {
        // Fetch Influencer Covo Score
        // console.log(`🔄 Fetching Covo score for influencer: ${targetInfluencerId}`);

        const response = await getCovoScoreRoute(token, targetInfluencerId);

        if (response.status === "success" && response.data) {
          const fetchedScore = response.data.covoScore;

          // Validate the score data
          if (fetchedScore && typeof fetchedScore.overall === "number") {
            setCovoScore(fetchedScore);
            // console.log(`✅ Covo score fetched successfully: ${fetchedScore.overall}`);
          } else {
            // Set default score if data is invalid
            const defaultScore: CovoScore = {
              overall: 100,
              ratings: []
            };
            setCovoScore(defaultScore);
            console.warn("⚠️ Invalid Covo score data, using default score");
          }
        } else {
          setError(response.message || "Failed to fetch Covo score");
          console.error(`❌ Failed to fetch Covo score: ${response.message}`);
        }
      } else if (shouldFetchBrandScore) {
        // Fetch Brand Reliability Rating
        console.log(`🔄 Fetching brand reliability for brand: ${targetInfluencerId}`);

        const response = await getBrandReliabilityRoute(token, targetInfluencerId);

        if (response.status === "success" && response.data) {
          const fetchedRating = response.data.reliabilityRating;

          // Convert brand rating (0-5) to Covo score format for consistency
          if (fetchedRating && typeof fetchedRating.overall === "number") {
            const convertedScore: CovoScore = {
              overall: fetchedRating.overall, // Keep 0-5 scale for brands
              ratings: fetchedRating.ratings || []
            };
            setCovoScore(convertedScore);
            console.log(`✅ Brand reliability fetched successfully: ${fetchedRating.overall}`);
          } else {
            // Set default brand rating if data is invalid
            const defaultScore: CovoScore = {
              overall: 0, // Default brand rating is 0
              ratings: []
            };
            setCovoScore(defaultScore);
            console.warn("⚠️ Invalid brand reliability data, using default rating");
          }
        } else {
          setError(response.message || "Failed to fetch brand reliability rating");
          console.error(`❌ Failed to fetch brand reliability: ${response.message}`);
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || "An unexpected error occurred";
      setError(errorMessage);
      console.error("💥 Error in useCovoScore:", err);
    } finally {
      setIsLoading(false);
    }
  }, [token, targetInfluencerId, shouldFetchAnyScore, shouldFetchInfluencerScore, shouldFetchBrandScore]);

  /**
   * Refetch function to manually trigger data fetching
   */
  const refetch = useCallback(async () => {
    await fetchCovoScore();
  }, [fetchCovoScore]);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch && token && targetInfluencerId && shouldFetchAnyScore) {
      fetchCovoScore();
    }
  }, [autoFetch, token, targetInfluencerId, shouldFetchAnyScore, fetchCovoScore]);

  
  useEffect(() => {
    if (!token) {
      setCovoScore(null);
      setError(null);
      setIsLoading(false);
    }
  }, [token]);

  // Polling effect for automatic updates
  useEffect(() => {
    if (pollingInterval > 0 && token && targetInfluencerId && shouldFetchAnyScore) {
      const interval = setInterval(() => {
        console.log(`🔄 Polling score update every ${pollingInterval}ms`);
        fetchCovoScore();
      }, pollingInterval);

      return () => clearInterval(interval);
    }
  }, [pollingInterval, token, targetInfluencerId, shouldFetchAnyScore, fetchCovoScore]);

  return {
    covoScore,
    isLoading,
    error,
    refetch,
  };
};


export const useCurrentUserCovoScore = (pollingInterval?: number): UseCovoScoreReturn => {
  return useCovoScore(undefined, true, pollingInterval);
};

/**
 * Hook for getting a specific influencer's Covo score
 * @param influencerId - ID of the influencer
 * @param enabled - Whether to enable fetching (default: true)
 * @param pollingInterval - Polling interval in milliseconds (optional)
 */
export const useInfluencerCovoScore = (
  influencerId: string,
  enabled: boolean = true,
  pollingInterval?: number
): UseCovoScoreReturn => {
  return useCovoScore(influencerId, enabled, pollingInterval);
};

/**
 * Hook with automatic updates every 30 seconds
 * Useful for dashboard or profile pages where scores might change frequently
 */
export const useCurrentUserCovoScoreWithUpdates = (): UseCovoScoreReturn => {
  return useCovoScore(undefined, true, 30000); // Poll every 30 seconds
};

/**
 * Hook with automatic updates every 5 minutes
 * Useful for less critical displays where occasional updates are sufficient
 */
export const useCurrentUserCovoScoreWithSlowUpdates = (): UseCovoScoreReturn => {
  return useCovoScore(undefined, true, 300000); // Poll every 5 minutes
};
