"use server";

import endpoints from "@/lib/api/endpoints";
import {
	IApplyToCampaign,
	applyToCampaignSchema,
} from "./applyToCampaign.validation";

export async function applyToCampaignRoute(
	token: string,
	formData: IApplyToCampaign,
	campaignId: string,
	influencerId: string
) {
	try {
		const validatedForm = applyToCampaignSchema.safeParse(formData);
		console.log("validatedForm", validatedForm.data);
		const campaignReplaced = endpoints.applyToCampaign.replace(
			":campaignId",
			campaignId
		);
		const updateUrl = campaignReplaced.replace(":influencerId", influencerId);
		console.log("applyToCampaignRoute", updateUrl, validatedForm);

		const response = await fetch(updateUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(validatedForm.data),
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
		console.error("Error in applyToCampaignRoute:", error.message);
		return {
			status: "error",
			message: error.message || "Validation or API request failed.",
		};
	}
}
