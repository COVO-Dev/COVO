import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTrigger,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProfilePictureUpload from "./ProfilePictureUpload.component";

export default function UpdateProfilePicture({ token, id, userRole }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <div className="absolute bottom-2 right-2 bg-black hover:bg-gray-800 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer z-20 transition-all duration-300 transform hover:scale-110 shadow-lg border-2 border-white">
          <Camera className="text-white" size={18} />
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent className="w-[95%] sm:w-[85%] md:w-[75%] lg:w-[65%] max-w-[650px] max-h-[90vh] p-0 border-0 bg-transparent shadow-none overflow-hidden">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
          <AlertDialogHeader className="bg-gradient-to-br from-gray-50 to-white p-4 sm:p-6 border-b border-gray-100 relative flex-shrink-0">
            <AlertDialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-2">
              Update Profile Picture
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm sm:text-base text-gray-600 text-center">
              Upload a new profile picture to personalize your account
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
            <ProfilePictureUpload token={token} id={id} userRole={userRole} />
          </div>

          <AlertDialogFooter className="bg-gray-50/50 p-3 sm:p-4 border-t border-gray-100 flex-shrink-0">
            <AlertDialogAction className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 sm:px-6 py-2 rounded-xl transition-all duration-300 text-sm sm:text-base">
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
