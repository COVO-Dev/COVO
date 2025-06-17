"use server";

import endpoints from "@/lib/api/endpoints";

// Define the function to fetch notifications
export async function getNotificationsRoute({
  session,
}: {
  session: { token: string; userId: string };
}) {
  try {
    // Extract token and userId from session
    const { token, userId } = session;

    // Ensure session data contains required fields
    if (!token || !userId) {
      throw new Error("Session data is missing token or user ID.");
    }

    // Construct the endpoint URL dynamically
    const notificationsUrl = endpoints.getNotifications.replace(":recipient_id", userId);

    console.log("Notifications Endpoint:", notificationsUrl);

    // Fetch notifications from the API
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
    console.error("Error in getNotificationsRoute:", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unexpected error occurred.",
    };
  }
}
