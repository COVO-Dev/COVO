"use client"
import {
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

export default function StepTwoAdditionalInfo({ control, setValue, getValues, resetField }) {
  const primaryNiche = useControlledField("contentAndAudience.primaryNiche", control);
  const secondaryNiche = useControlledField("contentAndAudience.secondaryNiche", control);
  const contentSpecialisation = useControlledField("contentAndAudience.contentSpecialisation", control);
  const brandGifting = useControlledField("contentAndAudience.brandGifting", control);
  const paidCollaborationsOnly = useControlledField("contentAndAudience.paidCollaborationsOnly", control);
  const bio = useControlledField("personalBio", control);

  // contentAndAudience: {
  // 	primaryNiche: string;
  // 	secondaryNiche?: string;
  // 	contentSpecialisation: string;
  // 	rateCardUpload?: string;
  // 	brandGifting: boolean;
  // 	paidCollaborationsOnly: boolean;
  // 	mediaKitUpload?: string;
  // };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-12 gap-4 ">
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-4 ">
          <FormField
            control={control}
            name={primaryNiche.name}
            render={({ field }) => (
              // <FormItem>
              //   <FormLabel>Primary Niche</FormLabel>
              //   <FormControl>
              //     <SelectTrigger>
              //       <SelectValue placeholder="Select a verified email to display" />
              //     </SelectTrigger>
              //   </FormControl>
              //   <FormDescription>This is your content&apos;s primary focus</FormDescription>
              //   <FormMessage />
              // </FormItem>

              <FormItem>
                <FormLabel>Primary Niche</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a niche" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Fashion">Fashion</SelectItem>
                    <SelectItem value="Beauty & Skincare">Beauty & Skincare</SelectItem>
                    <SelectItem value="Health & Wellness">Health & Wellness</SelectItem>
                    <SelectItem value="Fitness & Sports">Fitness & Sports</SelectItem>
                    <SelectItem value="Technology & Gadgets">Technology & Gadgets</SelectItem>
                    <SelectItem value="Travel & Adventure">Travel & Adventure</SelectItem>
                    <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                    <SelectItem value="Home & Lifestyle">Home & Lifestyle</SelectItem>
                    <SelectItem value="Parenting & Family">Parenting & Family</SelectItem>
                    <SelectItem value="Finance & Business">Finance & Business</SelectItem>
                    <SelectItem value="Art & Design">Art & Design</SelectItem>
                    <SelectItem value="Education & Learning">Education & Learning</SelectItem>
                    <SelectItem value="Entertainment (Movies, TV, Music)">Entertainment (Movies, TV, Music)</SelectItem>
                    <SelectItem value="Gaming">Gaming</SelectItem>
                    <SelectItem value="Sustainability & Eco-Living">Sustainability & Eco-Living</SelectItem>
                    <SelectItem value="Automotive">Automotive</SelectItem>
                    <SelectItem value="Pets & Animals">Pets & Animals</SelectItem>
                    <SelectItem value="Personal Development & Motivation">
                      Personal Development & Motivation
                    </SelectItem>
                    <SelectItem value="Other">Other (for categories not listed; with limited flexibility for edge cases)</SelectItem>

                  </SelectContent>
                </Select>
                <FormDescription>This is your content&apos;s primary focus</FormDescription>
                <FormMessage />
              </FormItem>

            )}
          />

          <FormField
            control={control}
            name={bio.name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Placeholder"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Add a short description about yourself</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

        </div>

        <div className="col-span-12 lg:col-span-6 flex flex-col gap-4 ">
          <FormField
            control={control}
            name={secondaryNiche.name}
            render={({ field }) => (
              // <FormItem>
              //   <FormLabel>Secondary Niche</FormLabel>
              //   <FormControl>
              //     <Input
              //       placeholder=""

              //       type="text"
              //       {...field} />
              //   </FormControl>
              //   <FormDescription>This is your content&apos;s alternate focus</FormDescription>
              //   <FormMessage />
              // </FormItem>

              <FormItem>
                <FormLabel>Secondary Niche</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a niche" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Fashion">Fashion</SelectItem>
                    <SelectItem value="Beauty & Skincare">Beauty & Skincare</SelectItem>
                    <SelectItem value="Health & Wellness">Health & Wellness</SelectItem>
                    <SelectItem value="Fitness & Sports">Fitness & Sports</SelectItem>
                    <SelectItem value="Technology & Gadgets">Technology & Gadgets</SelectItem>
                    <SelectItem value="Travel & Adventure">Travel & Adventure</SelectItem>
                    <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                    <SelectItem value="Home & Lifestyle">Home & Lifestyle</SelectItem>
                    <SelectItem value="Parenting & Family">Parenting & Family</SelectItem>
                    <SelectItem value="Finance & Business">Finance & Business</SelectItem>
                    <SelectItem value="Art & Design">Art & Design</SelectItem>
                    <SelectItem value="Education & Learning">Education & Learning</SelectItem>
                    <SelectItem value="Entertainment (Movies, TV, Music)">Entertainment (Movies, TV, Music)</SelectItem>
                    <SelectItem value="Gaming">Gaming</SelectItem>
                    <SelectItem value="Sustainability & Eco-Living">Sustainability & Eco-Living</SelectItem>
                    <SelectItem value="Automotive">Automotive</SelectItem>
                    <SelectItem value="Pets & Animals">Pets & Animals</SelectItem>
                    <SelectItem value="Personal Development & Motivation">
                      Personal Development & Motivation
                    </SelectItem>
                    <SelectItem value="Other">Other (for categories not listed; with limited flexibility for edge cases)</SelectItem>


                  </SelectContent>
                </Select>
                <FormDescription>This is your content&apos;s alternate focus</FormDescription>
                <FormMessage />
              </FormItem>

            )}
          />

          <FormField
            control={control}
            name={contentSpecialisation.name}
            render={({ field }) => (
              // <FormItem>
              //   <FormLabel>Content Specialization</FormLabel>
              //   <FormControl>
              //     <Input
              //       placeholder="Specialization"

              //       type="text"
              //       {...field} />
              //   </FormControl>

              //   <FormMessage />
              // </FormItem>

              <FormItem>
                <FormLabel>Content Specialization</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Specialization" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Sponsored Posts">Sponsored Posts</SelectItem>
                    <SelectItem value="Brand Partnerships">Brand Partnerships</SelectItem>
                    <SelectItem value="Product Reviews">Product Reviews</SelectItem>
                    <SelectItem value="Giveaways & Contests">Giveaways & Contests</SelectItem>
                    <SelectItem value="Event Coverage">Event Coverage</SelectItem>
                    <SelectItem value="Tutorials & How-To Guides">Tutorials & How-To Guides</SelectItem>
                    <SelectItem value="Educational Content">Educational Content</SelectItem>
                    <SelectItem value="Affiliate Marketing Content">Affiliate Marketing Content</SelectItem>
                    <SelectItem value="Unboxings">Unboxings</SelectItem>
                    <SelectItem value="Collaborations (with other influencers)">Collaborations (with other influencers)</SelectItem>
                    <SelectItem value="Vlogs (Video Blogs)">Vlogs (Video Blogs)</SelectItem>
                    <SelectItem value="Live Streams">Live Streams</SelectItem>
                    <SelectItem value="Challenges (e.g., TikTok or YouTube challenges)">
                      Challenges (e.g., TikTok or YouTube challenges)
                    </SelectItem>
                    <SelectItem value="Lifestyle & Daily Routine Content">Lifestyle & Daily Routine Content</SelectItem>
                    <SelectItem value="Interviews & Q&A Sessions">Interviews & Q&A Sessions</SelectItem>
                    <SelectItem value="Testimonials">Testimonials</SelectItem>
                    <SelectItem value="Behind-the-Scenes Content">Behind-the-Scenes Content</SelectItem>
                    <SelectItem value="Other">Other (SelectItemal field for specification)</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>This is your content&apos;s alternate focus</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

        </div>
      </div>


      <div className="grid grid-cols-12 gap-4  ">
        <div className="col-span-6">
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
                  <FormLabel>Paid Collaborations</FormLabel>
                  <FormDescription>Set to paid collaborations only</FormDescription>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-6">
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
                  <FormLabel>Brand Gifting</FormLabel>
                  <FormDescription>Choose to set gifting of brands</FormDescription>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  )
}