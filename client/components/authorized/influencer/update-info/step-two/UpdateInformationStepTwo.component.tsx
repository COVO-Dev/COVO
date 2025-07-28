"use client";

import { useMemo } from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import useControlledField from "@/utils/useControlledField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface UpdateInformationStepTwoProps {
  control: any;
  setValue: any;
  getValues: any;
  resetField: any;
}

export default function UpdateInformationStepTwo({
  control,
  setValue,
  getValues,
  resetField
}: UpdateInformationStepTwoProps) {

  const nicheData = [
    ["Fashion", "Fashion"],
    ["Beauty & Skincare", "Beauty & Skincare"],
    ["Health & Wellness", "Health & Wellness"],
    ["Fitness & Sports", "Fitness & Sports"],
    ["Technology & Gadgets", "Technology & Gadgets"],
    ["Travel & Adventure", "Travel & Adventure"],
    ["Food & Beverage", "Food & Beverage"],
    ["Home & Lifestyle", "Home & Lifestyle"],
    ["Parenting & Family", "Parenting & Family"],
    ["Finance & Business", "Finance & Business"],
    ["Art & Design", "Art & Design"],
    ["Education & Learning", "Education & Learning"],
    ["Entertainment", "Entertainment (Movies, TV, Music)"],
    ["Gaming", "Gaming"],
    ["Sustainability & Eco-Living", "Sustainability & Eco-Living"],
    ["Automotive", "Automotive"],
    ["Pets & Animals", "Pets & Animals"],
    ["Personal Development & Motivation", "Personal Development & Motivation"],
    ["Other", "Other (for categories not listed)"],
  ]
  const specializationData = [
    ["Sponsored Posts", "Sponsored Posts"],
    ["Brand Partnerships", "Brand Partnerships"],
    ["Product Reviews", "Product Reviews"],
    ["Giveaways & Contests", "Giveaways & Contests"],
    ["Event Coverage", "Event Coverage"],
    ["Tutorials & How-To Guides", "Tutorials & How-To Guides"],
    ["Educational Content", "Educational Content"],
    ["Affiliate Marketing Content", "Affiliate Marketing Content"],
    ["Unboxings", "Unboxings"],
    ["Collaborations", "Collaborations (with other influencers)"],
    ["Vlogs", "Vlogs (Video Blogs)"],
    ["Live Streams", "Live Streams"],
    ["Challenges", "Challenges (e.g.TikTok or YouTube challenges)"],
    ["Lifestyle & Daily Routine Content", "Lifestyle & Daily Routine Content"],
    ["Interviews and Q&A Sessions", "Interviews and Q&A Sessions"],
    ["Testimonials", "Testimonials"],
    ["Behind the scenes content", "Behind - the - Scenes Content"],
    ["Other", "Other (for specializations not listed)"],
  ]
  const nicheItems = useMemo(() => {
    return (
      <SelectContent>
        {nicheData
          .slice(0, -1)
          .sort((a, b) => a[0][0].toLowerCase().localeCompare(b[0][0].toLowerCase()))
          .concat(nicheData.slice(-1))
          .map((contentArray) => {
            return (
              <SelectItem value={contentArray[0]} key={contentArray[0]}>{contentArray[1]}</SelectItem>
            )
          })}
      </SelectContent>
    )
  }, [nicheData])

  const specializationItems = useMemo(() => {
    return (
      <SelectContent>
        {specializationData
          .slice(0, -1)
          .sort((a, b) => a[0][0].toLowerCase().localeCompare(b[0][0].toLowerCase()))
          .concat(nicheData.slice(-1))
          .map((contentArray) => {
            return (
              <SelectItem value={contentArray[0]} key={contentArray[0]}>{contentArray[1]}</SelectItem>
            )
          })}
      </SelectContent>
    )
  }, [specializationData])

  const primaryNiche = useControlledField('contentAndAudience.primaryNiche', control);
  const secondaryNiche = useControlledField('contentAndAudience.secondaryNiche', control);
  const contentSpecialisation = useControlledField('contentAndAudience.contentSpecialisation', control);
  const brandGifting = useControlledField('contentAndAudience.brandGifting', control);
  const paidCollaborationsOnly = useControlledField('contentAndAudience.paidCollaborationsOnly', control);

  const termsAccepted = useControlledField('consentAndAgreements.termsAccepted', control);
  const marketingOptIn = useControlledField('consentAndAgreements.marketingOptIn', control);
  const dataComplianceConsent = useControlledField('consentAndAgreements.dataComplianceConsent', control);

  const isActive = useControlledField('isActive', control);

  // console.log('formValues in stepOne: \n', getValues());

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name={primaryNiche.name}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                Primary Niche *
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full px-4 py-3 rounded-xl border bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300 border-gray-200 hover:border-gray-300">
                    <SelectValue placeholder="Select your primary niche" />
                  </SelectTrigger>
                </FormControl>
                {nicheItems}
              </Select>
              <FormMessage className="text-red-600 text-sm mt-1" />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={secondaryNiche.name}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                Secondary Niche
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full px-4 py-3 rounded-xl border bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300 border-gray-200 hover:border-gray-300">
                    <SelectValue placeholder="Select secondary niche (optional)" />
                  </SelectTrigger>
                </FormControl>
                {nicheItems}
              </Select>
              <FormMessage className="text-red-600 text-sm mt-1" />
            </FormItem>
          )}
        />
      </div>

      {/* Content Specialization */}
      <FormField
        control={control}
        name={contentSpecialisation.name}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">
              Content Specialization *
            </FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="w-full px-4 py-3 rounded-xl border bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300 border-gray-200 hover:border-gray-300">
                  <SelectValue placeholder="Select your content specialization" />
                </SelectTrigger>
              </FormControl>
              {specializationItems}
            </Select>
            <FormDescription className="text-gray-500 text-sm mt-1">
              What type of content do you want to focus on?
            </FormDescription>
            <FormMessage className="text-red-600 text-sm mt-1" />
          </FormItem>
        )}
      />

      {/* Collaboration Preferences */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Collaboration Preferences
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={control}
            name={brandGifting.name}
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-all duration-300">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-1"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Enable Brand Gifting
                  </FormLabel>
                  <FormDescription className="text-gray-500 text-sm">
                    Accept products in exchange for content
                  </FormDescription>
                  <FormMessage className="text-red-600 text-sm" />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={paidCollaborationsOnly.name}
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-all duration-300">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-1"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Paid Collaborations Only
                  </FormLabel>
                  <FormDescription className="text-gray-500 text-sm">
                    Only accept paid collaboration opportunities
                  </FormDescription>
                  <FormMessage className="text-red-600 text-sm" />
                </div>
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
