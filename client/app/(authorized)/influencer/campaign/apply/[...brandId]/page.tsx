'use client';
import { useSearchParams, useParams } from 'next/navigation';
import ApplyToCampaign from '@/components/authorized/influencer/campaign/apply-to-campaign/CampaignApply.page';

export default function Page({ params }) {
  const searchParams = useSearchParams();
  const campaignId = searchParams.get('campaignId');
  const { brandId } = params;

  return (
    <ApplyToCampaign campaignId={campaignId} brandId={brandId} />
  )
}