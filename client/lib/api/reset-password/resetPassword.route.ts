"use server";

import { IResetPassword } from "./resetPassword.validation";

export const resetPasswordRoute = async (data: IResetPassword) => {
  try {
    console.log("Resetting password with data:", { 
      token: data.token ? `${data.token.substring(0, 20)}...` : "MISSING", 
      passwordLength: data.newPassword?.length,
      confirmPasswordLength: data.confirmPassword?.length
    });
    
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/auth/reset-password`;
    console.log("Making API request to:", apiUrl);
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();
    console.log("Reset password response:", responseData);

    if (response.ok) {
      return {
        status: "success",
        message: responseData.message || "Password has been reset successfully.",
        status_code: response.status,
      };
    } else {
      return {
        status: "error",
        message: responseData.message || "Error resetting password.",
        status_code: response.status,
      };
    }
  } catch (error) {
    console.error("Reset password error:", error);
    return {
      status: "error",
      message: "Failed to connect to server. Please try again later.",
      status_code: 500,
    };
  }
};
