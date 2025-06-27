"use server";

import endpoints from "@/lib/api/endpoints";

export async function getRegisteredCampaignForInfluencerRoute(
  token: string,
  influencerId: string
) {
  try {
    // Construct the endpoint URL
    const updateUrl = endpoints.getRegisteredCampaignsForInfluencer.replace(
      ":influencerId",
      influencerId
    );
    console.log(
      "getRegisteredCampaignForInfluencerRoute - URL:",
      updateUrl,
      "influencerId:",
      influencerId,
      "token:",
      token ? `${token.substring(0, 10)}...` : "NO_TOKEN"
    );

    let response;
    try {
      response = await fetch(updateUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (networkError) {
      console.error("Network error during fetch:", networkError);
      throw new Error(`Network error: ${networkError instanceof Error ? networkError.message : 'Unable to connect to server'}`);
    }

    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));

    // Handle API errors and non-JSON responses
    if (!response.ok) {
      console.error("Response not OK:", response.status, response.statusText);
      const contentType = response.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        console.error("Error data:", errorData);
        throw new Error(errorData.message || response.statusText);
      } else {
        const errorText = await response.text();
        console.error("Error text:", errorText);
        throw new Error(errorText || response.statusText);
      }
    }

    let responseData;
    try {
      responseData = await response.json();
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      throw new Error("Server returned invalid JSON response");
    }

    console.log("Raw response data:", responseData);
    console.log("Response data type:", typeof responseData);
    console.log("Response data keys:", Object.keys(responseData || {}));

    // Check if responseData is empty
    if (!responseData || (typeof responseData === 'object' && Object.keys(responseData).length === 0)) {
      console.error("Server returned empty or null response");
      throw new Error("Server returned empty response - backend may not be running");
    }

    return { status: "success", data: responseData };
  } catch (error: unknown) {
    console.error(
      "Error in getRegisteredCampaignForInfluencerRoute:",
      error instanceof Error ? error.message : String(error)
    );
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Validation or API request failed.",
    };
  }
}
