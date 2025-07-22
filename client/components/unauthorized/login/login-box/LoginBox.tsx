"use client";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { emailSchema, passwordSchema } from "@/lib/api/login/login.validation";
import { ZodError } from "zod";

export default function LoginBox() {
  const [error, setError] = useState("");
  const [loggedInSuccessfully, setLoggedInSuccessfully] = useState("");
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const router = useRouter();

  const validateField = (field: string, value: string) => {
    try {
      if (field === "email") {
        emailSchema.parse(value);
      } else if (field === "password") {
        passwordSchema.parse(value);
      }
      // If validation passes, remove error for this field
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = error.errors[0]?.message || "Invalid input";
        setValidationErrors(prev => ({
          ...prev,
          [field]: errorMessage
        }));
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
    // Clear server error when user starts typing
    if (error) setError("");
    // Validate field on change (for real-time validation)
    if (value.length > 0) {
      validateField(field, value);
    } else {
      // Clear validation errors if input is empty
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleLogin = async () => {
    // Clear previous errors
    setError("");
    setValidationErrors({});

    // Check for empty fields
    if (!loginData.email.trim() || !loginData.password.trim()) {
      setError("Please input email and password");
      return;
    }

    // Validate email format
    try {
      emailSchema.parse(loginData.email);
    } catch (error) {
      if (error instanceof ZodError) {
        setValidationErrors({ email: error.errors[0]?.message || "Invalid email" });
        return;
      }
    }

    // Validate password
    try {
      passwordSchema.parse(loginData.password);
    } catch (error) {
      if (error instanceof ZodError) {
        setValidationErrors({ password: error.errors[0]?.message || "Invalid password" });
        return;
      }
    }

    const response = await signIn("credentials", {
      redirect: false,
      email: loginData.email,
      password: loginData.password,
    });

    if (response?.error) {
      setError(response.error as string);
    } else if (response?.ok) {
      router.refresh();
      setLoggedInSuccessfully(`log in successful`);
    }
  };

  return (
    <div className="pt-8 rounded-lg w-auto max-w-md z-50 relative flex-col items-center justify-center">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-black mb-4 tracking-tight">
          Welcome Back
        </h1>
        <p className="text-gray-600 text-lg">
          Sign in to your COVO account
        </p>
      </div>

      {/* Error and Success Messages */}
      {validationErrors.email && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-600 text-center">
            {validationErrors.email}
          </p>
        </div>
      )}
      {validationErrors.password && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-600 text-center">
            {validationErrors.password}
          </p>
        </div>
      )}
      {error && !validationErrors.email && !validationErrors.password && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-600 text-center">
            {error}
          </p>
        </div>
      )}
      {loggedInSuccessfully && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm font-medium text-green-600 text-center">
            {loggedInSuccessfully}
          </p>
        </div>
      )}

      {/* Form Inputs */}
      <div className="space-y-6 mb-8">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={loginData.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleInputChange("email", e.target.value)
            }
            placeholder="Enter your email"
            className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300 ${
              validationErrors.email
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-200 hover:border-gray-300"
            }`}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={loginData.password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleInputChange("password", e.target.value)
            }
            placeholder="Enter your password"
            className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300 ${
              validationErrors.password
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-200 hover:border-gray-300"
            }`}
          />
        </div>
      </div>

      {/* Sign In Button */}
      <button
        onClick={handleLogin}
        className="w-full mb-6 px-6 py-4 bg-black hover:bg-gray-800 text-white font-medium rounded-xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
      >
        Sign In
      </button>

      {/* Links */}
      <div className="text-center space-y-3">
        <p className="text-gray-600 text-sm">
          Don&apos;t have an account?{" "}
          <Link
            className="text-black font-semibold hover:text-gray-700 transition-colors duration-200 hover:underline"
            href={"/signup"}
          >
            Sign Up
          </Link>
        </p>
        <p className="text-gray-600 text-sm">
          Forgot your password?{" "}
          <Link
            className="text-black font-semibold hover:text-gray-700 transition-colors duration-200 hover:underline"
            href={"/forgot-password"}
          >
            Reset Password
          </Link>
        </p>
      </div>
    </div>
  );
}
