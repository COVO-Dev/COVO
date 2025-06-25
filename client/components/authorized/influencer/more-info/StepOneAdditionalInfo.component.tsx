// "use client"
// import {
//   useState,
//   useEffect
// } from "react"
// import {
//   Button
// } from "@/components/ui/button"
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form"
// import {
//   MultiSelector,
//   MultiSelectorContent,
//   MultiSelectorInput,
//   MultiSelectorItem,
//   MultiSelectorList,
//   MultiSelectorTrigger
// } from "@/components/ui/extension/multi-select"
// import {
//   Input
// } from "@/components/ui/input"
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue
// } from "@/components/ui/select"
// import LocationSelector from "@/components/ui/location-input"
// import useControlledField from "@/utils/useControlledField";
// import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
// import { setInfluencerAdditionalInfo, createPlatformData } from "@/lib/store/additional-info/influencerAdditionalInfo.slice"
// import Steps, { Step } from "rc-steps";
// import {
//   Facebook,
//   Twitter,
//   Instagram,
//   Youtube,
//   Ribbon
// } from "lucide-react"
// import PlatformForm from "./PlatformForm.component"

// export default function StepOneAdditionalInfo({ control, setValue, getValues, resetField }) {
//   const selectedPlatformsField = useControlledField("selectedPlatforms", control);
//   const { selectedPlatforms } = useAppSelector(state => state.influencerAdditionalInfo)
//   const [countryName, setCountryName] = useState<string>('')
//   const [stateName, setStateName] = useState<string>('')
//   const platformsField = useControlledField("platforms", control);
//   const [currentStep, setCurrentStep] = useState(0)

//   const stepsData = [
//     {
//       title: "Youtube",
//       name: "youtube",
//       content:
//         <PlatformForm
//           control={control}
//           platform="youtube"
//           setValue={setValue}
//           getValues={getValues}
//         />,
//       icon: <Youtube />,
//     },
//     {
//       title: "Tiktok",
//       name: "tiktok",
//       content:
//         <PlatformForm
//           control={control}
//           platform="tiktok"
//           setValue={setValue}
//           getValues={getValues}
//         />,
//       icon: <Ribbon />,
//     },
//     {
//       title: "Instagram",
//       name: "instagram",
//       content:
//         <PlatformForm
//           control={control}
//           platform="instagram"
//           setValue={setValue}
//           getValues={getValues}
//         />,
//       icon: <Instagram />,
//     },
//     {
//       title: "Facebook",
//       name: "facebook",
//       content:
//         <PlatformForm
//           control={control}
//           platform="facebook"
//           setValue={setValue}
//           getValues={getValues}
//         />,
//       icon: <Facebook />,
//     },
//     {
//       title: "Twitter",
//       name: "twitter",
//       content:
//         <PlatformForm
//           control={control}
//           platform="twitter"
//           setValue={setValue}
//           getValues={getValues}
//         />,
//       icon: <Twitter />,
//     },
//   ];

//   const filteredSteps = stepsData.filter((step) =>
//     selectedPlatforms.includes(step.name)
//   );

//   const dispatch = useAppDispatch();
//   console.log("currentStep: ", currentStep);

//   const onChange = (currentStep) => {
//     // eslint-disable-next-line no-console
//     console.log('onChange:', currentStep);
//     setCurrentStep(currentStep);
//   };

//   return (
//     <div className="flex flex-col gap-2  ">
//       <FormField
//         control={control}
//         name={selectedPlatformsField.name}
//         render={({ field }) => (
//           <FormItem>
//             <FormLabel>Select Platforms</FormLabel>
//             <FormControl>
//               <MultiSelector
//                 values={field.value}
//                 onValuesChange={(value) => {
//                   const { selectedPlatforms } = getValues()
//                   field.onChange(value);

