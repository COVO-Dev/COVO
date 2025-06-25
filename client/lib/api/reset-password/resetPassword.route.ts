"use server";

import { IResetPassword, resetPasswordSchema } from "./resetPassword.validation";

export const resetPasswordRoute = async (data: IResetPassword) => {
  try {
    // Validate the input data
    const validatedData = resetPasswordSchema.parse(data);
    
    console.log("Resetting password with data:", { 
      token: validatedData.token ? `${validatedData.token.substring(0, 20)}...` : "MISSING", 
      passwordLength: validatedData.newPassword?.length,
      confirmPasswordLength: validatedData.confirmPassword?.length
    });
    
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/auth/reset-password`;
    console.log("Making API request to:", apiUrl);
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: validatedData.token,
        newPassword: validatedData.newPassword,
        confirmPassword: validatedData.confirmPassword,
      }),
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
    
    // Handle Zod validation errors
    if (error && typeof error === 'object' && 'issues' in error) {
      const zodError = error as { issues: Array<{ message: string }> };
      const firstError = zodError.issues[0];
      return {
        status: "error",
        message: firstError?.message || "Validation failed.",
        status_code: 400,
      };
    }
    
    return {
      status: "error",
      message: "Failed to connect to server. Please try again later.",
      status_code: 500,
    };
  }
};
