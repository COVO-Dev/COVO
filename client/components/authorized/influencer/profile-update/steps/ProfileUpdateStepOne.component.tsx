"use client";

import { useEffect, useState } from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import useControlledField from "@/utils/useControlledField";
import LocationSelector from "@/components/ui/location-input-custom";
import { PhoneInput } from "@/components/ui/phone-input";

interface ProfileUpdateStepOneProps {
  control: any;
  setValue: any;
  getValues: any;
  resetField: any;
  fieldErrors?: Record<string, string>;
  onClearFieldError?: (fieldName: string) => void;
}

export default function ProfileUpdateStepOne({
  control,
  setValue,
  getValues,
  resetField,
  fieldErrors = {},
  onClearFieldError
}: ProfileUpdateStepOneProps) {
  const [countryName, setCountryName] = useState("");
  const [stateName, setStateName] = useState("");

  // Controlled fields
  const firstName = useControlledField("firstName", control);
  const lastName = useControlledField("lastName", control);
  const email = useControlledField("email", control);
  const username = useControlledField("username", control);
  const personalBio = useControlledField("personalBio", control);
  const phoneNumber = useControlledField("phoneNumber", control);
  const location = useControlledField("location", control);
  const locationCountry = useControlledField("location.country", control);
  const locationState = useControlledField("location.city", control);

  // Initialize location values
  useEffect(() => {
    const currentLocation = getValues("location");
    if (currentLocation) {
      setCountryName(currentLocation.country || "");
      setStateName(currentLocation.city || "");
    }
  }, [getValues]);

  return (
    <div className="space-y-6">
      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name={firstName.name}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                First Name *
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your first name"
                  type="text"
                  {...field}
                  className="w-full px-4 py-3 rounded-xl border bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300 border-gray-200 hover:border-gray-300"
                />
              </FormControl>
              <FormMessage className="text-red-600 text-sm mt-1" />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={lastName.name}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                Last Name *
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your last name"
                  type="text"
                  {...field}
                  className="w-full px-4 py-3 rounded-xl border bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300 border-gray-200 hover:border-gray-300"
                />
              </FormControl>
              <FormMessage className="text-red-600 text-sm mt-1" />
            </FormItem>
          )}
        />
      </div>

      {/* Email and Username */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name={email.name}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                Email Address *
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="example@email.com"
                  type="email"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    if (fieldErrors.email && onClearFieldError) {
                      onClearFieldError('email');
                    }
                  }}
                  className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300 ${
                    fieldErrors.email
                      ? "border-red-300 hover:border-red-400 focus:ring-red-500"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                />
              </FormControl>
              {fieldErrors.email && (
                <div className="text-red-600 text-sm mt-1 font-medium">
                  {fieldErrors.email}
                </div>
              )}
              <FormMessage className="text-red-600 text-sm mt-1" />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={username.name}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                Username *
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="your_username"
                  type="text"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    if (fieldErrors.username && onClearFieldError) {
                      onClearFieldError('username');
                    }
                  }}
                  className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300 ${
                    fieldErrors.username
                      ? "border-red-300 hover:border-red-400 focus:ring-red-500"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                />
              </FormControl>
              {fieldErrors.username && (
                <div className="text-red-600 text-sm mt-1 font-medium">
                  {fieldErrors.username}
                </div>
              )}
              <FormDescription className="text-gray-500 text-sm mt-1">
                This is your public display name.
              </FormDescription>
              <FormMessage className="text-red-600 text-sm mt-1" />
            </FormItem>
          )}
        />
      </div>

      {/* Bio */}
      <FormField
        control={control}
        name={personalBio.name}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">
              Personal Bio
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Tell the world about yourself and your content..."
                className="resize-none w-full px-4 py-3 rounded-xl border bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300 border-gray-200 hover:border-gray-300 min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormDescription className="text-gray-500 text-sm mt-1">
              Share what makes you unique as a content creator.
            </FormDescription>
            <FormMessage className="text-red-600 text-sm mt-1" />
          </FormItem>
        )}
      />

      {/* Phone Number */}
      <FormField
        control={control}
        name={phoneNumber.name}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">
              Phone Number *
            </FormLabel>
            <FormControl>
              <div className="relative">
                <PhoneInput
                  placeholder="Enter your phone number"
                  {...field}
                  defaultCountry="US"
                  className="w-full"
                />
              </div>
            </FormControl>
            <FormDescription className="text-gray-500 text-sm mt-1">
              Include country code for international numbers.
            </FormDescription>
            <FormMessage className="text-red-600 text-sm mt-1" />
          </FormItem>
        )}
      />

      {/* Location */}
      <FormField
        control={control}
        name={location.name}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">
              Location *
            </FormLabel>
            <FormControl>
              <div className="space-y-2">
                <LocationSelector
                  valueCountry={countryName}
                  valueState={stateName}
                  onCountryChange={(country) => {
                    setCountryName(country?.name || "");
                    setValue(locationCountry.name, country?.name ?? "");
                    // Reset state when country changes
                    setStateName("");
                    setValue(locationState.name, "");
                  }}
                  onStateChange={(state) => {
                    setStateName(state?.name || "");
                    setValue(locationState.name, state?.name || "");
                  }}
                  {...field}
                />
              </div>
            </FormControl>
            <FormDescription className="text-gray-500 text-sm mt-1">
              Select your country and state/city for better collaboration matching.
            </FormDescription>
            <FormMessage className="text-red-600 text-sm mt-1" />
          </FormItem>
        )}
      />
    </div>
  );
}
