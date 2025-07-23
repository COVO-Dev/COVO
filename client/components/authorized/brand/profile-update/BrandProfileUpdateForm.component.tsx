"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { z, ZodError } from "zod";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import {
  IBrandUpdateData,
  brandFormDataSchema,
} from "@/lib/api/update-data/brand/brandUpdateData.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { brandUpdateDataRoute } from "@/lib/api/update-data/brand/brandUpdateData.route";
import { User, Building, Globe, CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BrandProfileUpdateFormProps {
  brandData: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const steps = [
  {
    id: 1,
    title: "Personal Information",
    description: "Update your personal details",
    icon: <User className="w-5 h-5" />,
  },
  {
    id: 2,
    title: "Company Details",
    description: "Update your company information",
    icon: <Building className="w-5 h-5" />,
  },
  {
    id: 3,
    title: "Social & Contact",
    description: "Update your social media and contact details",
    icon: <Globe className="w-5 h-5" />,
  },
];

export default function BrandProfileUpdateForm({
  brandData,
  onSuccess,
  onCancel,
}: BrandProfileUpdateFormProps) {
  const { data: session, update } = useSession();

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Don't render the form if we don't have brand data yet
  if (!brandData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        <span className="ml-3 text-gray-600">Loading profile data...</span>
      </div>
    );
  }

  // Extract user data from session
  const access_token = (session?.user as any)?.access_token;
  const _id = (session?.user as any)?._id;
  const rawFormData = brandData?.brandData || brandData || {};

  // Memoize formData to prevent infinite re-renders
  const formData = useMemo(() => ({
    firstName: rawFormData.firstName || "",
    lastName: rawFormData.lastName || "",
    email: rawFormData.email || session?.user?.email || "",
    username: rawFormData.username || "",
    companyName: rawFormData.companyName || "",
    companyWebsite: rawFormData.companyWebsite || "",
    position: rawFormData.position || "",
    logo: rawFormData.logo || "",
    industry: rawFormData.industry || "",
    phoneNumber: rawFormData.phoneNumber || "",
    businessType: rawFormData.businessType || "",
    socialMedia: {
      instagram: rawFormData.socialMedia?.instagram || "",
      facebook: rawFormData.socialMedia?.facebook || "",
      linkedin: rawFormData.socialMedia?.linkedin || "",
      twitter: rawFormData.socialMedia?.twitter || "",
    },
    paymentDetails: {
      method: rawFormData.paymentDetails?.method || "",
      billingInfo: rawFormData.paymentDetails?.billingInfo || "",
    },
    bio: rawFormData.bio || "",
  }), [rawFormData, session?.user?.email]);

  // Use the brand schema for the form
  const form = useForm<IBrandUpdateData>({
    resolver: zodResolver(brandFormDataSchema),
    defaultValues: formData,
    mode: "onSubmit", // Only validate on submit to prevent initial validation errors
  });

  const {
    control,
    setValue,
    getValues,
    resetField,
    trigger,
    handleSubmit,
    register,
    formState: { errors },
  } = form;

  // Navigation functions
  const handleNext = async () => {
    // Validate current step fields
    let fieldsToValidate: (keyof IBrandUpdateData)[] = [];
    
    switch (currentStep) {
      case 0:
        fieldsToValidate = ["firstName", "lastName", "email"];
        break;
      case 1:
        fieldsToValidate = ["companyName", "position", "businessType", "industry"];
        break;
      case 2:
        // Optional fields, no validation required
        break;
    }

    if (fieldsToValidate.length > 0) {
      const isValid = await trigger(fieldsToValidate);
      if (!isValid) return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFormSubmit = async (data: IBrandUpdateData) => {
    setIsSubmitting(true);
    setFieldErrors({});

    try {
      const isValid = await trigger();
      if (!isValid) {
        setIsSubmitting(false);
        return;
      }

      // Use the current form data and ensure all required fields are present
      const currentFormData = getValues();

      // Validate the data before sending to API
      try {
        brandFormDataSchema.parse(currentFormData);
      } catch (validationError) {
        console.error("Validation error:", validationError);
        throw validationError;
      }

      const returnData = await brandUpdateDataRoute(
        currentFormData as IBrandUpdateData,
        access_token,
        _id
      );

      if (returnData.status === "success") {
        setIsSuccess(true);
        toast({
          title: "Profile Updated Successfully!",
          description: "Your brand profile information has been updated.",
          className: "bg-green-50 border-green-200 text-green-800",
        });

        // Update session data
        if (session) {
          await update({
            ...session,
            user: {
              ...session.user,
              ...returnData.data.data,
            },
          });
        }

        // Call success callback after a delay
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 2000);
        }
      } else {
        throw new Error(returnData.message || "Update failed");
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);

      let errorMessage = "An error occurred while updating your profile.";
      let showFieldError = false;

      // Handle different types of errors
      if (error instanceof ZodError) {
        // Handle Zod validation errors
        const fieldErrors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(", ");
        errorMessage = `Validation failed: ${fieldErrors}`;
      } else if (error?.message) {
        const message = error.message.toLowerCase();

        // Check for duplicate email errors
        if (message.includes('email') && (message.includes('already') || message.includes('exists') || message.includes('duplicate') || message.includes('taken'))) {
          setFieldErrors({ email: "This email address is already registered. Please use a different email." });
          errorMessage = "Email address is already in use";
          showFieldError = true;
        }
        // Check for duplicate username errors
        else if (message.includes('username') && (message.includes('already') || message.includes('exists') || message.includes('duplicate') || message.includes('taken'))) {
          setFieldErrors({ username: "This username is already taken. Please choose a different username." });
          errorMessage = "Username is already in use";
          showFieldError = true;
        }
        // Check for other validation errors
        else if (message.includes('validation') || message.includes('invalid')) {
          errorMessage = error.message;
        }
        // Generic API error
        else {
          errorMessage = error.message;
        }
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      // Only show toast if we're not showing field-specific errors
      if (!showFieldError) {
        toast({
          title: "Update Failed",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        // Show a more subtle toast for field errors since the field will show the specific error
        toast({
          title: "Please check your input",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Updated!</h2>
        <p className="text-gray-600">Your brand profile has been successfully updated.</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Step Indicator */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                index <= currentStep
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-400 border-gray-300"
              }`}
            >
              {index < currentStep ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                step.icon
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-16 h-0.5 mx-2 transition-all duration-300 ${
                  index < currentStep ? "bg-black" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Title */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {steps[currentStep].title}
        </h2>
        <p className="text-gray-600">{steps[currentStep].description}</p>
      </div>

      {/* Form Content */}
      <Form {...form}>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 1: Personal Information */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        {...register("firstName")}
                        placeholder="Enter your first name"
                        className={`w-full p-3 rounded-lg border transition-all duration-300 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black ${
                          errors.firstName || fieldErrors.firstName
                            ? "border-red-500 bg-red-50/50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      />
                      {(errors.firstName || fieldErrors.firstName) && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.firstName?.message || fieldErrors.firstName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        {...register("lastName")}
                        placeholder="Enter your last name"
                        className={`w-full p-3 rounded-lg border transition-all duration-300 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black ${
                          errors.lastName || fieldErrors.lastName
                            ? "border-red-500 bg-red-50/50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      />
                      {(errors.lastName || fieldErrors.lastName) && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.lastName?.message || fieldErrors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      {...register("email")}
                      type="email"
                      placeholder="Enter your email address"
                      className={`w-full p-3 rounded-lg border transition-all duration-300 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black ${
                        errors.email || fieldErrors.email
                          ? "border-red-500 bg-red-50/50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    />
                    {(errors.email || fieldErrors.email) && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email?.message || fieldErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      {...register("phoneNumber")}
                      type="tel"
                      placeholder="Enter your phone number"
                      className={`w-full p-3 rounded-lg border transition-all duration-300 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black ${
                        errors.phoneNumber
                          ? "border-red-500 bg-red-50/50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    />
                    {errors.phoneNumber && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.phoneNumber.message}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Company Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name *
                    </label>
                    <input
                      {...register("companyName")}
                      placeholder="Enter your company name"
                      className={`w-full p-3 rounded-lg border transition-all duration-300 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black ${
                        errors.companyName
                          ? "border-red-500 bg-red-50/50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    />
                    {errors.companyName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.companyName.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Position *
                      </label>
                      <input
                        {...register("position")}
                        placeholder="e.g., Marketing Manager"
                        className={`w-full p-3 rounded-lg border transition-all duration-300 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black ${
                          errors.position
                            ? "border-red-500 bg-red-50/50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      />
                      {errors.position && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.position.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Type *
                      </label>
                      <select
                        {...register("businessType")}
                        className={`w-full p-3 rounded-lg border transition-all duration-300 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black ${
                          errors.businessType
                            ? "border-red-500 bg-red-50/50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <option value="">Select Business Type</option>
                        <option value="SME">SME</option>
                        <option value="Corporate">Corporate</option>
                        <option value="Start-up">Start-up</option>
                      </select>
                      {errors.businessType && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.businessType.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry *
                    </label>
                    <select
                      {...register("industry")}
                      className={`w-full p-3 rounded-lg border transition-all duration-300 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black ${
                        errors.industry
                          ? "border-red-500 bg-red-50/50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <option value="">Select Industry</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Beauty & Skincare">Beauty & Skincare</option>
                      <option value="Technology & Gadgets">Technology & Gadgets</option>
                      <option value="Food & Beverage">Food & Beverage</option>
                      <option value="Health & Wellness">Health & Wellness</option>
                      <option value="Travel & Hospitality">Travel & Hospitality</option>
                      <option value="Parenting & Family">Parenting & Family</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.industry && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.industry.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Website
                    </label>
                    <input
                      {...register("companyWebsite")}
                      type="url"
                      placeholder="https://www.yourcompany.com"
                      className={`w-full p-3 rounded-lg border transition-all duration-300 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black ${
                        errors.companyWebsite
                          ? "border-red-500 bg-red-50/50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    />
                    {errors.companyWebsite && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.companyWebsite.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Logo URL
                    </label>
                    <input
                      {...register("logo")}
                      type="url"
                      placeholder="https://www.yourcompany.com/logo.png"
                      className={`w-full p-3 rounded-lg border transition-all duration-300 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black ${
                        errors.logo
                          ? "border-red-500 bg-red-50/50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    />
                    {errors.logo && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.logo.message}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Social & Contact */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      {...register("bio")}
                      rows={4}
                      placeholder="Tell us about your brand and what makes it unique..."
                      className={`w-full p-3 rounded-lg border transition-all duration-300 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black resize-none ${
                        errors.bio
                          ? "border-red-500 bg-red-50/50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    />
                    {errors.bio && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.bio.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Social Media</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Instagram
                        </label>
                        <input
                          {...register("socialMedia.instagram")}
                          placeholder="@yourcompany"
                          className="w-full p-3 rounded-lg border transition-all duration-300 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black border-gray-300 hover:border-gray-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Facebook
                        </label>
                        <input
                          {...register("socialMedia.facebook")}
                          placeholder="facebook.com/yourcompany"
                          className="w-full p-3 rounded-lg border transition-all duration-300 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black border-gray-300 hover:border-gray-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          LinkedIn
                        </label>
                        <input
                          {...register("socialMedia.linkedin")}
                          placeholder="linkedin.com/company/yourcompany"
                          className="w-full p-3 rounded-lg border transition-all duration-300 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black border-gray-300 hover:border-gray-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Twitter
                        </label>
                        <input
                          {...register("socialMedia.twitter")}
                          placeholder="@yourcompany"
                          className="w-full p-3 rounded-lg border transition-all duration-300 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black border-gray-300 hover:border-gray-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Payment Method
                        </label>
                        <select
                          {...register("paymentDetails.method")}
                          className="w-full p-3 rounded-lg border transition-all duration-300 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black border-gray-300 hover:border-gray-400"
                        >
                          <option value="">Select Payment Method</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="Credit Card">Credit Card</option>
                          <option value="PayPal">PayPal</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Billing Information
                        </label>
                        <input
                          {...register("paymentDetails.billingInfo")}
                          placeholder="Billing address or account details"
                          className="w-full p-3 rounded-lg border transition-all duration-300 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black border-gray-300 hover:border-gray-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <div className="flex space-x-3">
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  className="px-6 py-3 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              )}
              
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="px-6 py-3 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300"
              >
                Cancel
              </Button>
            </div>

            <div>
              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 bg-black text-white hover:bg-gray-800 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-black text-white hover:bg-gray-800 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    "Update Profile"
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
