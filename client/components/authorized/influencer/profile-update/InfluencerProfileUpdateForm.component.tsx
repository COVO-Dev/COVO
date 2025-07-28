"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { z, ZodError } from "zod";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { Form } from "@/components/ui/form";
import { useForm, useWatch } from "react-hook-form";
import {
  IInfluencerFullUpdateData,
  influencerFullUpdateDataSchema,
} from "@/lib/api/update-data/influencer/influencerFullUpdateData.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import IInfluencerUpdate from "../update-info/UpdateInformationForm.model";
import { setProfileData } from "@/lib/store/profile/profile.slice";
import { influencerFullUpdateDataRoute } from "@/lib/api/update-data/influencer/influencerFullUpdateData.route";
import ProfileUpdateStepOne from "./steps/ProfileUpdateStepOne.component";
import UpdateInformationStepTwo from "../update-info/step-two/UpdateInformationStepTwo.component";
import { User, FileCog, CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface InfluencerProfileUpdateFormProps {
  influencerData: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function InfluencerProfileUpdateForm({
  influencerData,
  onSuccess,
  onCancel,
}: InfluencerProfileUpdateFormProps) {
  const { data: session, update } = useSession();
  const dispatch = useAppDispatch();
  const reduxProfileData = useAppSelector((state) => (state.profile as any)?.profileData);

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Don't render the form if we don't have influencer data yet
  if (!influencerData) {
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
  const rawFormData = influencerData?.influencerData || influencerData || {};

  // Memoize formData to prevent infinite re-renders
  const formData = useMemo(() => ({
    firstName: rawFormData.firstName || "",
    lastName: rawFormData.lastName || "",
    email: rawFormData.email || session?.user?.email || "",
    username: rawFormData.username || "",
    personalBio: rawFormData.personalBio || "",
    phoneNumber: rawFormData.phoneNumber || "",
    location: {
      country: rawFormData.location?.country || "",
      city: rawFormData.location?.city || "",
    },
    contentAndAudience: {
      primaryNiche: rawFormData.contentAndAudience?.primaryNiche || "",
      secondaryNiche: rawFormData.contentAndAudience?.secondaryNiche || "",
      contentSpecialisation: rawFormData.contentAndAudience?.contentSpecialisation || "",
      brandGifting: rawFormData.contentAndAudience?.brandGifting || false,
      paidCollaborationsOnly: rawFormData.contentAndAudience?.paidCollaborationsOnly || false,
    },
    consentAndAgreements: {
      termsAccepted: rawFormData.consentAndAgreements?.termsAccepted || false,
      marketingOptIn: rawFormData.consentAndAgreements?.marketingOptIn || false,
      dataComplianceConsent: rawFormData.consentAndAgreements?.dataComplianceConsent || false,
    },
  }), [rawFormData, session?.user?.email]);

  // Use the full schema for the form
  const form = useForm<Partial<IInfluencerFullUpdateData>>({
    resolver: zodResolver(influencerFullUpdateDataSchema),
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
    formState: { errors },
  } = form;

  const values = useWatch({ control });

  // Define clearFieldError function before it's used
  const clearFieldError = (fieldName: string) => {
    setFieldErrors((prev: Record<string, string>) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const steps = [
    {
      title: "Personal Information",
      content: (
        <ProfileUpdateStepOne
          control={control}
          setValue={setValue}
          getValues={getValues}
          resetField={resetField}
          fieldErrors={fieldErrors}
          onClearFieldError={clearFieldError}
        />
      ),
      description: "Basic details about you",
      icon: <User className="w-5 h-5" />,
    },
    {
      title: "Content and Audience",
      content: (
        <UpdateInformationStepTwo
          control={control}
          setValue={setValue}
          getValues={getValues}
          resetField={resetField}
        />
      ),
      description: "Your content focus and preferences",
      icon: <FileCog className="w-5 h-5" />,
    },
  ];

  useEffect(() => {
    dispatch(setProfileData(values));
  }, [values, dispatch]);

  const handleNext = async () => {
    // Define fields to validate for each step
    const stepFields = [
      ["firstName", "lastName", "email", "username", "phoneNumber", "location.country", "location.city"] as const,
      ["contentAndAudience.primaryNiche", "contentAndAudience.contentSpecialisation"] as const
    ];

    const fieldsToValidate = stepFields[currentStep];
    const isValid = await trigger(fieldsToValidate as any);

    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };



  const handleFormSubmit = async () => {
    setIsSubmitting(true);
    setFieldErrors({}); // Clear previous field errors

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
        influencerFullUpdateDataSchema.parse(currentFormData);
      } catch (validationError) {
        console.error("Validation error:", validationError);
        throw validationError;
      }

      const returnData = await influencerFullUpdateDataRoute(
        currentFormData as IInfluencerFullUpdateData,
        access_token,
        _id
      );

      if (returnData.status === "success") {
        setIsSuccess(true);
        toast({
          title: "Profile Updated Successfully!",
          description: "Your profile information has been updated.",
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
        <p className="text-gray-600">Your profile has been successfully updated.</p>
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
              {steps[currentStep].content}
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
