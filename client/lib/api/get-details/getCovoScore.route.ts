"use server";

import endpoints from "@/lib/api/endpoints";
import { CovoScoreResponse, CovoScoreError } from "@/types/covoScore.types";

/**
 * Fetches Covo score data for a specific influencer
 * @param token - Authentication token
 * @param influencerId - ID of the influencer to fetch Covo score for
 * @returns Promise<CovoScoreResponse> - Response containing Covo score data or error
 */
export async function getCovoScoreRoute(token: string, influencerId: string): Promise<CovoScoreResponse> {
  try {
    // Validate input parameters
    if (!token) {
      return {
        status: "error",
        message: "Authentication token is required",
      };
    }

    if (!influencerId) {
      return {
        status: "error",
        message: "Influencer ID is required",
      };
    }

    // Build the API endpoint
    const endpoint = endpoints.getInfluencerDetails.replace(
      ":influencerId",
      influencerId
    );

    console.log(`🔍 Fetching Covo score for influencer: ${influencerId}`);

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      let errorMessage = "Failed to fetch Covo score";
      let errorType: CovoScoreError = "UNKNOWN_ERROR";

      // Handle different HTTP status codes
      switch (response.status) {
        case 401:
          errorType = "AUTHENTICATION_ERROR";
          errorMessage = "Authentication failed. Please log in again.";
          break;
        case 404:
          errorType = "NOT_FOUND";
          errorMessage = "Influencer not found";
          break;
        case 403:
          errorType = "AUTHENTICATION_ERROR";
          errorMessage = "Access denied. Insufficient permissions.";
          break;
        default:
          errorType = "NETWORK_ERROR";
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || response.statusText;
          } catch {
            errorMessage = response.statusText || "Network error occurred";
          }
      }

      console.error(`❌ Error fetching Covo score: ${response.status} - ${errorMessage}`);

      return {
        status: "error",
        message: errorMessage,
      };
    }

    const data = await response.json();

    // Validate response data structure
    if (!data || !data.data) {
      console.error("❌ Invalid response structure:", data);
      return {
        status: "error",
        message: "Invalid response data structure",
      };
    }

    // Validate that the influencer data contains Covo score
    if (!data.data.covoScore) {
      console.warn("⚠️ Influencer data missing Covo score, using default");
      // Set default Covo score if missing
      data.data.covoScore = {
        overall: 100, // Default score as per backend model
        ratings: []
      };
    }

    // console.log(`✅ Successfully fetched Covo score: ${data.data.covoScore.overall}`);

    return {
      status: "success",
      data: data.data,
    };
  } catch (error: any) {
    console.error("💥 Network error fetching Covo score:", error);

    return {
      status: "error",
      message: error.message || "Network error occurred while fetching Covo score",
    };
  }
}