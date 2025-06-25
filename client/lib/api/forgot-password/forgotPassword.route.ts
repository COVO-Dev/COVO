"use server";

import { IForgotPassword } from "./forgotPassword.validation";

export const forgotPasswordRoute = async (data: IForgotPassword) => {
  try {
    console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (response.ok) {
      return {
        status: "success",
        message: responseData.message || "Password reset email sent successfully. Check your inbox.",
        status_code: response.status,
      };
    } else {
      return {
        status: "error",
        message: responseData.message || "Error sending password reset email.",
        status_code: response.status,
      };
    }
  } catch {
    return {
      status: "error",
      message: "Failed to connect to server. Please try again later.",
      status_code: 500,
    };
  }
};
