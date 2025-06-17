import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { UserRoundPen } from "lucide-react";
import InfluencerUpdateForm from "./InfluencerUpdateForm";
import getCurrentUserData from "@/utils/getCurrentUserData";
import { useEffect, useState } from "react";
import IInfluencerUpdate from "@/components/authorized/influencer/update-info/UpdateInformationForm.model";
import UpdateInformationForm from "@/components/authorized/influencer/update-info/UpdateInformationForm.page";
import { useAppSelector } from "@/lib/store/hooks";
import { useSession } from "next-auth/react";

export default function UpdateProfile() {
  const [userData, setUserData] = useState<IInfluencerUpdate>();
  // const [userData, setUserData] = useState({});
  const profile = useAppSelector((state) => state.profile);
  const { data: session } = useSession();

  const loadUserData = async () => {
    try {
      const data = await getCurrentUserData();
      const { access_token, __v, ...rest } = data;

      // console.log("User data fetched:", rest);

      setUserData(rest);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  // console.log("store influencer profile: \n", profile, "userData state: \n", userData);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="text-lg w-[160px] text-center border-2 rounded-md text-white p-2 font-weight-[800] z-10 border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.3)] backdrop-blur-sm">
          {" "}
          <UserRoundPen /> Edit Profile{" "}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="w-full md:w-[90%] h-[90%] md:p-[1em] max-w-[1000px] ">
        <AlertDialogHeader className='bg-custom-light-grayish-blue bg-[url("/svg/BG.svg")] rounded-md shadow-lg md:p-[30px] flex-col flex justify-center items-center w-full h-full'>
          <AlertDialogTitle>Update your information</AlertDialogTitle>
          {/* <InfluencerUpdateForm /> */}
          <UpdateInformationForm influencerData={userData} />
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>Close Window</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
