"use server";

import endpoints from "@/lib/api/endpoints";
import { ServiceResponse } from "@/types";

export async function rejectInvitationRoute(
  token: string,
  influencerId: string,
  campaignId: string,
  brandId: string
): Promise<ServiceResponse<any>> {
  try {
    let url = endpoints.rejectCampaignInvitation.replace(
      ":influencerId",
      influencerId
    );
    url = url.replace(":campaignId", campaignId);
    url = url.replace(":brandId", brandId);

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}), // No specific body needed for this action
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        status: "error",
        message: result.message || "Failed to decline invitation",
      };
    }

    return {
      status: "success",
      message: result.message,
      data: result.data,
    };
  } catch (error) {
    console.error("Error declining invitation:", error);
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
