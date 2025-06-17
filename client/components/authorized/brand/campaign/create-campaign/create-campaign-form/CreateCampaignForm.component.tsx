'use client';

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Steps, { Step } from "rc-steps";
import "rc-steps/assets/index.css";
import CampaignFormStepOne from "./step-one/StepOneForm.component";
import CampaignFormStepTwo from "./step-two/StepTwoCampaignForm.component";
import CampaignFormStepThree from "./step-three/StepThreeCampaignForm.component";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { campaignDataRoute } from '@/lib/api/campaign/create-campaign/createCampaign.route';
import { Form } from "@/components/ui/form";
import { useForm, useWatch } from "react-hook-form";
import { campaignSchema, ICampaign } from "@/lib/api/campaign/create-campaign/createCampaign.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Toaster } from "sonner";
import { resetFields, setProfileData } from "@/lib/store/profile/profile.slice";
import { set } from "date-fns";
import { setCampaignData } from "@/lib/store/campaign/campaign.slice";
import { useRouter } from 'next/navigation'; // Correct import


export default function CreateCampaignForm() {
  const [currentStep, setCurrentStep] = useState(0);
  // const formData = useAppSelector(state => state.campaign);

  const dispatch = useAppDispatch()
  const { data: session } = useSession();
  const { _id: brandId, access_token } = useAppSelector(state => state.profile);
  const initialValues = {
    brandId: brandId,
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
    ...restForm
  } = useForm<ICampaign>({
    resolver: zodResolver(stepSchemas[currentStep].schema),
    defaultValues: initialValues,
  });


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

  const formData = getValues();

  const nextStep = async () => {
    const isValid = await trigger();
    console.log(isValid);

    if (isValid) {
      const currentStepSchema = stepSchemas[currentStep].schema;
      const currentStepData = getValues();
      // dispatch(setCampaignData({ ...formData, brandId: _id }));
      console.log("formState:", currentStepData);
      console.log("store slice data: ", formData);

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
    const isValid = await trigger();
    console.log(isValid);

    try {
      // dispatch(setCampaignData({ ...formData, brandId: _id }));
      // console.log("Brand ID added: ", _id);
      // console.log("formData store: ", formData);
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
    console.log('onChange:', currentStep);
    setCurrentStep(currentStep);
  };

  const containerStyle = {
    border: '1px solid rgb(235, 237, 240) ',
    padding: 'px-[2em]',
    marginBottom: 24,
  };
  const description = 'This is a description.';

  return (
    <div className="flex flex-col items-center px-2">
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
      <Form {...restForm} control={control} trigger={trigger}  >
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