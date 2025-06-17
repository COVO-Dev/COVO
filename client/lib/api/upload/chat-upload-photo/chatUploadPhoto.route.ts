"use server";

import endpoints from "@/lib/api/endpoints";
import IChatUploadPhoto from "./chatUploadPhoto.model";
// import IInfluencerUploadPhoto from "./influencerUploadPhotoRoute.model";

export async function chatUploadPhoto(
  token: string,
  // payload: messageData,
  messageData: IChatUploadPhoto,
) {
  try {
    const requestFormData = new FormData();
    console.log(messageData, "messageData");
    if (messageData.mediaFiles) {
      messageData?.mediaFiles?.forEach((file) => {
        requestFormData.append("mediaFiles", file);
      });
    }
    if (messageData.messageContent) {
      requestFormData.append("messageContent", messageData.messageContent);
    }
    if (messageData.chatId) {
      requestFormData.append("chatId", messageData.chatId);
    }
    if (messageData.senderId) {
      requestFormData.append("senderId", messageData.senderId);
    }
    const url = endpoints.chatUploadPhoto;
    console.log(url, requestFormData);

    const response = await fetch(url, {
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
    console.error("Error in chatUploadPhoto:", error, typeof error);

    return {
      status: "error",
      message: error.message || "API request failed.",
    };
  }
}
