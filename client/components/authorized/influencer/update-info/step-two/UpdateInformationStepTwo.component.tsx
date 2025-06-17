"use client"
import {
  useEffect,
  useMemo,
  useState
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
  Input
} from "@/components/ui/input"
import {
  Checkbox
} from "@/components/ui/checkbox"
import useControlledField from "@/utils/useControlledField";
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LocationSelector from "@/components/ui/location-input-custom"
// import LocationSelector from "@/components/ui/location-input"
import {
  PhoneInput
} from "@/components/ui/phone-input";
import { Switch } from "@/components/ui/switch"

export default function UpdateInformationStepTwo({ control, setValue, getValues, resetField }) {

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
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-6 ">
          <FormField
            control={control}
            name={primaryNiche.name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary Niche</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select one niche" />
                    </SelectTrigger>
                  </FormControl>
                  {nicheItems}
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-12 md:col-span-6 ">
          <FormField
            control={control}
            name={secondaryNiche.name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Secondary Niche</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select one niche" />
                    </SelectTrigger>
                  </FormControl>
                  {nicheItems}
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

      </div>
      <FormField
        control={control}
        name={contentSpecialisation.name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Content Specialization</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select one specialization" />
                </SelectTrigger>
              </FormControl>
              {specializationItems}
            </Select>
            <FormDescription>What do you want to focus on?</FormDescription>
            <FormMessage />
          </FormItem >
        )
        }
      />

      < div className="grid grid-cols-12 gap-4" >
        <div className="col-span-12 md:col-span-6">
          <FormField
            control={control}
            name={brandGifting.name}
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Enable brand Gifting</FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-12 md:col-span-6">
          <FormField
            control={control}
            name={paidCollaborationsOnly.name}
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Paid collaborations only</FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </div>
      </div >

      <div className="grid grid-cols-12 gap-4">
        <FormField
          control={control}
          name={termsAccepted.name}
          render={({ field }) => (
            <FormItem className="flex flex-col space-y-4 rounded-md border p-4 col-span-12">
              <div className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked: boolean) => {
                      field.onChange(checked);
                      setValue(marketingOptIn.name, checked);
                      setValue(dataComplianceConsent.name, checked);
                    }}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Accept terms and conditions</FormLabel>
                  <FormDescription>
                    Accept all terms and conditions, opt in marketing and data
                    compliance
                  </FormDescription>
                  <FormMessage />
                </div>
              </div>

              <div className="ml-[2em] flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={getValues(marketingOptIn.name)}
                    onCheckedChange={(checked: boolean) => {
                      setValue(marketingOptIn.name, checked);
                      if (checked) {
                        field.onChange(checked);
                      }
                    }}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Marketing Opt-In</FormLabel>
                  <FormDescription>
                    Opt-in to receive marketing emails.
                  </FormDescription>
                  <FormMessage />
                </div>
              </div>

              <div className="ml-[2em] flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={getValues(dataComplianceConsent.name)}
                    onCheckedChange={(checked: boolean) => {
                      setValue(dataComplianceConsent.name, checked);
                      if (checked) {
                        field.onChange(checked);
                      }
                    }}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Data Compliance</FormLabel>
                  <FormDescription>
                    Agree to data compliance policies.
                  </FormDescription>
                  <FormMessage />
                </div>
              </div>
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name={isActive.name}
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel>Deactivate Account</FormLabel>
              <FormDescription>{` Your status will be 'Inactive' to other users `}</FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={!isActive.value}
                onCheckedChange={(checked) => {
                  setValue(isActive.name, !checked);
                }}
                aria-readonly
              />
            </FormControl>
          </FormItem>
        )}
      />


    </div >
  )
}
