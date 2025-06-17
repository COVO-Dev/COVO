"use server";

import endpoints from "@/lib/api/endpoints";
import { campaignSchema, ICampaign } from "./createCampaign.validation";
// import { IInitialState } from "@/lib/store/campaign/campaign.model";
// import { ICampaign } from "./createCampaign.validation";

export async function campaignDataRoute(
  formData: ICampaign,
  token: string,
  userId: string
) {
  try {
    // Construct the endpoint URL
    const updateUrl = endpoints.createCampaign.replace(":brandId", userId);
    console.log("campaignDataRoute", updateUrl)

    const response = await fetch(updateUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
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
    console.error("Error in campaignDataRoute:", error.message);
    return { status: "error", message: error.message || "Validation or API request failed." };
  }
}
