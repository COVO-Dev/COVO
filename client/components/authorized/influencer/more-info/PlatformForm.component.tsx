import LocationSelector from "@/components/ui/location-input"
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
  Input
} from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { setInfluencerAdditionalInfo, createPlatformData, updatePlatformData, updatePlatformDataDemographics } from "@/lib/store/additional-info/influencerAdditionalInfo.slice"
import { useState } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"

const PlatformForm = ({ control, platform, setValue, getValues }) => {
  const [countryName, setCountryName] = useState < string > ('')
  const [stateName, setStateName] = useState < string > ('')
  const dispatch = useAppDispatch();
  const selector = useAppSelector(store => store.influencerAdditionalInfo)

  return (
    <div>
      <div className="grid grid-cols-12 gap-4  w-[100%]">
      <div className="col-span-6">
        <FormField
          control={control}
          name={`platforms.${platform}.platformUsername`} // Dynamic name for userame
          render={({ field }) => (
            <FormItem>
              <FormLabel>Platform Username</FormLabel>
              <p>{field.name ?? "none"}</p>
              <FormControl>
                <Input
                  placeholder=""
                  type="text"
                  {...field}
                  onChange={(e) => {
                    console.log("fieldvalue: ", field.value, "\nfieldname: ", field.name);
                    field.onChange(e);
                  }}
                />
              </FormControl>
              <FormDescription>This is your public display name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="col-span-6  ">
        <FormField
          control={control}
          name={`platforms.${platform}.platformId`} // Dynamic name for platform ID
          render={({ field }) => (
            <FormItem>
              <FormLabel>Platform ID</FormLabel>
              <FormControl>
                <Input
                  placeholder=""
                  type="text"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                  }}
                />
              </FormControl>
              <FormDescription>This is your platform&apos;s ID</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>

      <div className="grid grid-cols-12 gap-4  ">
        <div className="col-span-6 ">
          <FormField
            control={control}
            name={`platforms.${platform}.demographics.age`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Type age"
                    type="number"
                    {...field}
                    onChange={(e) => {
                      console.log("input type for age value: ", e.target.value, typeof(e.target.value))
                      field.onChange(Number(e.target.value));
                    }}
                  />
                </FormControl>
                <FormDescription>Demographic&apos;s Age</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-6 ">
          <FormField
            control={control}
            name={`platforms.${platform}.demographics.gender`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select
                  {...field}
                  onValueChange={(e) => {
                    field.onChange(e);
                  }}
                  defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
                  <FormDescription>Demographic&apos;s gender</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className=" ">
        <FormField
          control={control}
          name={`platforms.${platform}.demographics.location`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Location</FormLabel>
              <FormControl>
              <LocationSelector
                onCountryChange={(country) => {
                  setCountryName(country?.name || '')
                  setValue(field.name, country?.name ?? '')
                }}
                onStateChange={(state) => {
                  setStateName(state?.name || '')
                  setValue(field.name, String(state?.country_name + ", " + state?.name))
                }}
              />
              </FormControl>
              <FormDescription>Select demographic&apos;s country</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
  </div>

  );
};

export default PlatformForm;