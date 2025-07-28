// filepath: /home/ahmedseenapay/Repos/COVO/client/lib/api/campaign/get-invitations/GetInvitations.route.ts
"use server";

import endpoints from "@/lib/api/endpoints";
import { ServiceResponse } from "@/types"; // Assuming you have a ServiceResponse type on client

export async function getCampaignInvitationsRoute(
  token: string,
  influencerId: string,
  status?: "pending" | "accepted" | "rejected"
): Promise<ServiceResponse<any>> {
  // Adjust 'any' to a more specific type if available
  try {
    let url = endpoints.getCampaignInvitationsForInfluencer.replace(
      ":influencerId",
      influencerId
    );

    if (status) {
      url += `?status=${status}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store", // Ensure fresh data
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        status: "error",
        message: result.message || "Failed to fetch invitations",
      };
    }

    return {
      status: "success",
      message: result.message,
      data: result.data,
    };
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
