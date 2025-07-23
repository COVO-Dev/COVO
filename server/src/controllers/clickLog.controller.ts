import { Request, Response } from 'express';
import { Influencer } from '../models/influencers.models';
import { CampaignPerformances } from '../models/campaignAnalytics.models';
import { ClickLog } from '../models/clickLog.model';
import geoip from 'geoip-lite';
import * as UAParser from 'ua-parser-js';
import { asyncHandler } from '../middleware/helper';

export const handleReferralClick = asyncHandler(async (req: Request, res: Response) => {
    const { referralCode } = req.params;
    const { postId, utm_source, utm_campaign } = req.query;

    const influencer = await Influencer.findOne({ referralCode });
    if (!influencer) return res.status(404).send('Invalid referral link');

    const performance = await CampaignPerformances.findOne({ influencerId: influencer._id }).sort({ createdAt: -1 });
    if (!performance) return res.status(404).send('No active campaign performance record found');

    const ip = req.ip;
    const userAgent = req.headers['user-agent'] || '';
    const parser = new UAParser.UAParser(userAgent);
    const deviceInfo = parser.getResult();
    const geo = geoip.lookup(ip);

    const existing = await ClickLog.findOne({
        influencerId: influencer._id,
        campaignId: performance.campaignId,
        ip,
        userAgent,
    });
    if (existing) {
        return res.redirect(302, `https://covo.co.za/campaign?utm_source=covo&utm_content=${referralCode}`); // Update this URL link
    }

    await ClickLog.create({
        influencerId: influencer._id,
        campaignId: performance.campaignId,
        ip,
        userAgent,
        device: deviceInfo.device?.type || 'desktop',
        browser: deviceInfo.browser?.name,
        os: deviceInfo.os?.name,
        country: geo?.country,
        region: geo?.region,
        city: geo?.city,
        postId: typeof postId === 'string' ? postId : undefined,
        utmSource: typeof utm_source === 'string' ? utm_source : undefined,
        utmCampaign: typeof utm_campaign === 'string' ? utm_campaign : undefined,
    });

    await CampaignPerformances.updateOne(
        { _id: performance._id },
        { $inc: { conversions: 1 }, $set: { lastUpdated: new Date() } }
    );

    return res.redirect(302, `https://covo.co.za/campaign?utm_source=covo&utm_content=${referralCode}`);
});