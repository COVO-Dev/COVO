"use server";

import { z } from "zod";
import endpoints from "@/lib/api/endpoints";

export default async function userCheckPhotoRoute(
  fileURL: string,
  token: string
  // influencerId: string
) {
  const urlSchema = z
    .string()
    .url({ message: "invalid URL" })
    .min(1, { message: "file name should not be empty" });
  const validatedFileURL = await urlSchema.safeParse(fileURL);
  const fileName = validatedFileURL?.data.split("/").splice(-1)[0];
  const updateURL = endpoints.userGetFileURL.replace(":fileName", fileName);

  console.log("userCheckPhotoRoute url after parsing: ", updateURL);
  try {
    const response = await fetch(updateURL, {
      method: "HEAD",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("serverResponse: ", response);

    return { status: response.statusText, success: response.ok };
  } catch (error) {
    console.log(error);
    return {
      status: "error",
      message: error.message || "userCheckPhotoRoute error",
    };
  }
}
