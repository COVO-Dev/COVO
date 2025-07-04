'use client';

import React, { useEffect, useState } from "react";
import Steps from "rc-steps";
import "rc-steps/assets/index.css";
import CampaignFormStepOne from "./step-one/StepOneForm.component";
import CampaignFormStepTwo from "./step-two/StepTwoCampaignForm.component";
import CampaignFormStepThree from "./step-three/StepThreeCampaignForm.component";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import { useAppSelector } from '@/lib/store/hooks';
import { campaignDataRoute } from '@/lib/api/campaign/create-campaign/createCampaign.route';
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { campaignSchema, ICampaign } from "@/lib/api/campaign/create-campaign/createCampaign.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from 'next/navigation';


export default function CreateCampaignForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const { id: brandId, access_token } = useAppSelector(state => state.profile);
  const router = useRouter();
  
  const initialValues: ICampaign = {
    // Step 1
    title: "",
    startDate: new Date(),
    endDate: new Date(),
    budgetRange: 0,
    targetAudience: "",
    // Step 2
    primaryGoals: [],
    influencerType: "",
    geographicFocus: "",
    collaborationPreferences: {
      hasWorkedWithInfluencers: false,
      exclusiveCollaborations: false,
      type: "",
      styles: [],
    },
    // Step 3
    trackingAndAnalytics: {
      performanceTracking: true,
      metrics: [],
      reportFrequency: "",
    },
    status: "",
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

  const stepSchemas = [
    {
      schema: z.object({
        // startDate: z.date(),
        // endDate: z.date(),
        startDate,
        endDate,
        title,
        budgetRange,
        targetAudience
      }).refine((data) => {
        const { startDate, endDate } = data;
        return endDate > startDate;
      }, {
        message: "End date must be after start date",
        path: ["endDate"],
      }),
    },
    {
      schema: z.object({
        primaryGoals,
        influencerType,
        geographicFocus,
        collaborationPreferences
      })
    },
    {
      schema: z.object({
        trackingAndAnalytics,
        status
      })
    },
  ];

  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    trigger,
    formState,
    ...restForm
  } = useForm<ICampaign>({
    resolver: zodResolver(stepSchemas[currentStep].schema),
    defaultValues: initialValues,
  });

  const formMethods = {
    control,
    handleSubmit,
    getValues,
    setValue,
    trigger,
    formState,
    ...restForm
  };


  useEffect(() => {
    // Form is already initialized with proper values
    // No need to set brandId as it's not part of ICampaign type
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
    {
      title: "Step 3",
      content: (
        <CampaignFormStepThree
          control={control}
        // values={form.getValues()}
        />
      ),
      // schema: stepSchemas[2].schema,
    },
  ];

  const nextStep = async () => {
    const isValid = await trigger();
    console.log(isValid);

    if (isValid) {
      const currentStepData = getValues();
      console.log("formState:", currentStepData);

      if (currentStep < stepSchemas.length - 1)
        setCurrentStep(currentStep + 1);

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
    // First validate the current step
    const currentStepIsValid = await trigger();
    
    if (!currentStepIsValid) {
      toast({
        title: "Validation Error",
        description: "Please fill out all required fields on this step before submitting.",
        variant: "destructive",
      });
      return;
    }

    // Check if brandId is available
    if (!brandId) {
      toast({
        title: "Authentication Error",
        description: "Brand ID is missing. Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }

    // Then validate the entire form data against the complete schema
    const formData = getValues();
    const fullValidation = campaignSchema.safeParse(formData);
    
    if (!fullValidation.success) {
      console.log("Full form validation errors:", fullValidation.error.issues);
      
      // Find which step has the error and show a more helpful message
      const errorMessages = fullValidation.error.issues.map(issue => {
        const fieldPath = issue.path.join('.');
        return `${fieldPath}: ${issue.message}`;
      }).join(', ');
      
      toast({
        title: "Form Validation Error",
        description: `Please check the following fields: ${errorMessages}`,
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Submitting form data:", formData);
      console.log("Brand ID:", brandId);
      console.log("Access token:", access_token ? "Present" : "Missing");
      
      // Add detailed logging for collaboration preferences
      console.log("Collaboration preferences being sent:", formData.collaborationPreferences);
      console.log("Collaboration type value:", JSON.stringify(formData.collaborationPreferences?.type));
      console.log("Collaboration type length:", formData.collaborationPreferences?.type?.length);
      
      const returnData = await campaignDataRoute(
        formData,
        access_token,
        brandId,
      );
      console.log("Returned Data from server:", returnData);

      if (returnData.status === 'success') {
        router.push('/brand/discover');
        toast({
          title: "Form submitted!",
          description: 'Redirecting to Campaigns'
        });
      } else {
        toast({
          title: "Error",
          description: returnData.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Submission Error",
        description: "There was an error submitting the form. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onChange = (currentStep: number) => {
    console.log('onChange:', currentStep);
    setCurrentStep(currentStep);
  };

  const containerStyle = {
    border: '1px solid rgb(235, 237, 240) ',
    padding: 'px-[2em]',
    marginBottom: 24,
  };

  return (
    <div className="flex flex-col items-center px-2">
      {/* Show error message if brandId is missing */}
      {!brandId && (
        <div className="flex flex-col items-center justify-center py-10 mb-8">
          <div className="text-center bg-red-50 border border-red-200 rounded-md p-6">
            <h2 className="text-2xl font-bold text-red-800 mb-4">Authentication Required</h2>
            <p className="text-red-600 mb-6">
              Brand ID is missing. Please refresh the page and try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )}
      
      <Steps
        style={containerStyle}
        className='border-2 border-red-500'
        type="navigation"
        current={currentStep}
        onChange={onChange}
        items={[
          {
            title: 'Step 1',
            // status: 'finish',
            // subTitle: '',
            description: "Campaign Description",
          },
          {
            title: 'Step 2',
            // status: 'process',
            description: "Influencer and collaboration preferences",
          },
          {
            title: 'Step 3',
            // status: 'wait',
            description: "Tracking preferences",
          },
        ]}
      />

      {/* Step Content */}
      <Form {...formMethods}>
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-8 max-w-3xl mx-auto py-10"
        >
          {steps[currentStep].content}
        </form>
      </Form>

      {/* Navigation Buttons */}
      <div className="flex flex-row justify-between w-[80%] px-[3em] ">
        <Button disabled={currentStep == 0} onClick={prevStep}>Prev</Button>
        {currentStep < steps.length - 1 ? (
          <Button onClick={nextStep}>Next</Button>
        ) : (
          <Button onClick={handleFormSubmit}>Submit</Button>
        )}
      </div>
    </div>
  );
}