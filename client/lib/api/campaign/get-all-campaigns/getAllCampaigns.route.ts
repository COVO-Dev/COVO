"use server";

import endpoints from "@/lib/api/endpoints";
import { IAllCampaigns, getAllCampaignsSchema } from "./getAllCampaigns.validation";

export async function getAllCampaignsRoute(
  paginationForm: IAllCampaigns,
  token: string,
) {
  try {
    // Construct the endpoint URL
    const params = new URLSearchParams(paginationForm);
    const updateUrl = `${endpoints.getAllCampaigns}${params.toString() ? `?${params.toString()}` : ""}`;
    console.log(updateUrl);

    // console.log("getAllCampaignsRoute", validatedSchema)
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
    console.error("Error in getAllCampaignsRoute:", error.message);
    return { status: "error", message: error.message || "Validation or API request failed." };
  }
}
