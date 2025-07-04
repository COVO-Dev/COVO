"use server";

import endpoints from "@/lib/api/endpoints";
import { ICampaign } from "./createCampaign.validation";
// import { IInitialState } from "@/lib/store/campaign/campaign.model";
// import { ICampaign } from "./createCampaign.validation";

export async function campaignDataRoute(
  formData: ICampaign,
  token: string,
  userId: string
) {
  try {
    // Validate inputs
    if (!userId || userId.trim() === '') {
      throw new Error("Brand ID is required but was empty or undefined");
    }
    
    if (!token || token.trim() === '') {
      throw new Error("Authentication token is required but was empty or undefined");
    }

    console.log("campaignDataRoute inputs:", {
      formData: formData,
      token: token ? "Present" : "Missing", 
      userId: userId,
      endpointTemplate: endpoints.createCampaign,
      fullEndpoint: endpoints.createCampaign
    });

    // Construct the endpoint URL
    const updateUrl = endpoints.createCampaign.replace(":brandId", userId);
    console.log("campaignDataRoute URL construction:", {
      template: endpoints.createCampaign,
      userId: userId,
      finalUrl: updateUrl
    });

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
    console.error("Error in campaignDataRoute:", error instanceof Error ? error.message : String(error));
    return { 
      status: "error", 
      message: error instanceof Error ? error.message : "Validation or API request failed." 
    };
  }
}