//                   if (value.length < selectedPlatforms.length) {
//                     const poppedElement = [...new Set(value.concat(selectedPlatforms))]
//                     console.log(poppedElement.at(-1), "old Value: ", selectedPlatforms, "\n new Value", value);
//                     // setValue(`platforms.${poppedElement.at(-1)}`, {});
//                     resetField(`platforms.${poppedElement.at(-1)}`);
//                   }
//                   dispatch(createPlatformData({ platforms: value }))
//                   dispatch(setInfluencerAdditionalInfo({ selectedPlatforms: value }))
//                 }}
//                 loop
//                 className="max-w-lg"
//               >
//                 <MultiSelectorTrigger>
//                   <MultiSelectorInput placeholder="Select Platforms" />
//                 </MultiSelectorTrigger>
//                 <MultiSelectorContent>
//                   <MultiSelectorList>
//                     <MultiSelectorItem value={"youtube"}>Youtube</MultiSelectorItem>
//                     <MultiSelectorItem value={"tiktok"}>Tiktok</MultiSelectorItem>
//                     <MultiSelectorItem value={"instagram"}>Instagram</MultiSelectorItem>
//                     <MultiSelectorItem value={"facebook"}>Facebook</MultiSelectorItem>
//                     <MultiSelectorItem value={"twitter"}>Twitter</MultiSelectorItem>
//                   </MultiSelectorList>
//                 </MultiSelectorContent>
//               </MultiSelector>
//             </FormControl>
//             <FormDescription>Select multiple options.</FormDescription>
//             <FormMessage />
//           </FormItem>
//         )}
//       />

//       <div className="px-[2em]">
//         <Steps current={currentStep} onChange={onChange} items={filteredSteps} />
//       </div>
//       {filteredSteps.length > 0 && filteredSteps[currentStep]?.content}

//     </div>
//   )
// }


"use client"
import {
  useState,
  useEffect
} from "react"
import {
  Button
} from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger
} from "@/components/ui/extension/multi-select"
import {
  Input
} from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import LocationSelector from "@/components/ui/location-input"
import useControlledField from "@/utils/useControlledField";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { setInfluencerAdditionalInfo, createPlatformData } from "@/lib/store/additional-info/influencerAdditionalInfo.slice"
import Steps, { Step } from "rc-steps";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Ribbon
} from "lucide-react"
import PlatformForm from "./PlatformForm.component"
import { getYoutubeAuthUrlRoute } from "@/lib/api/get-auth-url/getYoutubeAuthUrl.route"
import { getFacebookAuthUrlRoute } from "@/lib/api/get-auth-url/getFacebookAuthUrl.route"
import { getInstagramAuthUrlRoute } from "@/lib/api/get-auth-url/getInstagramAuthUrl.route"
import { getTwitterAuthUrlRoute } from "@/lib/api/get-auth-url/getTwitterAuthUrl.route"
import OAuthSignUpButton from "../o-auth/SignUpButton.component"

