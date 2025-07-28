"use server";

import endpoints from "@/lib/api/endpoints";

export interface BrandReliabilityResponse {
  status: "success" | "error";
  data?: {
    _id: string;
    companyName: string;
    reliabilityRating: {
      overall: number;
      ratings: string[];
    };
    // ... other brand fields
  };
  message?: string;
}

/**
 * Fetches brand reliability rating data for a specific brand
 * @param token - Authentication token
 * @param brandId - ID of the brand to fetch reliability rating for
 * @returns Promise<BrandReliabilityResponse> - Response containing brand reliability data or error
 */
export async function getBrandReliabilityRoute(token: string, brandId: string): Promise<BrandReliabilityResponse> {
  try {
    // Validate input parameters
    if (!token) {
      return {
        status: "error",
        message: "Authentication token is required",
      };
    }

    if (!brandId) {
      return {
        status: "error",
        message: "Brand ID is required",
      };
    }

    // Build the API endpoint
    const endpoint = endpoints.getBrandDetails.replace(":id", brandId);

    console.log(`🔍 Fetching brand reliability for brand: ${brandId}`);
    console.log(`🌐 API endpoint: ${endpoint}`);

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      let errorMessage = "Failed to fetch brand reliability rating";

      // Handle different HTTP status codes
      switch (response.status) {
        case 401:
          errorMessage = "Authentication failed. Please log in again.";
          break;
        case 404:
          errorMessage = "Brand not found";
          break;
        case 403:
          errorMessage = "Access denied. Insufficient permissions.";
          break;
        default:
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || response.statusText;
          } catch {
            errorMessage = response.statusText || "Network error occurred";
          }
      }

      console.error(`❌ Error fetching brand reliability: ${response.status} - ${errorMessage}`);
      
      return {
        status: "error",
        message: errorMessage,
      };
    }

    const data = await response.json();
    console.log("📦 Raw brand data received:", JSON.stringify(data, null, 2));

    // Validate response data structure
    if (!data || !data.data) {
      console.error("❌ Invalid response structure:", data);
      return {
        status: "error",
        message: "Invalid response data structure",
      };
    }

    console.log("🔍 Brand data structure:", {
      hasReliabilityRating: !!data.data.reliabilityRating,
      reliabilityRating: data.data.reliabilityRating,
      dataKeys: Object.keys(data.data)
    });

    // Validate that the brand data contains reliability rating
    if (!data.data.reliabilityRating) {
      console.warn("⚠️ Brand data missing reliability rating, using default");
      // Set default reliability rating if missing
      data.data.reliabilityRating = {
        overall: 0, // Default rating as per backend model
        ratings: []
      };
    }

    console.log(`✅ Successfully fetched brand reliability: ${data.data.reliabilityRating.overall}`);

    return {
      status: "success",
      data: data.data,
    };
  } catch (error: any) {
    console.error("💥 Network error fetching brand reliability:", error);
    
    return {
      status: "error",
      message: error.message || "Network error occurred while fetching brand reliability rating",
    };
  }
}
