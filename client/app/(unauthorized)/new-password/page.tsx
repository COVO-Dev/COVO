"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { resetPasswordRoute } from '@/lib/api/reset-password/resetPassword.route';
import { resetPasswordSchema, passwordSchema, confirmPasswordSchema } from '@/lib/api/reset-password/resetPassword.validation';
import { ZodError } from 'zod';
import COVO_LOGOGRAM_BLACK from "@/assets/images/COVO_LOGOGRAM_BLACK.png";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenIsValid, setTokenIsValid] = useState(true);
  // We store the user ID from the URL but don't need to use it directly
  const [, setUserId] = useState("");

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    const idParam = searchParams.get('id');
    
    console.log("URL Parameters:", { token: tokenParam ? `${tokenParam.substring(0, 10)}...` : 'missing', id: idParam });
    
    if (!tokenParam || !idParam) {
      setTokenIsValid(false);
      setError("Invalid or missing reset token. Please request a new password reset link.");
      return;
    }
    
    setToken(tokenParam);
    setUserId(idParam);
    console.log("Token and ID set successfully");
  }, [searchParams]);

  const validateField = (field: string, value: string) => {
    try {
      if (field === "newPassword") {
        passwordSchema.parse(value);
      } else if (field === "confirmPassword") {
        // For confirm password, we need to check if it matches the new password
        if (value && newPassword && value !== newPassword) {
          throw new ZodError([{
            code: "custom",
            message: "Passwords don't match",
            path: ["confirmPassword"]
          }]);
        }
        confirmPasswordSchema.parse(value);
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

  const validateForm = () => {
    try {
      resetPasswordSchema.parse({
        token,
        newPassword,
        confirmPassword
      });
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

  const handleInputChange = (field: string, value: string) => {
    if (field === "newPassword") {
      setNewPassword(value);
      // Also validate confirm password if it's filled
      if (confirmPassword) {
        validateField("confirmPassword", confirmPassword);
      }
    } else if (field === "confirmPassword") {
      setConfirmPassword(value);
    }
    
    // Clear server error when user starts typing
    if (error) setError("");
    
    // Validate field on change (for real-time validation)
    if (value.length > 0) {
      validateField(field, value);
    }
  };

  const handleResetPassword = async () => {
    setError("");
    setSuccess("");
    
    // Validate the form first
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log("Reset attempt with token:", token ? `${token.substring(0, 10)}...` : 'missing');
      
      const response = await resetPasswordRoute({
        token,
        newPassword,
        confirmPassword
      });
      
      console.log("Reset response received:", response);

      if (response.status === "success") {
        setSuccess(response.message);
        setNewPassword("");
        setConfirmPassword("");
        setValidationErrors({});
      } else {
        setError(response.message);
      }
    } catch (error) {
      console.error("Error in reset password:", error);
      setError("An error occurred while resetting your password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="h-[calc(100dvh-100px)] flex items-center justify-center p-6 relative overflow-hidden bg-custom-very-soft-blue bg-[url('/svg/BG.svg')] bg-no-repeat bg-cover">
      <div className='bg-custom-light-grayish-blue bg-[url("/svg/BG.svg")] p-10 rounded-lg shadow-md z-40 flex flex-col items-center justify-center h-auto md:flex-row md:w-auto w-[97%]'>
        
        {/* Logo Side */}
        <div className="flex items-center justify-center w-[390px]">
          <div className='w-[300px] h-[120px] md:w-[400px] md:h-[400px] flex items-center justify-center'>
            <Image src={COVO_LOGOGRAM_BLACK} alt="Logo" width={300} height={300} />
          </div>
        </div>
        
        {/* Form Side */}
        <div className="pt-8 rounded-lg w-auto max-w-80 z-50 relative flex-col items-center justify-center">
          <h2 className="text-custom-dark-desaturated-blue text-center text-xl mb-6 font-semibold">
            Reset Your Password
          </h2>

          {!tokenIsValid ? (
            <div className="text-center">
              <p className="mb-4 text-sm text-red-500">
                {error}
              </p>
              <Link href="/forgot-password" className="text-custom-lark-blue">
                Request New Reset Link
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <p className="mb-4 text-sm font-bold text-red-500 absolute top-0 left-1/2 transform -translate-x-1/2 w-full text-center">
                  {error}
                </p>
              )}
              
              {success ? (
                <div className="text-center">
                  <p className="mb-4 text-sm font-bold text-green-500">
                    {success}
                  </p>
                  <Link href="/login" className="w-full mb-2 p-3 rounded-md bg-custom-dark-desaturated-blue text-white hover:bg-gray-600 focus:outline-none transition-transform duration-200 ease-in-out hover:scale-105 inline-block text-center">
                    Go to Login
                  </Link>
                </div>
              ) : (
                <>
                  <div className="w-full">
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => handleInputChange("newPassword", e.target.value)}
                      placeholder="New Password"
                      className={`mb-2 w-full p-3 rounded-md border bg-white/50 text-custom-dark-desaturated-blue placeholder-gray-500 focus:outline-none transition-colors ${
                        validationErrors.newPassword
                          ? "border-red-500 focus:border-red-500"
                          : "border-custom-dark-desaturated-blue focus:border-blue-500"
                      }`}
                    />
                    {validationErrors.newPassword && (
                      <p className="text-red-500 text-xs mb-2 px-1">
                        {validationErrors.newPassword}
                      </p>
                    )}
                  </div>
                  
                  <div className="w-full">
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      placeholder="Confirm Password"
                      className={`mb-2 w-full p-3 rounded-md border bg-white/50 text-custom-dark-desaturated-blue placeholder-gray-500 focus:outline-none transition-colors ${
                        validationErrors.confirmPassword
                          ? "border-red-500 focus:border-red-500"
                          : "border-custom-dark-desaturated-blue focus:border-blue-500"
                      }`}
                    />
                    {validationErrors.confirmPassword && (
                      <p className="text-red-500 text-xs mb-2 px-1">
                        {validationErrors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleResetPassword}
                    disabled={isSubmitting || Object.keys(validationErrors).length > 0 || !newPassword || !confirmPassword}
                    className={`w-full mb-2 p-3 rounded-md text-white focus:outline-none transition-all duration-200 ease-in-out ${
                      isSubmitting || Object.keys(validationErrors).length > 0 || !newPassword || !confirmPassword
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-custom-dark-desaturated-blue hover:bg-gray-600 hover:scale-105"
                    }`}
                  >
                    {isSubmitting ? "Resetting..." : "Reset Password"}
                  </button>
                </>
              )}
              
              <h1 className="text-custom-dark-desaturated-blue text-center text-sm pt-2">
                Remember your password?{" "}
                <Link className="text-custom-lark-blue" href="/login">
                  Sign In
                </Link>
              </h1>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