export default function StepOneAdditionalInfo({ control, setValue, getValues, resetField }) {
  const selectedPlatformsField = useControlledField("selectedPlatforms", control);
  const { selectedPlatforms } = useAppSelector(state => state.influencerAdditionalInfo)
  const [platformAuthUrl, setPlatformAuthUrl] = useState([])
  const platformsField = useControlledField("platforms", control);
  const [currentStep, setCurrentStep] = useState(0)
  const { _id, access_token } = useAppSelector(state => state.profile);

  const stepsData = [
    {
      title: "Youtube",
      name: "youtube",
      content:
        <PlatformForm
          control={control}
          platform="youtube"
          setValue={setValue}
          getValues={getValues}
        />,
      icon: <Youtube />,
    },
    {
      title: "Tiktok",
      name: "tiktok",
      content:
        <PlatformForm
          control={control}
          platform="tiktok"
          setValue={setValue}
          getValues={getValues}
        />,
      icon: <Ribbon />,
    },
    {
      title: "Instagram",
      name: "instagram",
      content:
        <PlatformForm
          control={control}
          platform="instagram"
          setValue={setValue}
          getValues={getValues}
        />,
      icon: <Instagram />,
    },
    {
      title: "Facebook",
      name: "facebook",
      content:
        <PlatformForm
          control={control}
          platform="facebook"
          setValue={setValue}
          getValues={getValues}
        />,
      icon: <Facebook />,
    },
    {
      title: "Twitter",
      name: "twitter",
      content:
        <PlatformForm
          control={control}
          platform="twitter"
          setValue={setValue}
          getValues={getValues}
        />,
      icon: <Twitter />,
    },
  ];

  const filteredSteps = stepsData.filter((step) =>
    selectedPlatforms.includes(step.name)
  );

  useEffect(() => {
    async function getAllAuthUrls(token) {
      const PlatformFunctionObject = {
        'youtube': getYoutubeAuthUrlRoute,
        'facebook': getFacebookAuthUrlRoute,
        // 'tiktok': getTiktokAuthUrl(),
        'instagram': getInstagramAuthUrlRoute,
        'twitter': getTwitterAuthUrlRoute,
      }

      if (token) {
        const urlArray = []

        for (const step in PlatformFunctionObject) {
          const functionAsync = PlatformFunctionObject[step]
          const result = await functionAsync(token);
          if (result.status === 'success') {
            const resultObject = {
              [step]: result.data.authUrl
            }
            console.log("url Result: ", result.data.authUrl)
            urlArray.push(resultObject);
          } else {
            console.log(result)
          }
        }
        setPlatformAuthUrl(urlArray);
      }

    }
    getAllAuthUrls(access_token);
  }, [access_token])

  console.log('platformAuthUrl: ', platformAuthUrl);
  const dispatch = useAppDispatch();
  console.log("currentStep: ", currentStep);

  const onChange = (currentStep) => {
    // eslint-disable-next-line no-console
    console.log('onChange:', currentStep);
    setCurrentStep(currentStep);
  };

  return (
    <div className="flex flex-col gap-2  ">
      <FormField
        control={control}
        name={selectedPlatformsField.name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Select Platforms</FormLabel>
            <FormControl>
              <MultiSelector
                values={field.value}
                onValuesChange={(value) => {
                  const { selectedPlatforms } = getValues()
                  field.onChange(value);

                  if (value.length < selectedPlatforms.length) {
                    const poppedElement = [...new Set(value.concat(selectedPlatforms))]
                    console.log(poppedElement.at(-1), "old Value: ", selectedPlatforms, "\n new Value", value);
                    // setValue(`platforms.${poppedElement.at(-1)}`, {});
                    resetField(`platforms.${poppedElement.at(-1)}`);
                  }
                  dispatch(createPlatformData({ platforms: value }))
                  dispatch(setInfluencerAdditionalInfo({ selectedPlatforms: value }))
                }}
                loop
                className="max-w-lg"
              >
                <MultiSelectorTrigger>
                  <MultiSelectorInput placeholder="Select Platforms" />
                </MultiSelectorTrigger>
                <MultiSelectorContent>
                  <MultiSelectorList>
                    <MultiSelectorItem value={"youtube"}>Youtube</MultiSelectorItem>
                    <MultiSelectorItem value={"tiktok"}>Tiktok</MultiSelectorItem>
                    <MultiSelectorItem value={"instagram"}>Instagram</MultiSelectorItem>
                    <MultiSelectorItem value={"facebook"}>Facebook</MultiSelectorItem>
                    <MultiSelectorItem value={"twitter"}>Twitter</MultiSelectorItem>
                  </MultiSelectorList>
                </MultiSelectorContent>
              </MultiSelector>
            </FormControl>
            <FormDescription>Select multiple options.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* <div className="px-[2em]">
        <Steps current={currentStep} onChange={onChange} items={filteredSteps} />
      </div>
      {filteredSteps.length > 0 && filteredSteps[currentStep]?.content} */}

      <div className='flex flex-col gap-2 w-[50%]'>
        {platformAuthUrl.map((platform, index) => {
          const platformName = Object.keys(platform)[0]; // Get the key (platform name)
          const platformUrl = platform[platformName]; // Get the URL

          return (
            <OAuthSignUpButton
              key={index}
              platformName={platformName}
              platformUrl={platformUrl}
            />
          );
        })}
      </div>


    </div>
  )
}