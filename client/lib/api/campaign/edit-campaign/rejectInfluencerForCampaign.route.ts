"use server";

import endpoints from "@/lib/api/endpoints";
import ICampaignApplication from "./editCampaign.validation";

export async function rejectInfluencerForCampaignRoute(
  token: string,
  campaignId: string,
  addedInfluencer: ICampaignApplication
) {
  try {
    // Construct the endpoint URL
    const updateUrlBrandId = endpoints.rejectInfluencerForCampaign.replace(
      ":brandId",
      addedInfluencer.brandId
    );
    const updateUrl = updateUrlBrandId.replace(":campaignId", campaignId);

    console.log("rejectInfluencerForCampaignRoute", updateUrl);

    const response = await fetch(updateUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(addedInfluencer),
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
    console.error("Error in rejectInfluencerForCampaignRoute:", error.message);
    return {
      status: "error",
      message: error.message || "Validation or API request failed.",
    };
  }
}
