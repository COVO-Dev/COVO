"use server";

import endpoints from "@/lib/api/endpoints";

export async function deleteNotificationRoute({
  notificationId,
  session,
}) {
  try {
    const { token, userId } = session;

    // Validate inputs
    if (!notificationId || !token || !userId) {
      throw new Error("Missing required parameters: notificationId, token, or userId.");
    }

    // Construct the delete URL
    const deleteUrl = endpoints.deleteNotification
      .replace(":recipient_id", userId)
      .replace(":notification_id", notificationId);

    console.log("Delete Endpoint URL:", deleteUrl);

    // Make the DELETE request
    const response = await fetch(deleteUrl, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Handle errors from the API
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || response.statusText);
    }

    return { status: "success", message: "Notification deleted successfully." };
  } catch (error) {
    console.error("Error in deleteNotificationRoute:", error);
    return {
      status: "error",
      message: error.message || "Failed to delete notification.",
    };
  }
}
