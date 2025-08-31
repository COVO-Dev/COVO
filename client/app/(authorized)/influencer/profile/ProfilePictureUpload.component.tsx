"use client";

import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
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
import { CloudUpload, Paperclip } from "lucide-react";
import {
  FileInput,
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
} from "@/components/ui/extension/file-upload";
import useControlledField from "@/utils/useControlledField";
import { influencerUploadPhotoRoute } from "@/lib/api/upload/influencer-upload-photo/influnecerUploadPhotoRoute";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setProfileData } from "@/lib/store/profile/profile.slice";
import { LoaderCircle } from "lucide-react";
// import { File } from "buffer";
import { useSession } from "next-auth/react";
import { userRemovePhotoRoute } from "@/lib/api/upload/user-remove-photo/userRemovePhotoRoute";
import { brandUploadPhotoRoute } from "@/lib/api/upload/brand-upload-photo/brandUploadPhotoRoute.route";
import { brandRemovePhotoRoute } from "@/lib/api/upload/brand-remove-photo/brandRemovePhotoRoute";

const formSchema = z.object({
  file: z
    .array(
      z.instanceof(File).refine((file) => file.size <= 1024 * 1024 * 4, {
        message: "Please make sure file size is less than or equal to 4MB",
      })
    )
    .max(1, {
      message: "Please add a maximum of one picture",
    }),
});

export default function ProfilePictureUpload({ token, id, userRole }) {
  const { control, trigger, ...rest } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const [files, setFiles] = useState<File[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const file = useControlledField("file", control);
  const formData = useWatch({ control });
  const dispatch = useAppDispatch();
  const profileData = useAppSelector((state) => state.profile);
  const { update, data: session } = useSession();

  const dropZoneConfig = {
    maxFiles: 1,
    maxSize: 1024 * 1024 * 4,
    multiple: false,
    accept: { "image/*": [".png", ".gif", ".jpeg", ".jpg", ".svg"] },
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const isValid = await trigger();
    setIsLoading(true);
    try {
      if (userRole.toLowerCase() === 'influencer') {
        const result = await influencerUploadPhotoRoute(formData, token, id);
        //   console.log(result);
        if (result.status === "success") {
          const { profilePicture, ...rest } = result.data.data.user;
          // const urlCompatibleFileUrl = encodeURI(profilePicture);
          // console.log(urlCompatibleFileUrl);
          await update({
            ...session,
            user: {
              ...session?.user,
              // profilePicture: urlCompatibleFileUrl,
              profilePicture,
            },
          });
          toast({
            title: "Success!",
            description: "Profile picture updated",
            duration: 3000,
          });
        }
      } else if (userRole.toLowerCase() === 'brand') {
        const result = await brandUploadPhotoRoute(formData, token, id);
        //   console.log(result);
        if (result.status === "success") {
          const { logo, ...rest } = result.data.data.user;
          // const urlCompatibleFileUrl = encodeURI(profilePicture);
          // console.log(urlCompatibleFileUrl);
          await update({
            ...session,
            user: {
              ...session?.user,
              // profilePicture: urlCompatibleFileUrl,
              logo,
            },
          });
          toast({
            title: "Success!",
            description: "Profile picture updated",
            duration: 3000,
          });
        }
      }

    } catch (error) {
      toast({
        title: "Error",
        // description: "Failed to submit the form. Please try again.",
        description: error.message,
        duration: 3000,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function onRemovePhoto() {
    setIsLoading(true);
    const fileName = userRole.toLowerCase() === 'influencer'
      ? profileData?.profilePicture.split("/").splice(-1)[0]
      : profileData?.logo.split("/").splice(-1)[0]

    try {
      const result = await userRemovePhotoRoute(
        // profileData.profilePicture,
        fileName,
        token,
        id,
        userRole
      );
      if (result.status === "success") {
        if (userRole.toLowerCase() === 'influencer') {
          await update({
            ...session,
            user: {
              ...session?.user,
              profilePicture: null,
            },
          });
        } else if (userRole.toLowerCase() === 'brand') {
          await update({
            ...session,
            user: {
              ...session?.user,
              logo: null
            },
          });
        }
        toast({
          title: "Success!",
          description: "Profile picture removed",
          duration: 3000,
        }); console.log(result, fileName);
      } else {
        toast({
          title: "Error",
          description: result.message,
          duration: 3000,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        duration: 3000,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...rest} control={control} trigger={trigger}>
      <form
        onSubmit={rest.handleSubmit(onSubmit)}
        className="space-y-8 max-w-3xl mx-auto py-10 flex flex-col items-center gap-y-2"
        id="fileUpload"
      >
        <FormField
          control={control}
          name={file.name}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Photo</FormLabel>
              <FormControl>
                <FileUploader
                  value={field.value}
                  onValueChange={field.onChange}
                  dropzoneOptions={dropZoneConfig}
                  className="relative bg-background rounded-lg p-2"
                >
                  <FileInput
                    id="fileInput"
                    className="outline-dashed outline-1 outline-slate-500"
                  >
                    <div className="flex items-center justify-center flex-col p-8 w-full ">
                      <CloudUpload className="text-gray-500 w-10 h-10" />
                      <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span>
                        &nbsp; or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        SVG, PNG, JPG, GIF, or JPEG
                      </p>
                    </div>
                  </FileInput>
                  <FileUploaderContent>
                    {formData.file &&
                      formData.file.length > 0 &&
                      formData.file.map((file, i) => (
                        <FileUploaderItem key={i} index={i}>
                          <Paperclip className="h-4 w-4 stroke-current" />
                          <span className="truncate max-w-[80%]">
                            {file.name}
                          </span>
                        </FileUploaderItem>
                      ))}
                  </FileUploaderContent>
                </FileUploader>
              </FormControl>
              <FormDescription>Select a file to upload.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {isLoading ? (
          <div className="flex justify-center">
            <LoaderCircle className="animate-spin h-8 w-8" />
          </div>
        ) : (
          <div className="flex flex-col md:w-[100%] md:flex-row justify-between gap-2 ">
            <Button
              type="submit"
              disabled={!formData.file || formData.file.length < 1}
            >
              Upload
            </Button>

            <Button
              disabled={userRole.toLowerCase() === 'influencer' && !profileData.profilePicture || userRole.toLowerCase() === 'brand' && !profileData.logo}
              type="button"
              variant="destructive"
              onClick={onRemovePhoto}
            >
              Remove
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
