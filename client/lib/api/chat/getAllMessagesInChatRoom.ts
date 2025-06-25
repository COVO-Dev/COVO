"use server";

import endpoints from "@/lib/api/endpoints";

// Define the function to fetch notifications
export async function getAllMessagesInChatRoom(token: string, chatId: string) {
  try {
    const messagesUrl = endpoints.getAllMessagesInChatroom.replace(
      ":chatId",
      chatId
    );

    console.log("ChatRooms Endpoint:", messagesUrl);

    // Fetch messages from the API
    const response = await fetch(messagesUrl, {
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

    // Return the fetched messages
    return { status: "success", data: await response.json() };
  } catch (error) {
    if (error.message === "No messages found") {
      return { status: "not found", data: [] };
    }
    console.error("Error in getAllMessagesInChatroom:", error);
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Unexpected error occurred.",
    };
  }
}
