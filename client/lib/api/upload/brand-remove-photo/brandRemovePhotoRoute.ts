"use server";

import endpoints from "@/lib/api/endpoints";

export async function brandRemovePhotoRoute(
  fileName: string,
  token: string,
  brandId: string
) {
  try {
    const replaceUrl = endpoints.brandRemovePhoto.replace(":brandId", brandId);

    // Construct the endpoint URL dynamically
    const updateUrl = replaceUrl.replace(":fileName", fileName);

    // console.log("Update Endpoint:", updateUrl);

    const response = await fetch(updateUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      // body: requestFormData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || response.statusText);
    }

    return { status: "success", data: await response.json() };
  } catch (error) {
    console.error("Error in brandRemovePhotoRoute:", error, typeof error);

    return {
      status: "error",
      message: error.message || "API request failed.",
    };
  }
}
