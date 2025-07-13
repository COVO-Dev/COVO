"use server";

import endpoints from "@/lib/api/endpoints";
import { IInviteToCampaign } from "./inviteToCampaign.validation";

export async function inviteToCampaignRoute(
  token: string,
  brandId: string,
  campaignId: string,
  influencerId: string,
  formData: IInviteToCampaign
) {
  try {
    const campaignReplaced = endpoints.inviteToCampaign.replace(
      ":campaignId",
      campaignId
    );
    const updateUrl = campaignReplaced.replace(":brandId", brandId);

    const body = {
      influencerId,
      message: formData.message,
    };

    const response = await fetch(updateUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        status: "error",
        message: result.message || "An unknown error occurred",
      };
    }

    return {
      status: "success",
      message: result.message,
      data: result.data,
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
