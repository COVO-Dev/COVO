"use client"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TagsInput from "@/components/ui/tags-input";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setCampaignData, updateTrackingAndAnalytics } from "@/lib/store/campaign/campaign.slice";
import useControlledField from "@/utils/useControlledField";

export default function CampaignFormStepThree({ control }) {
  const dispatch = useAppDispatch();
  // const campaignData = useAppSelector((state) => state.campaign);

  const metricsField = useControlledField("trackingAndAnalytics.metrics", control);
  const reportFrequencyField = useControlledField("trackingAndAnalytics.reportFrequency", control);
  const performanceTrackingField = useControlledField("trackingAndAnalytics.performanceTracking", control);

  const statusField = useControlledField("status", control);

  return (
    <div className="flex flex-col gap-4">
      {/* <div className="col-span-6">

        <FormField
          control={control}
          name="trackingAndAnalytics.metrics"
          render={() => (
            <FormItem>
              <FormLabel>Metrics</FormLabel>
              <FormControl>
                <TagsInput
                  // tags={campaignData.trackingAndAnalytics.metrics}
                  tags={metricsField.value || []}
                  setTags={(value) => {
                    metricsField.onChange(value);
                    // dispatch(updateTrackingAndAnalytics({ metrics: value }));
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
        render={() => (
          <FormItem>
            <FormLabel>Report Frequency</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter frequency"
                {...reportFrequencyField}
                onChange={(e) => {
                  reportFrequencyField.onChange(e);
                  // dispatch(updateTrackingAndAnalytics({ reportFrequency: e.target.value }));
                }}
              />
            </FormControl>
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
                checked={performanceTrackingField.value}
                onCheckedChange={(value) => {
                  performanceTrackingField.onChange(value);
                  // dispatch(updateTrackingAndAnalytics({ performanceTracking: value }));
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
            <FormLabel>Status</FormLabel>
            <Select
              onValueChange={(value) => {
                statusField.onChange(value);
                // dispatch(setCampaignData({ ...campaignData, status: value }));
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
      />

    </div>
  );
}
