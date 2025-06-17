'use client';

import { useSearchParams, useParams } from 'next/navigation';
import ApplyToCampaign from '@/components/authorized/influencer/campaign/apply-to-campaign/CampaignApply.page';
import InfluencerProfile from '@/components/authorized/brand/influencer-profile/InfluencerProfile.page';
import { useSession } from 'next-auth/react';
import { use } from 'react';

export default function Page({ params }) {
  const { id } = use(params);

  return (
    <InfluencerProfile influencerId={id} />
  )
}