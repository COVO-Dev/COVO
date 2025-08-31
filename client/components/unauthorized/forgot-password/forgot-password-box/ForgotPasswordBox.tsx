"use client";
import { forgotPasswordRoute } from "@/lib/api/forgot-password/forgotPassword.route";
import { forgotPasswordSchema } from "@/lib/api/forgot-password/forgotPassword.validation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ZodError } from "zod";

export default function ForgotPasswordBox() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const validateEmail = (value: string) => {
    try {
      forgotPasswordSchema.parse({ email: value });
      // If validation passes, remove error
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.email;
        return newErrors;
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = error.errors[0]?.message || "Invalid email";
        setValidationErrors(prev => ({
          ...prev,
          email: errorMessage
        }));
      }
    }
  };

  const validateForm = () => {
    try {
      forgotPasswordSchema.parse({ email });
      setValidationErrors({});
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: { [key: string]: string } = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as string;
          errors[field] = err.message;
        });
        setValidationErrors(errors);
      }
      return false;
    }
  };

  const handleInputChange = (value: string) => {
    setEmail(value);
    // Clear server error when user starts typing
    if (error) setError("");
    // Validate email on change (for real-time validation)
    if (value.length > 0) {
      validateEmail(value);
    } else {
      // Clear validation errors if input is empty
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.email;
        return newErrors;
      });
    }
  };

  const handleForgotPassword = async () => {
    // First validate the form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      console.log("Sending forgot password request for:", email);
      const response = await forgotPasswordRoute({ email });
      console.log("Forgot password response:", response);
      
      if (response.status === "error") {
        setError(response.message);
      } else if (response.status === "success") {
        setSuccessMessage(response.message || "Password reset email sent successfully. Please check your inbox.");
        setEmail(""); // Clear the email field after successful submission
        setValidationErrors({}); // Clear validation errors
      } else {
        // If we get an unexpected response format
        setError("Unexpected response from server. Please try again.");
        console.error("Unexpected response format:", response);
      }
    } catch (err) {
      console.error("Error in forgot password:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isClient) {
    return (
      <div className="pt-8 rounded-lg w-auto max-w-80 z-50 relative flex-col items-center justify-center">
        <div className="text-custom-dark-desaturated-blue text-center text-xl mb-6 font-semibold animate-pulse h-7 bg-gray-200 rounded"></div>
        <div className="text-custom-dark-desaturated-blue text-center text-sm mb-6 animate-pulse h-4 bg-gray-200 rounded"></div>
        <div className="mb-4 w-full p-3 rounded-md border border-custom-dark-desaturated-blue bg-white/50 animate-pulse h-12"></div>
        <div className="w-full mb-2 p-3 rounded-md bg-custom-dark-desaturated-blue animate-pulse h-12"></div>
        <div className="text-custom-dark-desaturated-blue text-center text-sm pt-2 animate-pulse h-4 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="pt-8 rounded-lg w-auto max-w-80 z-50 relative flex-col items-center justify-center">
      {error && (
        <p className="mb-4 text-sm font-bold text-red-500 absolute top-0 left-1/2 transform -translate-x-1/2 w-full text-center">
          {error}
        </p>
      )}
      {successMessage && (
        <p className="mb-4 text-sm font-bold text-green-500 absolute top-0 left-1/2 transform -translate-x-1/2 w-full text-center">
          {successMessage}
        </p>
      )}

      <h2 className="text-custom-dark-desaturated-blue text-center text-xl mb-6 font-semibold">
        Reset Password
      </h2>
      
      <p className="text-custom-dark-desaturated-blue text-center text-sm mb-6">
        Enter your email address and we&apos;ll send you instructions to reset your password.
      </p>

      <div className="w-full">
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Email"
          className={`mb-2 w-full p-3 rounded-md border bg-white/50 text-custom-dark-desaturated-blue placeholder-gray-500 focus:outline-none transition-colors ${
            validationErrors.email
              ? "border-red-500 focus:border-red-500"
              : "border-custom-dark-desaturated-blue focus:border-blue-500"
          }`}
          suppressHydrationWarning={true}
        />
        {validationErrors.email && (
          <div className="mb-2">
            <p className="text-red-500 text-xs px-1 flex items-center">
              <span className="mr-1">⚠️</span>
              {validationErrors.email === "Invalid email address" 
                ? "Please enter a valid email format (e.g., example@domain.com)" 
                : validationErrors.email}
            </p>
          </div>
        )}
      </div>

      <button
        onClick={handleForgotPassword}
        disabled={isSubmitting || Object.keys(validationErrors).length > 0 || !email}
        className={`w-full mb-2 p-3 rounded-md text-white focus:outline-none transition-all duration-200 ease-in-out ${
          isSubmitting || Object.keys(validationErrors).length > 0 || !email
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-custom-dark-desaturated-blue hover:bg-gray-600 hover:scale-105"
        }`}
      >
        {isSubmitting ? "Sending..." : "Reset Password"}
      </button>

      <h1 className="text-custom-dark-desaturated-blue text-center text-sm pt-2">
        Remember your password?{" "}
        <Link className="text-custom-lark-blue" href={"/login"}>
          Sign In
        </Link>
      </h1>
    </div>
  );
}
