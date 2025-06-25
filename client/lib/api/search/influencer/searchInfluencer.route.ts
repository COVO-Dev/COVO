"use server";

import endpoints from "@/lib/api/endpoints";
import { searchInfluencerSchema, IsearchInfluencer } from "./searchInfluencer.validation";

export async function searchInfluencerRoute(
  formData: IsearchInfluencer,
  token: string,
) {
  try {
    // Validate the data
    const validatedData = searchInfluencerSchema.parse(formData);

    // Construct the endpoint URL
    const params = new URLSearchParams(validatedData)
    console.log("*********************");
    console.log("Fetch function", validatedData, params.toString());

    // const updateUrl = `${endpoints.searchInfluencer}?${params.toString()}`;
    const updateUrl = `${endpoints.searchInfluencer}${params.toString() ? `?${params.toString()}` : ""}`;
    // const updateUrl = `${endpoints.searchInfluencer}`;
    // console.log("searchInfluencerRoute data:", updateUrl, formData, params, validatedData)
    console.log("searchInfluencerRoute data:", updateUrl, params.toString());
    console.log("*********************");

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
    console.error("Error in searchInfluencerRoute:", error.message);
    return { status: "error", message: error.message || "Validation or API request failed." };
  }
}
