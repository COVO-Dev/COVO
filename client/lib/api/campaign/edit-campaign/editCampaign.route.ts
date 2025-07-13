"use server";

import endpoints from "@/lib/api/endpoints";
import ICampaignApplication from "./editCampaign.validation";

export async function editCampaignDataRoute(
  token: string,
  campaignId: string,
  brandId: string,
  payload: { influencerId: string }
) {
  try {
    // Construct the endpoint URL
    const updateUrlBrandId = endpoints.editCampaign.replace(
      ":brandId",
      brandId
    );
    const updateUrl = updateUrlBrandId.replace(":campaignId", campaignId);

    console.log("editCampaignDataRoute", updateUrl);

    const response = await fetch(updateUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
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
    console.error("Error in editCampaignDataRoute:", error.message);
    return {
      status: "error",
      message: error.message || "Validation or API request failed.",
    };
  }
}
