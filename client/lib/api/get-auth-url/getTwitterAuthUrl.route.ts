"use server";

import endpoints from "@/lib/api/endpoints";

export async function getTwitterAuthUrlRoute(token: string) {
  try {
    const updateUrl = endpoints.getTwitterAuthUrl;

    console.log("getTwitterAuthUrlRoute Endpoint token:", token);

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
    console.error("Error in getTwitterAuthUrlRoute:", error);
    return {
      status: "error",
      message: error.message || "Validation or API request failed.",
    };
  }
}
