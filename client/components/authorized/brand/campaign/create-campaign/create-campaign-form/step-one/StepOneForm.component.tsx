"use client";
import React from "react";
import { useController, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { setCampaignData } from '@/lib/store/campaign/campaign.slice'
import useControlledField from "@/utils/useControlledField";

export default function CampaignFormStepOne({ control }) {
  const campaignData = useAppSelector(state => state.campaign);
  const dispatch = useAppDispatch();

  // Controlled fields using react-hook-form's useController
  const titleField = useControlledField("title", control);
  const startDateField = useControlledField("startDate", control);
  const endDateField = useControlledField("endDate", control);
  const budgetRangeField = useControlledField("budgetRange", control);
  const targetAudienceField = useControlledField("targetAudience", control);

  // Function to disable past dates
  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="flex flex-col gap-4" >
      {/* Title Field */}
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input
                placeholder="Title"
                {...titleField}
                // value={campaignData.title || ""}
                onChange={(e) => {
                  titleField.onChange(e);
                  // dispatch(setCampaignData({ ...campaignData, title: e.target.value }));
                }}
              />
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
                          "w-[240px] pl-3 text-left font-normal",
                          !startDateField.value && "text-muted-foreground"
                        )}
                      >
                        {startDateField.value ? (
                          format(startDateField.value, "PPP")
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
                      selected={startDateField.value}
                      // selected={new Date()}
                      onSelect={(date) => {
                        startDateField.onChange(date);
                        // dispatch(setCampaignData({ ...campaignData, startDate: String(date) }));
                      }}
                      disabled={isDateDisabled}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>Campaign start date</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
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
                          !endDateField.value && "text-muted-foreground"
                        )}
                      >
                        {endDateField.value ? (
                          format(endDateField.value, "PPP")
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
                      selected={endDateField.value}
                      // selected={new Date(campaignData.endDate)}
                      onSelect={(date) => {
                        endDateField.onChange(date);
                        // dispatch(setCampaignData({ ...campaignData, endDate: String(date) }));
                      }}
                      disabled={(date) =>
                        isDateDisabled(date) || (startDateField.value && date < (new Date(startDateField.value)))
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
              <Input
                placeholder="Enter budget"
                type="text"
                // type="number"
                {...budgetRangeField}
                onChange={(e) => {
                  // Form state for validation with Zod
                  budgetRangeField.onChange(Number(e.target.value) || "");

                  // redux slice
                  // dispatch(setCampaignData({ ...campaignData, budgetRange: Number(e.target.value) }));
                }}
              />
            </FormControl>
            <FormDescription>Campaign budget range</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Target Audience Field */}
      <FormField
        control={control}
        name="targetAudience"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Target Audience</FormLabel>
            <FormControl>
              <Input
                placeholder="Describe your target audience"
                {...targetAudienceField}
                value={targetAudienceField.value || ""}
                onChange={(e) => {
                  targetAudienceField.onChange(e);
                  // dispatch(setCampaignData({ ...campaignData, targetAudience: e.target.value }));
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}