"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Steps, { Step } from "rc-steps";
import "rc-steps/assets/index.css";
import CampaignFormStepOne from "./step-one/StepOneForm.component";
import CampaignFormStepTwo from "./step-two/StepTwoCampaignForm.component";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import { useAppSelector } from "@/lib/store/hooks";
import { campaignDataRoute } from "@/lib/api/campaign/create-campaign/createCampaign.route";
import { Form } from "@/components/ui/form";
import { useForm, useWatch } from "react-hook-form";
import {
  campaignSchema,
  ICampaign,
} from "@/lib/api/campaign/create-campaign/createCampaign.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Toaster } from "sonner";
import { resetFields, setProfileData } from "@/lib/store/profile/profile.slice";
import { set } from "date-fns";
import { useRouter } from "next/navigation"; // Correct import

export default function CreateCampaignForm() {
  const [currentStep, setCurrentStep] = useState(0);

  const { data: session } = useSession();
  const { _id: brandId, access_token } = useAppSelector(
    (state) => state.profile
  );
  const initialValues = {
    brandId: brandId,
    // Step 1
    title: "",
    startDate: new Date(),
    endDate: new Date(),
    budgetRange: "", // Changed to string to match Select component
    targetAudience: {
      // Changed to object to match new structure
      ageGroups: "",
      gender: "",
      incomeLevel: "",
      lifeStage: "",
      lifestyle: "",
      engagementLevel: "",
      platform: "",
    },
    // Step 2
    primaryGoals: "", // Changed to string to match Select/Input
    influencerType: "",
    geographicFocus: {
      // Changed to object to match LocationSelector
      country: "",
      city: "",
    },
    collaborationPreferences: {
      hasWorkedWithInfluencers: false,
      exclusiveCollaborations: false,
      type: "",
      styles: [],
    },
    // Fields moved from Step 3 to Step 2
    trackingAndAnalytics: {
      performanceTracking: true,
      metrics: [],
      reportFrequency: "",
    },
    status: "active",
    is_deleted: false,
  };

  // const { startDate, endDate, ...rest } = campaignSchema.shape;
  const {
    startDate,
    endDate,
    title,
    status,
    budgetRange,
    primaryGoals,
    targetAudience,
    influencerType,
    geographicFocus,
    trackingAndAnalytics,
    collaborationPreferences,
  } = campaignSchema.shape;
  // const {
  //   startDate,
  //   endDate,
  //   title,
  //   status,
  //   budgetRange,
  //   primaryGoals,
  //   targetAudience,
  //   influencerType,
  //   geographicFocus,
  //   trackingAndAnalytics,
  //   collaborationPreferences,
  // } = rest;
  const router = useRouter();

  const stepSchemas = [
    {
      schema: z
        .object({
          // startDate: z.date(),
          // endDate: z.date(),
          startDate,
          endDate,
          title,
          budgetRange,
          targetAudience,
        })
        .refine(
          (data) => {
            const { startDate, endDate } = data;
            return endDate > startDate;
          },
          {
            message: "End date must be after start date",
            path: ["endDate"],
          }
        ),
    },
    {
      schema: z.object({
        primaryGoals,
        influencerType,
        geographicFocus,
        collaborationPreferences,
        // NEW: Fields moved from Step 3
        trackingAndAnalytics,
        status,
      }),
    },
    // REMOVED: The schema for Step 3 is no longer needed
  ];

  // Store all form methods in a single object
  const formMethods = useForm<ICampaign>({
    resolver: zodResolver(stepSchemas[currentStep].schema),
    defaultValues: initialValues,
  });

  // Destructure for direct use within this component
  const { control, handleSubmit, getValues, setValue, trigger } = formMethods;

  useEffect(() => {
    if (access_token && brandId) {
      setValue("brandId", brandId);
    }
  }, [access_token, brandId, setValue]);

  const steps = [
    {
      title: "Step 1",
      content: (
        <CampaignFormStepOne
          control={control}
          // values={form.getValues()}
        />
      ),
      schema: stepSchemas[0].schema,
    },
    {
      title: "Step 2",
      content: (
        <CampaignFormStepTwo
          control={control}
          // values={form.getValues()}
        />
      ),
      schema: stepSchemas[1].schema,
    },
    // REMOVED: Step 3 is no longer a separate step
    // {
    //   title: "Step 3",
    //   content: (
    //     <CampaignFormStepThree
    //       control={control}
    //     // values={form.getValues()}
    //     />
    //   ),
    //   // schema: stepSchemas[2].schema,
    // },
  ];

  const formData = getValues();

  const nextStep = async () => {
    const isValid = await trigger();
    console.log(isValid);

    if (isValid) {
      const currentStepSchema = stepSchemas[currentStep].schema;
      const currentStepData = getValues();
      console.log("formState:", currentStepData);

      // Adjusted condition for next step as there are now only 2 steps
      if (currentStep < stepSchemas.length - 1) setCurrentStep(currentStep + 1);
    } else {
      toast({
        title: "Validation Error",
        description: "Please fill out all required fields before proceeding.",
        duration: 3000,
        variant: "destructive",
      });
    }

    return isValid.valueOf();
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFormSubmit = async () => {
    const isValid = await trigger();
    console.log(isValid);

    try {
      const returnData = await campaignDataRoute(
        formData,
        access_token,
        brandId
      );
      console.log("Returned Data from server:", returnData);

      if (returnData.status === "success") {
        router.push("/brand/discover");
        toast({
          title: "Form submitted!",
          description: "Redirecting to Campaigns",
        });
      } else {
        toast({
          title: "Error",
          // description: "There was an error submitting the form.",
          description: returnData.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Validation Error",
        description: "Please fill out all required fields before submitting.",
        variant: "destructive",
      });
    }
  };

  const onChange = (currentStep) => {
    // eslint-disable-next-line no-console
    console.log("onChange:", currentStep);
    setCurrentStep(currentStep);
  };

  const containerStyle = {
    border: "1px solid rgb(235, 237, 240) ",
    padding: "px-[2em]",
    marginBottom: 24,
  };
  const description = "This is a description.";

  return (
    <div className="flex flex-col items-center px-2">
      <Steps
        style={containerStyle}
        className="border-2 border-red-500"
        type="navigation"
        current={currentStep}
        onChange={onChange}
        items={[
          {
            title: "Step 1",
            // status: 'finish',
            // subTitle: '',
            description: "Campaign Description",
          },
          {
            title: "Step 2",
            // status: 'process',
            description: "Influencer and collaboration preferences", // Updated description
          },
          // REMOVED: Step 3 item is no longer needed
          // {
          //   title: 'Step 3',
          //   // status: 'wait',
          //   description: "Tracking preferences",
          // },
        ]}
      />

      {/* Step Content */}
      {/* Correctly set up FormProvider by spreading all methods */}
      <Form {...formMethods}>
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-8 max-w-3xl mx-auto py-10"
        >
          {/* {currentStep > 0 && <Button onClick={prevStep}>Somethihg</Button>} */}
          {steps[currentStep].content}
        </form>
      </Form>

      {/* Navigation Buttons */}
      <div className="flex flex-row justify-between w-[80%] px-[3em] ">
        <Button disabled={currentStep == 0} onClick={prevStep}>
          Prev
        </Button>
        {/* Adjusted condition for next step as there are now only 2 steps */}
        {currentStep < steps.length - 1 ? (
          <Button onClick={nextStep}>Next</Button>
        ) : (
          <Button onClick={handleFormSubmit}>Submit</Button>
        )}
      </div>
    </div>
  );
}
