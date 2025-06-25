'use client';

import { useEffect, useState } from 'react';
import InfluencerDetails from './InfluencerDetails.component';
import { getInfluencerDetailsRoute } from '@/lib/api/get-details/getInfluencerDetails.route';
import { useSession } from 'next-auth/react';

export default function InfluencerProfile({ influencerId }: string) {
  const [influencerData, setInfluencerData] = useState();
  const { update } = useSession();
  const { data: session, status } = useSession();
  const token = session?.user?.access_token;
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    async function getInfluencerDetails(token) {

      try {
        setIsLoading(true);
        console.log("token before request: ", token)
        if (token) {
          const response = await getInfluencerDetailsRoute(token, influencerId);
          console.log(response)

          if (response.status === "success") {
            const influencerDetails = response.data.data;
            setInfluencerData(influencerDetails)
          }
        }

      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    getInfluencerDetails(token)
  }, [token])

  console.log("influencerData", influencerData);

  return (
    <div>
      {/* {isLoading ? (<div> Alas</div>) : (<InfluencerDetails influencerData={influencerData} />)} */}
      {isLoading ? (
        <div>Loading...</div>
      ) : influencerData ? (
        <InfluencerDetails influencerData={influencerData} />
      ) : (
        <div>No data available.</div>
      )}
    </div>
  )
}
