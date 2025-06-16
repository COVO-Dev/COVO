"use server";

import endpoints from "@/lib/api/endpoints";
import { ZodError } from 'zod';
import { influencerFormDataSchema, IInfluencerUpdateData } from "./influencerUpdateData.validation";

export async function influencerUpdateDataRoute(
  formData: IInfluencerUpdateData,
  token: string,
  userId: string
) {
  try {
    // Validate the data with Zod
    const validatedData = influencerFormDataSchema.parse(formData);
    console.log("validatedData: ", validatedData);

    // Construct the endpoint URL dynamically
    const updateUrl = endpoints.updateInfluencer.replace(":id", userId);

    console.log("Update Endpoint:", updateUrl);

    const response = await fetch(updateUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || response.statusText);
    }

    return { status: "success", data: await response.json() };
  } catch (error) {
    console.error("Error in influencerUpdateDataRoute:", error, typeof (error));
    if (error instanceof ZodError) {
      return {
        status: "Validation Error", message: error.message || "Validation or API request failed."
      };
    } else {
      return { status: "error", message: error.message || "Validation or API request failed." };
    }
  }
}
