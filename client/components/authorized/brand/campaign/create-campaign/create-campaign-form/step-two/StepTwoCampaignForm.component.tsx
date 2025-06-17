"use client";
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
import TagsInput from "../../../../../../ui/tags-input";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setCampaignData, updateCollaborationPreferences, updateTrackingAndAnalytics } from '@/lib/store/campaign/campaign.slice'
import useControlledField from "@/utils/useControlledField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelector, MultiSelectorContent, MultiSelectorInput, MultiSelectorItem, MultiSelectorList, MultiSelectorTrigger } from "@/components/ui/extension/multi-select";

export default function CampaignFormStepTwo({ control }) {
  const dispatch = useAppDispatch();
  const campaignData = useAppSelector((state) => state.campaign);

  // Controlled fields using react-hook-form
  const primaryGoalsField = useControlledField("primaryGoals", control);
  const influencerTypeField = useControlledField("influencerType", control);
  const geographicFocusField = useControlledField("geographicFocus", control);

  const hasWorkedWithInfluencersField = useControlledField("collaborationPreferences.hasWorkedWithInfluencers", control);
  const exclusiveCollaborationsField = useControlledField("collaborationPreferences.exclusiveCollaborations", control);
  const typeCollaborationField = useControlledField("collaborationPreferences.type", control);
  const stylesField = useControlledField("collaborationPreferences.styles", control);

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
                <TagsInput
                  tags={primaryGoalsField.value || []}
                  // placeholder="Add a goal and press enter"
                  setTags={(tags) => {
                    primaryGoalsField.onChange(tags);
                    // dispatch(setCampaignData({ ...campaignData, primaryGoals: tags }));
                  }}
                />
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
            name={influencerTypeField.name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Influencer Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder="Select tier"
                        className={field.value ? "" : "text-muted-foreground text-gray-500"}
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
                <FormDescription>Select a collaboration type from the drop-down menu</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />


        </div>

        <div className="col-span-12 md:col-span-6">
          {/* Geographic Focus */}
          <FormField
            control={control}
            name="geographicFocus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Geographic Focus</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Focus"
                    {...geographicFocusField}
                    value={geographicFocusField.value || ""}
                    onChange={(e) => {
                      geographicFocusField.onChange(e);
                      // dispatch(setCampaignData({ ...campaignData, geographicFocus: e.target.value }));
                    }}
                  />
                </FormControl>
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
                    // checked={campaignData.collaborationPreferences.hasWorkedWithInfluencers || false}
                    checked={hasWorkedWithInfluencersField.value || false}
                    onCheckedChange={(checked) => {
                      hasWorkedWithInfluencersField.onChange(checked);
                      // dispatch(updateCollaborationPreferences({ hasWorkedWithInfluencers: checked }));
                    }}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Did you work with Influencers in the past?</FormLabel>
                  <FormDescription>
                    If you have any experience working with influencers in the past, please check this box
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
                    // checked={campaignData.collaborationPreferences.exclusiveCollaborations || false}
                    checked={exclusiveCollaborationsField.value || false}
                    onCheckedChange={(checked) => {
                      exclusiveCollaborationsField.onChange(checked);
                      // dispatch(updateCollaborationPreferences({ exclusiveCollaborations: checked }));
                    }}
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
            name={typeCollaborationField.name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Collaboration Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder="Select item"
                        className={field.value ? "" : "text-muted-foreground text-gray-500"}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Paid Collaborations">Paid Collaborations</SelectItem>
                    <SelectItem value="Gifting/PR Packages">Gifting/PR Packages</SelectItem>
                    <SelectItem value="Affiliate/Commission-Based Deals">Affiliate/Commission-Based Deals</SelectItem>
                    <SelectItem value="Long-Term Brand Partnerships">Long-Term Brand Partnerships</SelectItem>
                    <SelectItem value="Event Hosting">Event Hosting</SelectItem>
                    <SelectItem value="Product Reviews">Product Reviews</SelectItem>
                    <SelectItem value="UGC-Only Content">UGC-Only Content</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Select a collaboration type from the drop-down menu</FormDescription>
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
                        <MultiSelectorItem value="Reels">Reels</MultiSelectorItem>
                        <MultiSelectorItem value="Stories">Stories</MultiSelectorItem>
                        <MultiSelectorItem value="In-Feed Posts">In-Feed Posts</MultiSelectorItem>
                        <MultiSelectorItem value="TikToks">TikToks</MultiSelectorItem>
                        <MultiSelectorItem value="YouTube Videos">YouTube Videos</MultiSelectorItem>
                        <MultiSelectorItem value="Blog or X Posts">Blog or X Posts</MultiSelectorItem>
                        <MultiSelectorItem value="Live Streams">Live Streams</MultiSelectorItem>
                        <MultiSelectorItem value="Podcasts" >Podcasts</MultiSelectorItem>
                        <MultiSelectorItem value="Carousel Posts" >Carousel Posts</MultiSelectorItem>
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

    </div>
  );
}