import { Button } from "@/components/ui/button";
import { UserRoundPen } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UpdateProfile() {
  const router = useRouter();

  const handleEditProfile = () => {
    router.push("/influencer/profile/edit");
  };

  return (
    <Button
      onClick={handleEditProfile}
      className="text-lg w-[160px] text-center border-2 rounded-md text-white p-2 font-weight-[800] z-10 border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.3)] backdrop-blur-sm hover:bg-white/10 hover:border-white/30 hover:shadow-[0_0_15px_rgba(255,255,255,0.4)] transition-all duration-300"
    >
      <UserRoundPen className="mr-2" />
      Edit Profile
    </Button>
  );
}
