"use server";

import endpoints from "@/lib/api/endpoints";
import { brandFormDataSchema, IBrandUpdateData } from "./brandUpdateData.validation";

export async function brandUpdateDataRoute(
  formData: IBrandUpdateData,
  token: string,
  userId: string
) {
  try {
    // Validate the data
    const validatedData = brandFormDataSchema.parse(formData);

    // Construct the endpoint URL
    const updateUrl = endpoints.updateBrand.replace(":id", userId);

    const response = await fetch(updateUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(validatedData),
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
    console.error("Error in brandUpdateDataRoute:", error.message);
    return { status: "error", message: error.message || "Validation or API request failed." };
  }
}
