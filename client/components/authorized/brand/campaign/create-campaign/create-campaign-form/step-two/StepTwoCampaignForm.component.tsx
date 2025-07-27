"use client";
import {
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from "@/components/ui/extension/multi-select";
import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { ICampaign } from "@/lib/api/campaign/create-campaign/createCampaign.validation";
import LocationSelector from "@/components/ui/location-input";

export default function CampaignFormStepTwo({ control }) {
  const form = useFormContext<ICampaign>(); // Get form context to use setValue

  // Controlled fields using react-hook-form
  const primaryGoalsField = useControlledField("primaryGoals", control);

  const primaryGoalOptions = [
    "Brand Awareness",
    "Product Launch",
    "Audience Engagement",
    "Sales Conversion",
    "User-Generated Content",
    "Event Coverage",
  ];

  // State to manage visibility of the "Other" input field
  const [showOtherInput, setShowOtherInput] = useState(false);

  // Effect to initialize showOtherInput based on the current primaryGoals value
  useEffect(() => {
    // Check if the current value is not empty and not one of the predefined options
    if (
      primaryGoalsField.value &&
      !primaryGoalOptions.includes(primaryGoalsField.value)
    ) {
      setShowOtherInput(true);
    } else {
      setShowOtherInput(false);
    }
  }, [primaryGoalsField.value]); // Re-run when primaryGoalsField.value changes

  console.log(
    form.watch("primaryGoals"),
    "Form Values in Step Two",
    showOtherInput,
    form.getValues() // This will now work
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Primary Goals */}
      <div>
        <FormField
          control={control}
          name="primaryGoals"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary Goals</FormLabel>
              <FormControl>
                <div className="flex flex-col md:flex-row gap-2">
                  {" "}
                  {/* Flex container for Select and Input */}
                  <Select
                    onValueChange={(value) => {
                      if (value === "Other") {
                        setShowOtherInput(true);
                      } else {
                        setShowOtherInput(false);
                        field.onChange(value); // Set the selected value from dropdown
                      }
                    }}
                    // Determine the selected value for the Select component
                    value={
                      showOtherInput
                        ? "Other" // If other input is shown, Select should display "Other"
                        : primaryGoalOptions.includes(field.value)
                        ? field.value // If it's a predefined option
                        : "" // If it's empty or not a predefined option, show placeholder
                    }
                  >
                    <SelectTrigger>
                      {" "}
                      {/* Adjust width */}
                      <SelectValue placeholder="Select a primary goal" />
                    </SelectTrigger>
                    <SelectContent>
                      {primaryGoalOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                      <SelectItem value="Other">
                        Other (with free text option)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {showOtherInput && (
                    <Input
                      placeholder="Enter your primary goal"
                      {...field}
                      value={
                        primaryGoalOptions.includes(field.value)
                          ? "" // If current value is a predefined option, clear input
                          : field.value || "" // Otherwise, show current value or empty string
                      }
                    />
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-6">
          {/* Influencer Type */}
          <FormField
            control={control}
            name="influencerType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Influencer Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder="Select tier"
                        className={
                          field.value
                            ? ""
                            : "text-muted-foreground text-gray-500"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Nano">{` Nano (1K–10K) `}</SelectItem>
                    <SelectItem value="Micro">{` Micro (10K–50K) `}</SelectItem>
                    <SelectItem value="Mid-Tier">{` Mid-Tier (50K–250K) `}</SelectItem>
                    <SelectItem value="Macro">{` Macro (250K–1M) `}</SelectItem>
                    <SelectItem value="Celebrity">{` Celebrity (1M+) `}</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select a collaboration type from the drop-down menu
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-12 md:col-span-6">
          {/* Geographic Focus */}
          <FormField
            name="geographicFocus.country"
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Geographic Focus</FormLabel>
                <FormControl>
                  <LocationSelector
                    onCountryChange={(country) => {
                      // Use setValue from the context, not from control
                      form.setValue(
                        "geographicFocus.country",
                        country?.name ?? ""
                      );
                      form.setValue("geographicFocus.city", "");
                    }}
                    onStateChange={(state) => {
                      // Use setValue from the context, not from control
                      form.setValue("geographicFocus.city", state?.name ?? "");
                    }}
                  />
                </FormControl>
                <FormDescription>{` 
                  Select the country and state/city for your campaign's
                  geographic focus.`}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
      {/* Two checkboxes */}
      <div className="grid grid-cols-12 gap-4">
        {/* Worked With Influencers */}
        <div className="col-span-12 md:col-span-6">
          <FormField
            control={control}
            name="collaborationPreferences.hasWorkedWithInfluencers"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Did you work with Influencers in the past?
                  </FormLabel>
                  <FormDescription>
                    If you have any experience working with influencers in the
                    past, please check this box
                  </FormDescription>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </div>

        {/* Exclusive Collaborations */}
        <div className="col-span-12 md:col-span-6">
          <FormField
            control={control}
            name="collaborationPreferences.exclusiveCollaborations"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Make the collaboration exclusive</FormLabel>
                  <FormDescription>
                    Set the campaign partner to be exclusive to an influencer
                  </FormDescription>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Collaboration Type */}
        <div className="col-span-12 md:col-span-6">
          <FormField
            control={control}
            name="collaborationPreferences.type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Collaboration Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder="Select item"
                        className={
                          field.value
                            ? ""
                            : "text-muted-foreground text-gray-500"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Paid Collaborations">
                      Paid Collaborations
                    </SelectItem>
                    <SelectItem value="Gifting/PR Packages">
                      Gifting/PR Packages
                    </SelectItem>
                    <SelectItem value="Affiliate/Commission-Based Deals">
                      Affiliate/Commission-Based Deals
                    </SelectItem>
                    <SelectItem value="Long-Term Brand Partnerships">
                      Long-Term Brand Partnerships
                    </SelectItem>
                    <SelectItem value= "Event Hosting">Event Hosting</SelectItem>
                    <SelectItem value= "Product Reviews">
                      Product Reviews
                    </SelectItem>
                    <SelectItem value="UGC-Only Content">
                      UGC-Only Content
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select a collaboration type from the drop-down menu
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* <FormField
            control={control}
            name="collaborationPreferences.type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Collaboration Type</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Collaboration type"
                    {...typeCollaborationField}
                    // value={campaignData.collaborationPreferences.type}
                    value={typeCollaborationField.value || ""}
                    // defaultValue={campaignData.type}

                    onChange={(e) => {
                      typeCollaborationField.onChange(e);
                      // dispatch(updateCollaborationPreferences({ type: e.target.value }));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}
        </div>

        {/* Styles */}
        <div className="col-span-12 md:col-span-6">
          <FormField
            control={control}
            name="collaborationPreferences.styles"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{`Collaboration Style`}</FormLabel>
                <FormControl>
                  <MultiSelector
                    values={field.value}
                    onValuesChange={field.onChange}
                    loop
                    className="px-1 rounded-md border max-w-xs"
                  >
                    <MultiSelectorTrigger className="p-0">
                      <MultiSelectorInput placeholder="Select styles" />
                    </MultiSelectorTrigger>
                    <MultiSelectorContent>
                      <MultiSelectorList>
                        <MultiSelectorItem value="Reels">
                          Reels
                        </MultiSelectorItem>
                        <MultiSelectorItem value="Stories">
                          Stories
                        </MultiSelectorItem>
                        <MultiSelectorItem value="In-Feed Posts">
                          In-Feed Posts
                        </MultiSelectorItem>
                        <MultiSelectorItem value="TikToks">
                          TikToks
                        </MultiSelectorItem>
                        <MultiSelectorItem value="YouTube Videos">
                          YouTube Videos
                        </MultiSelectorItem>
                        <MultiSelectorItem value="Blog or X Posts">
                          Blog or X Posts
                        </MultiSelectorItem>
                        <MultiSelectorItem value="Live Streams">
                          Live Streams
                        </MultiSelectorItem>
                        <MultiSelectorItem value="Podcasts">
                          Podcasts
                        </MultiSelectorItem>
                        <MultiSelectorItem value="Carousel Posts">
                          Carousel Posts
                        </MultiSelectorItem>
                      </MultiSelectorList>
                    </MultiSelectorContent>
                  </MultiSelector>
                </FormControl>
                <FormDescription>Select multiple options.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* NEW: Fields moved from StepThreeCampaignForm */}
      {/* <div className="col-span-6">
        <FormField
          control={control}
          name="trackingAndAnalytics.metrics"
          render={() => (
            <FormItem>
              <FormLabel>Metrics</FormLabel>
              <FormControl>
                <TagsInput
                  tags={metricsField.value || []}
                  setTags={(value) => {
                    metricsField.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div> */}

      <FormField
        control={control}
        name="trackingAndAnalytics.reportFrequency"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Report Frequency</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Monthly">Monthly</SelectItem>
                <SelectItem value="Quarterly">Quarterly</SelectItem>
                <SelectItem value="Bi-annually">Bi-annually</SelectItem>
                <SelectItem value="Annually">Annually</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              {` Select how often you'd like to receive reports. `}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="trackingAndAnalytics.performanceTracking"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Track performance</FormLabel>
              <FormDescription>
                Allow COVO to track your campaign performance
              </FormDescription>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />

      {/* <FormField
        control={control}
        name="status"
        render={() => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select
              onValueChange={(value) => {
                statusField.onChange(value);
              }}
              defaultValue={statusField.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>Enter your campaign status</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      /> */}
    </div>
  );
}
