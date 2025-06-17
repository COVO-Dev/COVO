"use client";

import Steps, { Step } from "rc-steps";
import "rc-steps/assets/index.css";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import UpdateInformationStepOne from "./step-one/UpdateInformationStepOne.component";
import UpdateInformationStepTwo from "./step-two/UpdateInformationStepTwo.component";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { Form } from "@/components/ui/form";
import { useForm, useWatch } from "react-hook-form";
import {
  IInfluencerFullUpdateData,
  influencerFullUpdateDataSchema,
} from "@/lib/api/update-data/influencer/influencerFullUpdateData.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import IInfluencerUpdate from "./UpdateInformationForm.model";
import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, FileCog } from "lucide-react";
import { setProfileData } from "@/lib/store/profile/profile.slice";
import { influencerFullUpdateDataRoute } from "@/lib/api/update-data/influencer/influencerFullUpdateData.route";

export default function UpdateInformationForm({
  influencerData,
}: IInfluencerUpdate) {
  // const [platformAuthUrl, setPlatformAuthUrl] = useState([]);
  const dispatch = useAppDispatch();
  const [currentStep, setCurrentStep] = useState(0);
  const formData = influencerData;
  const { data: session } = useSession();
  const reduxProfileData = useAppSelector((state) => state.profile);
  const { _id, access_token } = reduxProfileData;
  const router = useRouter();

  const {
    // selectedPlatforms,
    // profilePicture,
    firstName,
    lastName,
    email,
    username,
    personalBio,
    phoneNumber,
    location,
    consentAndAgreements,
    contentAndAudience,
  } = influencerFullUpdateDataSchema.shape;

  const stepSchemas = [
    {
      schema: z.object({
        firstName,
        lastName,
        email,
        username,
        personalBio,
        phoneNumber,
        location,
      }),
    },
    {
      schema: z.object({
        consentAndAgreements,
        contentAndAudience,
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
    formState,
    ...rest
  } = useForm<Partial<IInfluencerFullUpdateData>>({
    resolver: zodResolver(stepSchemas[currentStep].schema),
    defaultValues: formData,
  });
  const values = useWatch({ control });

  console.log("formData:", values);

  const steps = [
    {
      title: "Personal Information",
      content: (
        <UpdateInformationStepOne
          control={control}
          setValue={setValue}
          getValues={getValues}
          resetField={resetField}
          // values={getValues()}
        />
      ),
      description: "Related to you",
      icon: <User />,
    },
    {
      title: "Content and Audience",
      content: (
        <UpdateInformationStepTwo
          control={control}
          setValue={setValue}
          getValues={getValues}
          resetField={resetField}
          // values={getValues()}
        />
      ),
      description: "Content and focus",
      icon: <FileCog />,
    },
  ];

  useEffect(() => {
    dispatch(setProfileData(values));
  }, [values, dispatch]);

  // console.log("reduxProfileData: \n", reduxProfileData);

  const nextStep = async () => {
    const isValid = await trigger();

    if (isValid) {
      const currentStepSchema = stepSchemas[currentStep].schema;
      // console.log(currentStepSchema.safeParse(formData));
      // console.log(formData);

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

    const returnData = await influencerFullUpdateDataRoute(
      formData,
      access_token,
      _id
    );
    // console.log("Returned Data from server: ", returnData);

    if (returnData.status === "success") {
      console.log("profile redux: ", reduxProfileData);
      // router.push('/influencer/oauth');
      toast({
        title: "Data Updated!",
        description: "You data was updated successfully",
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
        console.log(
          "profile redux: ",
          reduxProfileData,
          reduxProfileData.access_token
        );
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
    // console.log('onChange:', currentStep);
    setCurrentStep(currentStep);
  };

  const containerStyle = {
    border: "1px solid rgb(235, 237, 240) ",
    padding: "px-[2em]",
    marginBottom: 24,
  };

  return (
    <div className="flex flex-col items-center w-full bg-opacity-80 bg-gray-100 h-[calc(100vh-270px)] gap-4 rounded-2xl pointer-events-auto ">
      <Steps
        style={containerStyle}
        className="w-[5em] "
        type="navigation"
        current={currentStep}
        onChange={onChange}
        items={steps.map(({ title, description, icon }) => ({
          title,
          description,
          icon,
        }))}
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
        <ScrollArea className="w-full h-[calc(100vh-270px)]">
          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className="space-y-8 max-w-3xl w-[80%] mx-auto"
          >
            {/* {currentStep > 0 && <Button onClick={prevStep}>Somethihg</Button>} */}
            {steps[currentStep].content}
          </form>
        </ScrollArea>
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
