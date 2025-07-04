"use client"
import ImprovedTagsInput from "@/components/ui/improved-tags-input";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useControlledField from "@/utils/useControlledField";
import { Control } from "react-hook-form";
import { ICampaign } from "@/lib/api/campaign/create-campaign/createCampaign.validation";

export default function CampaignFormStepThree({ control }: { control: Control<ICampaign> }) {
  const metricsField = useControlledField("trackingAndAnalytics.metrics", control);
  const reportFrequencyField = useControlledField("trackingAndAnalytics.reportFrequency", control);
  const performanceTrackingField = useControlledField("trackingAndAnalytics.performanceTracking", control);
  const statusField = useControlledField("status", control);

  return (
    <div className="flex flex-col gap-4">
      <FormField
        control={control}
        name="trackingAndAnalytics.metrics"
        render={() => (
          <FormItem>
            <FormLabel>Metrics*</FormLabel>
            <FormControl>
              <ImprovedTagsInput
                tags={(metricsField.value as string[]) || []}
                setTags={(value: string[]) => {
                  metricsField.onChange(value);
                }}
                placeholder="Add metrics to track..."
                suggestions={[
                  "engagement rate",
                  "reach",
                  "impressions",
                  "clicks",
                  "conversions",
                  "brand awareness",
                  "sales",
                  "ROI",
                  "follower growth",
                  "website traffic",
                  "leads generated",
                  "video views",
                  "story views",
                  "shares",
                  "comments",
                  "saves",
                  "app downloads",
                  "coupon codes used"
                ]}
                maxTags={10}
              />
            </FormControl>
            <FormDescription>
              Select the metrics you want to track for this campaign (at least 1 required)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="trackingAndAnalytics.reportFrequency"
        render={() => (
          <FormItem>
            <FormLabel>Report Frequency*</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter frequency (e.g., Weekly, Monthly)"
                value={reportFrequencyField.value as string}
                onChange={(e) => {
                  reportFrequencyField.onChange(e.target.value);
                }}
              />
            </FormControl>
            <FormDescription>
              How often would you like to receive progress reports?
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="trackingAndAnalytics.performanceTracking"
        render={() => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={performanceTrackingField.value as boolean}
                onCheckedChange={(value) => {
                  performanceTrackingField.onChange(value);
                }}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Track performance</FormLabel>
              <FormDescription>Allow COVO to track your campaign performance</FormDescription>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="status"
        render={() => (
          <FormItem>
            <FormLabel>Status*</FormLabel>
            <Select
              onValueChange={(value) => {
                statusField.onChange(value);
              }}
              defaultValue={statusField.value as string}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>Set the initial status for your campaign</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
