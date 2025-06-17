'use client';

import BrandCampaignDetails from '@/components/authorized/brand/campaign/details/BrandCampaignDetails.page';

export default function Page({ params }) {
  const { campaignId } = params;

  return (
    <BrandCampaignDetails campaignId={campaignId} />
  )
}