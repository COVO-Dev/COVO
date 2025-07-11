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
    <div className="pt-8 rounded-lg w-auto max-w-md z-50 relative flex-col items-center justify-center">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-black mb-4 tracking-tight">
          Reset Password
        </h1>
        <p className="text-gray-600 text-lg">
          Enter your email address and we&apos;ll send you instructions to reset your password.
        </p>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-600 text-center">
            {error}
          </p>
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm font-medium text-green-600 text-center">
            {successMessage}
          </p>
        </div>
      )}

      {/* Email Input */}
      <div className="space-y-6 mb-8">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Enter your email"
            className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300 ${
              validationErrors.email
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-200 hover:border-gray-300"
            }`}
            suppressHydrationWarning={true}
          />
          {validationErrors.email && (
            <div className="mt-2">
              <p className="text-red-600 text-sm flex items-center">
                <span className="mr-1">⚠️</span>
                {validationErrors.email === "Invalid email address"
                  ? "Please enter a valid email format (e.g., example@domain.com)"
                  : validationErrors.email}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reset Password Button */}
      <button
        onClick={handleForgotPassword}
        disabled={isSubmitting || Object.keys(validationErrors).length > 0 || !email}
        className={`w-full mb-6 px-6 py-4 font-medium rounded-xl transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          isSubmitting || Object.keys(validationErrors).length > 0 || !email
            ? "bg-gray-400 text-white cursor-not-allowed"
            : "bg-black hover:bg-gray-800 text-white hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] hover:-translate-y-1 focus:ring-black"
        }`}
      >
        {isSubmitting ? "Sending..." : "Reset Password"}
      </button>

      {/* Sign In Link */}
      <div className="text-center">
        <p className="text-gray-600 text-sm">
          Remember your password?{" "}
          <Link
            className="text-black font-semibold hover:text-gray-700 transition-colors duration-200 hover:underline"
            href={"/login"}
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
