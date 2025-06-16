"use server";

import endpoints from "@/lib/api/endpoints";
import { ZodError } from "zod";
// import IInfluencerUploadPhoto from "./influencerUploadPhotoRoute.model";
import IInfluencerUploadPhoto from "../influencer-upload-photo/influencerUploadPhotoRoute.model";

export async function brandUploadPhotoRoute(
  formData: IInfluencerUploadPhoto,
  token: string,
  brandId: string
) {
  try {
    const requestFormData = new FormData();
    if (formData.file && formData.file[0]) {
      requestFormData.append("file", formData.file[0]);
    }

    // Construct the endpoint URL dynamically
    const updateUrl = endpoints.brandUploadPhoto.replace(":brandId", brandId);

    console.log("Update Endpoint:", updateUrl);

    const response = await fetch(updateUrl, {
      method: "POST",
      headers: {
        // "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
      body: requestFormData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || response.statusText);
    }

    return { status: "success", data: await response.json() };
  } catch (error) {
    console.error("Error in brandUploadPhotoRoute:", error, typeof error);

    return {
      status: "error",
      message: error.message || "API request failed.",
    };
  }
}
