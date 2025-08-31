import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { UserRoundPen } from 'lucide-react';
import InfluencerUpdateForm from "./influencerUpdateForm";

export default function UpdateProfile() {

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="text-lg w-[160px] text-center border-2 rounded-md text-white p-2 font-weight-[800] z-10 border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.3)] backdrop-blur-sm"> <UserRoundPen /> Edit Profile </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="w-[90%] h-[90%]">
        <AlertDialogHeader className='bg-custom-light-grayish-blue bg-[url("/svg/BG.svg")] rounded-md shadow-lg p-[30px] flex-col flex justify-center items-center w-full h-full'>
          <AlertDialogTitle></AlertDialogTitle>
          <InfluencerUpdateForm />
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>Close Window</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}