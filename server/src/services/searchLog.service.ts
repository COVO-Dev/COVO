import { Instagram } from "../models/instagram.model";
import { Youtube } from "../models/youtube.model";
import { Facebook } from "../models/facebook.model";
import { Twitter } from "../models/twitter.model";
import { Influencer } from "../models/influencers.models";
import { SearchLog } from "../models/searchLog.models";
import { ISearchLog, ServiceResponse } from "../types";

export class SearchLogService {
    public async searchInfluencers(brandId: string, filters: any): Promise<ServiceResponse<any>> {
        try {
            const {
                platform,
                followerCount,
                engagementRate,
                location,
                age,
                gender,
                ageRange,
                interestCategories,
                primaryNiche,
                secondaryNiche,
                genderDistribution,
                platformEngagement,
            } = filters;

            const influencerQuery: any = {};

            if (location) {
                if (location.country) influencerQuery["location.country"] = location.country;
                if (location.city) influencerQuery["location.city"] = location.city;
            }

            if (age) {
                influencerQuery["age"] = { $gte: age.min, $lte: age.max };
            }

            if (gender) {
                influencerQuery["gender"] = { $in: gender };
            }

            if (interestCategories?.length > 0) {
                influencerQuery["$or"] = [
                    { "contentAndAudience.primaryNiche": { $in: interestCategories } },
                    { "contentAndAudience.secondaryNiche": { $in: interestCategories } }
                ];
            }

            if (primaryNiche) influencerQuery["contentAndAudience.primaryNiche"] = primaryNiche;
            if (secondaryNiche) influencerQuery["contentAndAudience.secondaryNiche"] = secondaryNiche;

            const influencers = await Influencer.find(influencerQuery);
            const influencerIds = influencers.map((influencer) => influencer._id);

            if (influencerIds.length === 0) {
                return { status_code: 200, message: "No influencers found", data: [] };
            }

            const platformModels: Record<string, any> = {
                youtube: Youtube,
                instagram: Instagram,
                facebook: Facebook,
                twitter: Twitter
            };

            const selectedPlatform = platform ? platform.toLowerCase() : null;
            let platformData = [];

            if (!selectedPlatform || selectedPlatform === "all") {
                const platformQueries = Object.values(platformModels).map(model =>
                    model.find({
                        influencerId: { $in: influencerIds },
                        ...(followerCount ? { "metrics.followers": { $gte: followerCount.min, $lte: followerCount.max } } : {}),
                        ...(engagementRate ? { "metrics.engagementRate": { $gte: engagementRate.min, $lte: engagementRate.max } } : {}),
                        ...(ageRange ? { "demographics.age": { $gte: ageRange.min, $lte: ageRange.max } } : {}),
                        ...(genderDistribution ? { "demographics.genderStats": { $in: genderDistribution } } : {}),
                        ...(platformEngagement ? { "peakEngegement.engagement": { $gte: platformEngagement.min, $lte: platformEngagement.max } } : {}),
                    })
                );
                const platformResults = await Promise.all(platformQueries);
                platformData = platformResults.flat();
            } else if (platformModels[selectedPlatform]) {
                platformData = await platformModels[selectedPlatform].find({
                    influencerId: { $in: influencerIds },
                    ...(followerCount ? { "metrics.followers": { $gte: followerCount.min, $lte: followerCount.max } } : {}),
                    ...(engagementRate ? { "metrics.engagementRate": { $gte: engagementRate.min, $lte: engagementRate.max } } : {}),
                    ...(ageRange ? { "demographics.age": { $gte: ageRange.min, $lte: ageRange.max } } : {}),
                    ...(genderDistribution ? { "demographics.genderStats": { $in: genderDistribution } } : {}),
                    ...(platformEngagement ? { "peakEngegement.engagement": { $gte: platformEngagement.min, $lte: platformEngagement.max } } : {}),

                });
            } else {
                throw new Error("Invalid platform specified");
            }

            const influencerMap = new Map(influencers.map((inf) => [inf._id.toString(), inf.toObject()]));

            const mergedResults = platformData.map((platformEntry) => {
                const influencer = influencerMap.get(platformEntry.influencerId.toString());
                return {
                    ...influencer,
                    platformData: platformEntry,
                };
            });

            const { brandId: temp, ...logFilters } = filters;
            await new SearchLog({ brandId, filters: logFilters }).save();

            return {
                status_code: 200,
                message: "Search successful",
                data: mergedResults,
            };

        } catch (error) {
            console.error("Error while searching influencers:", error);
            throw new Error(`Error while searching influencers: ${error.message}`);
        }
    }
}
