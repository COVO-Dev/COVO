import {
  useState,
} from "react"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import LocationSelector from "@/components/ui/location-input"
import {
  PhoneInput
} from "@/components/ui/phone-input";
import useControlledField from "@/utils/useControlledField"

export default function StepThreeAdditionalInfo({ control, setValue, getValues, resetField }) {
  // const { selectedPlatforms } = useAppSelector(state => state.influencerAdditionalInfo)
  // const [platformAuthUrl, setPlatformAuthUrl] = useState([])
  const [countryName, setCountryName] = useState<string>('')
  const [stateName, setStateName] = useState<string>('')

  const profilePicture = useControlledField("profilePicture", control);
  const location = useControlledField("location", control);
  const locationCountry = useControlledField("location.country", control);
  const locationState = useControlledField("location.city", control);
  const phoneNumber = useControlledField("phoneNumber", control);

  // const onChange = (currentStep) => {
  //   // eslint-disable-next-line no-console
  //   console.log('onChange:', currentStep);
  //   setCurrentStep(currentStep);
  // };


  return (
    <div className="flex flex-col gap-4">
      {/* <FormField
        control={control}
        name={profilePicture.name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Profile Picture</FormLabel>
            <FormControl>
              <Input
                placeholder="URL"

                type=""
                {...field} />
            </FormControl>
            <FormDescription>Enter your profile picture URL</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      /> */}

      <FormField
        control={control}
        name={location.name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location</FormLabel>
            <FormControl>
              <LocationSelector
                onCountryChange={(country) => {
                  setCountryName(country?.name || '')
                  setValue(locationCountry.name, country?.name ?? '')
                }}
                onStateChange={(state) => {
                  setStateName(state?.name || '')
                  console.log(state?.name);
                  setValue(locationState.name, state?.name)
                }}
                {...field}
              />
            </FormControl>
            <FormDescription>If your country has states, it will be appear after selecting country</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={phoneNumber.name}
        render={({ field }) => (
          <FormItem className="flex flex-col items-start">
            <FormLabel>Phone number</FormLabel>
            <FormControl className="w-full">
              <PhoneInput
                placeholder="Placeholder"
                {...field}
                defaultCountry="TR"
              />
            </FormControl>
            <FormDescription>Enter your phone number.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* <div className="flex flex-col gap-2  ">
        <div className=" px-[1em] md:px-[2em] lg:px-[3em] flex flex-col items-center">
          <div className='flex flex-col gap-2 w-[60%] justify-center items-center'>
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
      </div> */}


    </div>
  )
}