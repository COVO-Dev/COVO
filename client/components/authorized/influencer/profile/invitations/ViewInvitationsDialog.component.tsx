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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useState } from "react"; // Keep useState for dialog open/close
import { Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { acceptInvitationRoute } from "@/lib/api/campaign/respond-to-invitation/AcceptInvitation.route";
import { rejectInvitationRoute } from "@/lib/api/campaign/respond-to-invitation/RejectInvitation.route";

interface InvitationData {
  _id: string;
  campaignId: {
    _id: string;
    title: string;
  };
  brandId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  status: "pending" | "accepted" | "rejected";
  message?: string;
  offer?: any;
  appliedAt: string;
}

interface ViewInvitationsDialogProps {
  invitations: InvitationData[]; // Now received as prop
  token: string; // Received as prop
  influencerId: string; // Received as prop
  onInvitationAction: () => void; // Callback received as prop
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "accepted":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function ViewInvitationsDialog({
  invitations,
  token,
  influencerId,
  onInvitationAction,
}: ViewInvitationsDialogProps) {
  const [open, setOpen] = useState(false);

  const handleAccept = async (
    campaignId: string,
    brandId: string,
    invitationId: string
  ) => {
    try {
      const response = await acceptInvitationRoute(
        token,
        influencerId, // Use prop directly
        campaignId,
        brandId
      );
      if (response.status === "success") {
        toast({
          title: "Invitation Accepted!",
          description: response.message,
        });
        onInvitationAction(); // Use prop callback
      } else {
        toast({
          title: "Error",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept invitation.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (
    campaignId: string,
    brandId: string,
    invitationId: string
  ) => {
    try {
      const response = await rejectInvitationRoute(
        token,
        influencerId, // Use prop directly
        campaignId,
        brandId
      );
      if (response.status === "success") {
        toast({
          title: "Invitation Declined!",
          description: response.message,
        });
        onInvitationAction(); // Use prop callback
      } else {
        toast({
          title: "Error",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to decline invitation.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="mt-4">
          <Send className="mr-2 h-4 w-4" />
          View My Invitations ({invitations.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>My Campaign Invitations</DialogTitle>
          <DialogDescription>
            Here are all the invitations you have received from brands.
          </DialogDescription>
        </DialogHeader>
        {invitations.length === 0 ? (
          <div className="flex-grow flex items-center justify-center text-muted-foreground">
            No invitations found.
          </div>
        ) : (
          <ScrollArea className="flex-grow pr-4">
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <div
                  key={invitation._id}
                  className="border rounded-lg p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {invitation.campaignId?.title || "N/A Campaign"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        From: {invitation.brandId?.firstName}{" "}
                        {invitation.brandId?.lastName}
                      </p>
                    </div>
                    <Badge className={getStatusColor(invitation.status)}>
                      {invitation.status.charAt(0).toUpperCase() +
                        invitation.status.slice(1)}
                    </Badge>
                  </div>
                  {invitation.message && (
                    <p className="text-sm text-gray-700 mb-2">
                      Message: {invitation.message}
                    </p>
                  )}
                  {invitation.offer && (
                    <p className="text-sm text-gray-700 mb-2">
                      Offer:{" "}
                      {typeof invitation.offer === "object"
                        ? JSON.stringify(invitation.offer)
                        : invitation.offer}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Received on: {format(new Date(invitation.appliedAt), "PPP")}
                  </p>
                  {invitation.status === "pending" && (
                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={() =>
                          handleAccept(
                            invitation.campaignId._id,
                            invitation.brandId._id,
                            invitation._id
                          )
                        }
                        className="flex-1"
                      >
                        Accept
                      </Button>
                      <Button
                        onClick={() =>
                          handleReject(
                            invitation.campaignId._id,
                            invitation.brandId._id,
                            invitation._id
                          )
                        }
                        variant="destructive"
                        className="flex-1"
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
