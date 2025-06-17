"use server";

import endpoints from "@/lib/api/endpoints";
import { z } from "zod";

// Define the function to fetch notifications
export async function deactivateAccount(
  token: string,
  userId: string,
  formValues: { deactivationReason: string }
) {
  try {
    // if (!token || !userId) {
    //   throw new Error("Session data is missing token or user ID.");
    // }
    // Define the form data schema
    const formDataSchema = z.object({
      deactivationReason: z.string().min(1, {
        message: "Deactivation reason is required",
      }),
    });

    const formData = formDataSchema.safeParse(formValues);

    const deactivateAccountUrl = endpoints.deactivateAccount.replace(
      ":userId",
      userId
    );

    console.log(
      "DeactivateAccount Endpoint:",
      deactivateAccountUrl,
      formData.data
    );

    // Fetch chatrooms from the API
    const response = await fetch(deactivateAccountUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      // body: JSON.stringify(formData?.data),
      body: JSON.stringify(formValues),
    });

    // Handle the response
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || response.statusText);
    }

    // Return the fetched notifications
    return { status: "success", data: await response.json() };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Unexpected error occurred.",
    };
  }
}
