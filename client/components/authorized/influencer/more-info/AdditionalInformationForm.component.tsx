"use client";

import Steps, { Step } from "rc-steps";
import "rc-steps/assets/index.css";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import StepOneAdditionalInfo from "./StepOneAdditionalInfo.component";
import StepTwoAdditionalInfo from "./StepTwoAdditionalInfo.component";
import StepThreeAdditionalInfo from "./StepThreeAdditionalInfo.component";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { Form } from "@/components/ui/form";
import { useForm, useWatch } from "react-hook-form";
import { influencerFormDataSchema } from "@/lib/api/update-data/influencer/influencerUpdateData.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { IInfluencerAdditionalInfo } from "@/lib/store/additional-info/influencerAdditionalInfo.model";
import { setInfluencerAdditionalInfo } from "@/lib/store/additional-info/influencerAdditionalInfo.slice";
import { influencerUpdateDataRoute } from "@/lib/api/update-data/influencer/influencerUpdateData.route";
import { useRouter } from "next/navigation";

export default function AdditionalInformationForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const formData = useAppSelector((store) => store.influencerAdditionalInfo);
  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const { _id, access_token } = useAppSelector((state) => state.profile);
  const router = useRouter();

  const {
    // selectedPlatforms,
    // profilePicture,
    contentAndAudience,
    personalBio,
    location,
    phoneNumber,
    referralSource,
  } = influencerFormDataSchema.shape;

  const stepSchemas = [
    {
      schema: z.object({
        contentAndAudience,
        personalBio,
      }),
    },
    {
      schema: z.object({
        location,
        phoneNumber,
        // profilePicture,
        referralSource,
      }),
    },
  ];
  const {
    control,
    setValue,
    getValues,
    resetField,
    trigger,
    handleSubmit,
    ...rest
  } = useForm<IInfluencerAdditionalInfo>({
    resolver: zodResolver(stepSchemas[currentStep].schema),
    defaultValues: formData,
  });
  const values = useWatch({ control });

  const steps = [
    // {
    // 	title: "Social Media Information",
    // 	content: (
    // 		<StepOneAdditionalInfo
    // 			control={control}
    // 			setValue={setValue}
    // 			getValues={getValues}
    // 			resetField={resetField}
    // 		// values={getValues()}
    // 		/>
    // 	),
    // 	description: "Social details"
    // },
    {
      title: "Content and Audience",
      content: (
        <StepTwoAdditionalInfo
          control={control}
          setValue={setValue}
          getValues={getValues}
          resetField={resetField}
          // values={getValues()}
        />
      ),
      description: "Content and focus",
    },
    {
      title: "Personal Information",
      content: (
        <StepThreeAdditionalInfo
          control={control}
          setValue={setValue}
          getValues={getValues}
          resetField={resetField}
          platformAuthUrl={platformAuthUrl}
          // values={getValues()}
        />
      ),
      description: "Information regarding influencer",
    },
  ];

  useEffect(() => {
    dispatch(setInfluencerAdditionalInfo(values));
  }, [values, dispatch]);

  console.log(values);

  const nextStep = async () => {
    const isValid = await trigger();

    if (isValid) {
      const currentStepSchema = stepSchemas[currentStep].schema;
      console.log(currentStepSchema.safeParse(formData));
      console.log(formData);

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

    const returnData = await influencerUpdateDataRoute(
      formData,
      access_token,
      _id
    );
    console.log("Returned Data from server:", returnData);

    if (returnData.status === "success") {
      router.push("/influencer/oauth");
      toast({
        title: "Form submitted!",
        description: "Redirecting to OAuth Page",
      });
    } else {
      if (returnData.status === "Validation Error") {
        const errorArray = JSON.parse(returnData.message).map((message) => {
          const { message: msg, path } = message;
          const pathString = path.slice(-1);
          return `${pathString}: ${msg}\n`;
        });
        console.log(errorArray);
        toast({
          title: returnData.status.toUpperCase(),
          // description: returnData.message,
          description: errorArray,
          variant: "destructive",
        });
      } else {
        toast({
          title: returnData.status.toUpperCase(),
          description: returnData.message,
          // description: errorArray,
          variant: "destructive",
        });
      }
    }
  };

  const onChange = (currentStep) => {
    console.log("onChange:", currentStep);
    setCurrentStep(currentStep);
  };

  const containerStyle = {
    border: "1px solid rgb(235, 237, 240) ",
    padding: "px-[2em]",
    marginBottom: 24,
  };

  return (
    <div className="flex flex-col items-center">
      <Steps
        style={containerStyle}
        className="border-2 border-red-500"
        type="navigation"
        current={currentStep}
        onChange={onChange}
        items={steps.map(({ title, description }) => ({ title, description }))}
      />

      {/* Step Content */}
      <Form
        control={control}
        setValue={setValue}
        getValues={getValues}
        resetField={resetField}
        trigger={trigger}
        handleSubmit={handleSubmit}
        {...rest}
      >
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-8 max-w-3xl w-[80%] mx-auto py-10"
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
        {currentStep < steps.length - 1 ? (
          <Button onClick={nextStep}>Next</Button>
        ) : (
          <Button onClick={handleFormSubmit}>Submit</Button>
        )}
      </div>
    </div>
  );
}
