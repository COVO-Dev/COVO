"use server";

import endpoints from "@/lib/api/endpoints";

export async function getInstagramAuthUrlRoute(token: string) {
  try {
    const updateUrl = endpoints.getInstagramAuthUrl;

    console.log("getInstagramAuthUrlRoute Endpoint token:", token);

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
    console.error("Error in getInstagramAuthUrlRoute:", error);
    return {
      status: "error",
      message: error.message || "Validation or API request failed.",
    };
  }
}
