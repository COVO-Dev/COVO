"use server";

import endpoints from "@/lib/api/endpoints";

export async function getInfluencerDetailsRoute(
  token: string,
  influencerId: string
) {
  try {
    // Construct the endpoint URL dynamically
    const updateUrl = endpoints.getInfluencerDetails.replace(
      ":influencerId",
      influencerId
    );

    console.log("GetInfluencer Endpoint token:", token);

    const response = await fetch(updateUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || response.statusText);
    }

    return { status: "success", data: await response.json() };
  } catch (error) {
    console.error("Error in getInfluencerDetailsRoute:", error);
    return {
      status: "error",
      message: error.message || "Validation or API request failed.",
    };
  }
}
