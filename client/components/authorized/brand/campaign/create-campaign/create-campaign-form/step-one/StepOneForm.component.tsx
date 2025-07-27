"use client";
import React, { useEffect, useState } from "react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import useControlledField from "@/utils/useControlledField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CampaignFormStepOne({ control }) {
  // Controlled fields whose values are needed by other components/hooks
  const startDateField = useControlledField("startDate", control);
  const budgetRangeField = useControlledField("budgetRange", control);

  // State for budget "Other" input visibility
  const [showOtherBudgetInput, setShowOtherBudgetInput] = useState(false);

  // Budget options
  const budgetRangeOptions = [
    "$0 - $500",
    "$501 - $1,000",
    "$1,001 - $5,000",
    "$5,001 - $10,000",
    "Over $10,000",
  ];

  // Effect for budget "Other" input visibility
  useEffect(() => {
    if (
      budgetRangeField.value &&
      !budgetRangeOptions.includes(budgetRangeField.value)
    ) {
      setShowOtherBudgetInput(true);
    } else {
      setShowOtherBudgetInput(false);
    }
  }, [budgetRangeField.value]);

  // Options for target audience fields
  const ageGroupOptions = [
    "10–12",
    "13–17",
    "18–24",
    "25–34",
    "35–44",
    "45–54",
    "55–64",
    "65–75",
  ];

  const genderOptions = ["Female", "Male", "Non-binary", "Prefer not to say"];

  const incomeLevelOptions = ["Low", "Middle", "High"];

  const lifeStageOptions = [
    "Student",
    "Young Professional",
    "Parent",
    "Retired",
  ];

  const lifestyleOptions = [
    "Health-conscious",
    "Fashion-forward",
    "Tech-savvy",
    "Eco-conscious",
    "Luxury-oriented",
    "Minimalist",
  ];

  const engagementLevelOptions = [
    "Passive Viewer",
    "Content Sharer",
    "Commenter",
    "Influencer/Creator",
  ];

  const platformOptions = [
    "Instagram",
    "TikTok",
    "YouTube",
    "Facebook",
    "LinkedIn",
    "X (formerly Twitter)",
  ];

  // Function to disable past dates
  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Title Field */}
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input placeholder="Title" {...field} />
            </FormControl>
            <FormDescription>Your campaign title</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-12 gap-4">
        {/* Start Date Field */}
        <div className="col-span-12 md:col-span-6">
          <FormField
            control={control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          " pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={isDateDisabled}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>Campaign start date</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* End Date Field */}
        <div className="col-span-12 md:col-span-6">
          <FormField
            control={control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        isDateDisabled(date) ||
                        (startDateField.value &&
                          date < new Date(startDateField.value))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>Campaign end date</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Budget Field */}
      <FormField
        control={control}
        name="budgetRange"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Budget</FormLabel>
            <FormControl>
              <div className="flex gap-2">
                <Select
                  onValueChange={(value) => {
                    if (value === "Other") {
                      setShowOtherBudgetInput(true);
                    } else {
                      setShowOtherBudgetInput(false);
                      field.onChange(value);
                    }
                  }}
                  value={
                    showOtherBudgetInput
                      ? "Other"
                      : budgetRangeOptions.includes(field.value)
                      ? field.value
                      : ""
                  }
                >
                  <SelectTrigger
                    className={showOtherBudgetInput ? "w-1/2" : "w-full"}
                  >
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    {budgetRangeOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                    <SelectItem value="Other">
                      Other (free-text field)
                    </SelectItem>
                  </SelectContent>
                </Select>
                {showOtherBudgetInput && (
                  <Input
                    placeholder="Enter custom budget"
                    {...field}
                    value={
                      budgetRangeOptions.includes(field.value)
                        ? ""
                        : field.value || ""
                    }
                    className="w-1/2"
                  />
                )}
              </div>
            </FormControl>
            <FormDescription>Campaign budget range</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Target Audience Section */}
      <div className="border rounded-md p-4 space-y-4">
        <h3 className="text-lg font-semibold">Target Audience</h3>

        {/* Age Groups */}
        <FormField
          control={control}
          name="targetAudience.ageGroups"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Age Groups</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select age group" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ageGroupOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Gender */}
        <FormField
          control={control}
          name="targetAudience.gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {genderOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Income Level */}
        <FormField
          control={control}
          name="targetAudience.incomeLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Income Level</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select income level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {incomeLevelOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Life Stage */}
        <FormField
          control={control}
          name="targetAudience.lifeStage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Life Stage</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select life stage" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {lifeStageOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Lifestyle */}
        <FormField
          control={control}
          name="targetAudience.lifestyle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lifestyle</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select lifestyle" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {lifestyleOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Engagement Level */}
        <FormField
          control={control}
          name="targetAudience.engagementLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Engagement Level</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select engagement level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {engagementLevelOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Platform */}
        <FormField
          control={control}
          name="targetAudience.platform"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Platform</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {platformOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
