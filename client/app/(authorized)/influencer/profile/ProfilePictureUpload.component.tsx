"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { CloudUpload, X } from "lucide-react";

import { influencerUploadPhotoRoute } from "@/lib/api/upload/influencer-upload-photo/influnecerUploadPhotoRoute";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setProfileData } from "@/lib/store/profile/profile.slice";
import { LoaderCircle } from "lucide-react";
// import { File } from "buffer";
import { useSession } from "next-auth/react";
import { userRemovePhotoRoute } from "@/lib/api/upload/user-remove-photo/userRemovePhotoRoute";
import { brandUploadPhotoRoute } from "@/lib/api/upload/brand-upload-photo/brandUploadPhotoRoute.route";
import { brandRemovePhotoRoute } from "@/lib/api/upload/brand-remove-photo/brandRemovePhotoRoute";

interface ProfilePictureUploadProps {
  token: string;
  id: string;
  userRole: string;
}

export default function ProfilePictureUpload({ token, id, userRole }: ProfilePictureUploadProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const dispatch = useAppDispatch();
  const profileData = useAppSelector((state) => (state.profile as any));
  const { update, data: session } = useSession();

  const dropZoneConfig = {
    maxFiles: 1,
    maxSize: 1024 * 1024 * 5, // 5MB limit as requested
    multiple: false,
    accept: { "image/*": [".png", ".jpeg", ".jpg", ".webp"] }, // Updated file types
  };

  // Handle file selection and preview
  const handleFileSelect = useCallback((files: File[]) => {
    if (files && files.length > 0) {
      const file = files[0];

      // Validate file
      if (file.size > dropZoneConfig.maxSize) {
        toast({
          title: "File Too Large",
          description: `File size must be less than 5MB. Current size: ${(file.size / (1024 * 1024)).toFixed(1)}MB`,
          variant: "destructive",
          duration: 5000,
        });
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a JPG, JPEG, PNG, or WebP image.",
          variant: "destructive",
          duration: 5000,
        });
        return;
      }

      // Clear previous preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      // Create new preview URL
      const newPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(newPreviewUrl);
      setSelectedFile(file);
    }
  }, [previewUrl, dropZoneConfig.maxSize]);

  // Clear file selection
  const handleClearFile = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
  }, [previewUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function handleUpload() {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select an image file to upload.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const formData = { file: [selectedFile] };

      if (userRole.toLowerCase() === 'influencer') {
        const result = await influencerUploadPhotoRoute(formData, token, id);
        if (result.status === "success") {
          const { profilePicture, ...rest } = result.data.data.user;
          await update({
            ...session,
            user: {
              ...session?.user,
              profilePicture,
            },
          });

          // Clear the preview after successful upload
          handleClearFile();

          toast({
            title: "Profile Picture Updated!",
            description: "Your new profile picture has been uploaded successfully.",
            duration: 4000,
            className: "bg-green-50 border-green-200 text-green-800",
          });
        }
      } else if (userRole.toLowerCase() === 'brand') {
        const result = await brandUploadPhotoRoute(formData, token, id);
        if (result.status === "success") {
          const { logo, ...rest } = result.data.data.user;
          await update({
            ...session,
            user: {
              ...session?.user,
              logo,
            },
          });

          // Clear the preview after successful upload
          handleClearFile();

          toast({
            title: "Profile Picture Updated!",
            description: "Your new profile picture has been uploaded successfully.",
            duration: 4000,
            className: "bg-green-50 border-green-200 text-green-800",
          });
        }
      }

    } catch (error: any) {
      console.error("Profile picture upload error:", error);

      let errorMessage = "Failed to upload profile picture. Please try again.";

      // Handle specific error types
      if (error?.message) {
        const message = error.message.toLowerCase();
        if (message.includes('file') && message.includes('size')) {
          errorMessage = "File size is too large. Please choose an image under 5MB.";
        } else if (message.includes('format') || message.includes('type')) {
          errorMessage = "Invalid file format. Please upload a JPG, JPEG, PNG, or WebP image.";
        } else if (message.includes('network') || message.includes('connection')) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Upload Failed",
        description: errorMessage,
        duration: 5000,
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
          title: "Profile Picture Removed",
          description: "Your profile picture has been successfully removed.",
          duration: 4000,
          className: "bg-blue-50 border-blue-200 text-blue-800",
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          duration: 3000,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Profile picture removal error:", error);

      let errorMessage = "Failed to remove profile picture. Please try again.";
      if (error?.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Removal Failed",
        description: errorMessage,
        duration: 5000,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Get current profile picture for fallback
  const currentProfilePicture = userRole.toLowerCase() === 'influencer'
    ? profileData.profilePicture || (session?.user as any)?.profilePicture
    : profileData.logo || (session?.user as any)?.logo;

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="space-y-6 flex flex-col items-center">
          {/* Image Preview Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-white shadow-xl">
                <AvatarImage
                  src={previewUrl || currentProfilePicture || undefined}
                  alt="Profile picture preview"
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 text-lg sm:text-2xl font-semibold">
                  {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>

              {/* Remove Preview Button */}
              {previewUrl && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleClearFile}
                  className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            {previewUrl && (
              <p className="text-sm text-green-600 font-medium text-center">
                Ready to upload: {selectedFile?.name}
              </p>
            )}
          </div>
        <div className="w-full">
          <div
            className="relative bg-white/50 backdrop-blur-sm rounded-xl border-2 border-dashed border-gray-300 hover:border-black transition-all duration-300 w-full cursor-pointer"
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            <input
              id="fileInput"
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                handleFileSelect(files);
              }}
              className="hidden"
            />
            <div className="flex items-center justify-center flex-col p-6 sm:p-8 w-full min-h-[160px] sm:min-h-[200px]">
              <div className="bg-gray-100 rounded-full p-3 sm:p-4 mb-3 sm:mb-4">
                <CloudUpload className="text-gray-600 w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <p className="mb-2 text-sm sm:text-base font-medium text-gray-900 text-center">
                <span className="font-semibold">Click to upload</span>
                &nbsp; or drag and drop
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mb-1 text-center">
                JPG, JPEG, PNG, or WebP
              </p>
              <p className="text-xs text-gray-400 text-center">
                Maximum file size: 5MB
              </p>
            </div>
          </div>
          <p className="text-center text-xs sm:text-sm text-gray-500 mt-3">
            Choose a clear, high-quality image for your profile picture.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-6">
            <div className="bg-black/10 backdrop-blur-sm rounded-full p-3 sm:p-4">
              <LoaderCircle className="animate-spin h-5 w-5 sm:h-6 sm:w-6 text-black" />
            </div>
            <span className="ml-3 text-sm font-medium text-gray-700">Uploading...</span>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row justify-center gap-3 w-full max-w-sm">
            <Button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile}
              className="bg-black hover:bg-gray-800 text-white font-medium px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
            >
              <CloudUpload className="w-4 h-4 mr-2" />
              Upload Picture
            </Button>

            <Button
              disabled={userRole.toLowerCase() === 'influencer' && !currentProfilePicture || userRole.toLowerCase() === 'brand' && !currentProfilePicture}
              type="button"
              variant="outline"
              onClick={onRemovePhoto}
              className="border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-medium px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
            >
              Remove Current
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
