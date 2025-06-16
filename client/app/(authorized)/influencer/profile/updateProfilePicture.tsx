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
import { Camera } from "lucide-react";
import ProfilePictureUpload from "./ProfilePictureUpload.component";

export default function UpdateProfilePicture({ token, id, userRole }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <div className="absolute bottom-2 right-2 bg-blue-300 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer z-20 hover:bg-blue-100 duration-300 ">
          {" "}
          {/* Camera icon div */}
          <Camera className="text-white" size={20} />{" "}
          {/* Assuming you're using Lucide React's Camera icon */}
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent className="w-[80%] md:w-[60%] h-auto md:p-[1em] max-w-[720px] ">
        <AlertDialogHeader className='bg-custom-light-grayish-blue bg-[url("/svg/BG.svg")] rounded-md shadow-lg md:p-[30px] flex-col flex justify-center items-center w-full h-full'>
          <AlertDialogDescription>
            Dialog box for uploading your profile picture
          </AlertDialogDescription>
          <AlertDialogTitle>Upload a profile photo</AlertDialogTitle>
          {/* <InfluencerUpdateForm /> */}
          <ProfilePictureUpload token={token} id={id} userRole={userRole} />
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>Close Window</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
