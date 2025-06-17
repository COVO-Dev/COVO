"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import useControlledField from "@/utils/useControlledField";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LocationSelector from "@/components/ui/location-input-custom";
// import LocationSelector from "@/components/ui/location-input"
import { PhoneInput } from "@/components/ui/phone-input";

export default function UpdateInformationStepOne({
  control,
  setValue,
  getValues,
  resetField,
}) {
  const defaultCountry = getValues("location.country");
  const defaultCity = getValues("location.city");
  const firstName = useControlledField("firstName", control);
  const lastName = useControlledField("lastName", control);
  const email = useControlledField("email", control);
  const username = useControlledField("username", control);
  const phoneNumber = useControlledField("phoneNumber", control);
  const personalBio = useControlledField("personalBio", control);
  const fileUpload = useControlledField("fileUpload", control);

  const location = useControlledField("location", control);
  const locationCountry = useControlledField("location.country", control);
  const locationState = useControlledField("location.city", control);
  const [countryName, setCountryName] = useState<string>(defaultCountry);
  const [stateName, setStateName] = useState<string>(defaultCity);

  // useEffect(() => {
  //   if (defaultCountry && defaultCity) {
  //     setValue(locationCountry.name, defaultCountry);
  //     setCountryName(defaultCountry);
  //     setValue(locationState.name, defaultCity);
  //     setStateName(defaultCity);
  //   }
  // }, [defaultCountry, defaultCity, locationCountry.name, locationState.name, setValue]);

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-6">
          <FormField
            control={control}
            name={firstName.name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-12 md:col-span-6">
          <FormField
            control={control}
            name={lastName.name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-6">
          <FormField
            control={control}
            name={email.name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="example@google.com"
                    type="email"
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-12 md:col-span-6">
          <FormField
            control={control}
            name={username.name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="example_username" type="" {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <FormField
        control={control}
        name={personalBio.name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bio</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Tell the world about you"
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormDescription>Add a personal bio</FormDescription>
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
              <PhoneInput placeholder="" {...field} defaultCountry="TR" />
            </FormControl>
            <FormDescription>Enter your phone number.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={location.name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location</FormLabel>
            <FormControl>
              <LocationSelector
                valueCountry={countryName}
                valueState={stateName}
                onCountryChange={(country) => {
                  setCountryName(country?.name || "");
                  setValue(locationCountry.name, country?.name ?? "");
                  // setCountryName(country?.name || '')
                  // setValue(locationCountry.name, countryName)
                }}
                onStateChange={(state) => {
                  setStateName(state?.name || "");
                  setValue(locationState.name, state?.name);
                  // setStateName(state?.name);
                  // setValue(locationState.name, stateName)
                }}
                {...field}
              />
            </FormControl>
            <FormDescription>
              If your country has states, it will be appear after selecting
              country
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
