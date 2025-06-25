"use server";

import endpoints from "@/lib/api/endpoints";
import { ZodError } from "zod";
import {
  influencerFullUpdateDataSchema,
  IInfluencerFullUpdateData,
} from "./influencerFullUpdateData.validation";

export async function influencerFullUpdateDataRoute(
  formData: IInfluencerFullUpdateData,
  token: string,
  userId: string
) {
  try {
    // Validate the data with Zod
    const validatedData = influencerFullUpdateDataSchema.parse(formData);
    console.log("validatedData: ", validatedData);

    // Construct the endpoint URL dynamically
    const updateUrl = endpoints.fullUpdateInfluencer.replace(":id", userId);

    console.log("Update Endpoint:", updateUrl);

    const response = await fetch(updateUrl, {
      method: "PATCH",
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
    console.error(
      "Error in influencerFullUpdateDataRoute:",
      error,
      typeof error
    );

    if (error instanceof ZodError) {
      return {
        status: "Validation Error",
        message: error.message || "Validation failed.",
      };
    } else {
      return {
        status: "error",
        message: error.message || "API request failed.",
      };
    }
  }
}
