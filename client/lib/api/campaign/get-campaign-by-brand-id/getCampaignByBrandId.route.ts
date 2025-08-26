"use server";

import endpoints from "@/lib/api/endpoints";
import { IAllCampaigns, getAllCampaignsSchema } from "./getAllCampaigns.validation";

export async function getCampaignByBrandIdRoute(
  token: string,
  userId: string
) {
  try {
    // Construct the endpoint URL
    const updateUrl = endpoints.getCampaignByBrandId.replace(":brandId", userId);
    console.log("getCampaignByBrandIdRoute", updateUrl, userId, token)

    const response = await fetch(updateUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    // Handle API errors and non-JSON responses
    if (!response.ok) {
      const contentType = response.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(errorData.message || response.statusText);
      } else {
        const errorText = await response.text();
        throw new Error(errorText || response.statusText);
      }
    }

    return { status: "success", data: await response.json() };
  } catch (error) {
    console.error("Error in getCampaignByBrandIdRoute:", error.message);
    return { status: "error", message: error.message || "Validation or API request failed." };
  }
}
