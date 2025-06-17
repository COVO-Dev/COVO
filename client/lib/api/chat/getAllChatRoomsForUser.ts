"use server";

import endpoints from "@/lib/api/endpoints";

// Define the function to fetch notifications
export async function getAllChatRoomsForUser(token: string, userId: string) {
  try {
    // if (!token || !userId) {
    //   throw new Error("Session data is missing token or user ID.");
    // }

    const notificationsUrl = endpoints.getAllChatRoomsForUser.replace(
      ":userId",
      userId
    );

    console.log("ChatRooms Endpoint:", notificationsUrl);

    // Fetch chatrooms from the API
    const response = await fetch(notificationsUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Handle the response
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || response.statusText);
    }

    // Return the fetched notifications
    return { status: "success", data: await response.json() };
  } catch (error) {
    console.error("Error in getAllChatRoomsForUser:", error);
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Unexpected error occurred.",
    };
  }
}
