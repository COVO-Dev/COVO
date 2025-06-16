"use client";
import { forgotPasswordRoute } from "@/lib/api/forgot-password/forgotPassword.route";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordBox() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Email is required");
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

      <input
        type="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="mb-4 w-full p-3 rounded-md border border-custom-dark-desaturated-blue bg-white/50 text-custom-dark-desaturated-blue placeholder-gray-500 focus:outline-none focus:border-blue-500"
      />

      <button
        onClick={handleForgotPassword}
        disabled={isSubmitting}
        className={`w-full mb-2 p-3 rounded-md bg-custom-dark-desaturated-blue text-white hover:bg-gray-600 focus:outline-none transition-transform duration-200 ease-in-out hover:scale-105 ${
          isSubmitting ? "opacity-70 cursor-not-allowed" : ""
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
