'use-client';

import { useEffect, useState } from "react";
import OAuthHero from "./OAuth.component";
import { getYoutubeAuthUrlRoute } from "@/lib/api/get-auth-url/getYoutubeAuthUrl.route"
import { getFacebookAuthUrlRoute } from "@/lib/api/get-auth-url/getFacebookAuthUrl.route"
import { getInstagramAuthUrlRoute } from "@/lib/api/get-auth-url/getInstagramAuthUrl.route"
import { getTwitterAuthUrlRoute } from "@/lib/api/get-auth-url/getTwitterAuthUrl.route"
import { useAppSelector } from "@/lib/store/hooks";
import { toast } from "@/hooks/use-toast";

export default function OAuthPage() {
  const { _id, access_token } = useAppSelector(state => state.profile);
  const [platformAuthUrl, setPlatformAuthUrl] = useState<Object[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Add isLoading state


  useEffect(() => {
    async function getAllAuthUrls(token: string) {
      setIsLoading(true); // Set isLoading to true before fetching

      const PlatformFunctionObject = {
        'youtube': getYoutubeAuthUrlRoute,
        'facebook': getFacebookAuthUrlRoute,
        'instagram': getInstagramAuthUrlRoute,
        'twitter': getTwitterAuthUrlRoute,
      };

      try {
        if (token) {
          const urlArray = [];

          for (const step in PlatformFunctionObject) {
            const functionAsync = PlatformFunctionObject[step];
            const result = await functionAsync(token);

            if (result.status === 'success') {
              const resultObject = {
                [step]: result.data.authUrl,
              };
              // console.log("url Result: ", result.data.authUrl);
              // console.log("platformAuthUrl entry: ", resultObject);
              urlArray.push(resultObject);
            } else {
              // console.log(result);
              toast({
                title: "Error",
                description: result.message,
                duration: 3000,
                variant: "destructive",
              });
            }
          }
          setPlatformAuthUrl(urlArray);
        }
      } catch (error) {
        console.error("Error fetching auth URLs:", error);
      } finally {
        setIsLoading(false); // Set isLoading to false after fetching (or error)
      }
    }

    getAllAuthUrls(access_token);
  }, [access_token]);

  return (
    <section className="h-full flex flex-col justify-center items-center bg-blue-100 ">
      <OAuthHero platformAuthUrl={platformAuthUrl} isLoading={isLoading} className='' />
    </section>
  )
}