"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IInviteToCampaign,
  inviteToCampaignSchema,
} from "@/lib/api/campaign/invite-to-campaign/inviteToCampaign.validation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { inviteToCampaignRoute } from "@/lib/api/campaign/invite-to-campaign/inviteToCampaign.route";
import { useState } from "react";

interface IInviteInfluencerDialogProps {
  brandId: string;
  campaignId: string;
  influencerId: string;
  token: string;
}

export default function InviteInfluencerDialog({
  brandId,
  campaignId,
  influencerId,
  token,
}: IInviteInfluencerDialogProps) {
  const [open, setOpen] = useState(false);
  const form = useForm<IInviteToCampaign>({
    resolver: zodResolver(inviteToCampaignSchema),
    defaultValues: {
      message: "",
    },
  });

  const { isSubmitting } = form.formState;

  const handleFormSubmit = async (values: IInviteToCampaign) => {
    try {
      const result = await inviteToCampaignRoute(
        token,
        brandId,
        campaignId,
        influencerId,
        values
      );

      if (result.status === "success") {
        toast({
          title: "Success!",
          description: result.message,
        });
        setOpen(false);
        form.reset();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        // description: "An unexpected error occurred. Please try again.",
        description: error?.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Request</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Influencer</DialogTitle>
          <DialogDescription>
            Send an invitation to this influencer to join your campaign.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Include a personal message with your invitation..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Sending..." : "Send Invitation"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
