"use server";

import endpoints from "@/lib/api/endpoints";

export async function userRemovePhotoRoute(
  fileName: string,
  token: string,
  userId: string,
  userRole: string
) {
  let updateUrl = "";
  const fileReplacedURL =
    userRole.toLowerCase() === "influencer"
      ? endpoints.influencerRemovePhoto.replace(":fileName", fileName)
      : endpoints.brandRemovePhoto.replace(":fileName", fileName);

  try {
    if (userRole.toLowerCase() === "influencer") {
      updateUrl = fileReplacedURL.replace(":influencerId", userId);
    } else if (userRole.toLowerCase() === "brand") {
      updateUrl = fileReplacedURL.replace(":brandId", userId);
    }

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
    console.error("Error in userRemovePhotoRoute:", error, typeof error);

    return {
      status: "error",
      message: error.message || "API request failed.",
    };
  }
}
