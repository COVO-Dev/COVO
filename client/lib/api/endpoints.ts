const endpoints = {
  login: "/auth/login",
  brandRegister: "/auth/register/brand",
  influencerRegister: "/auth/register/influencer",

  updateBrand: "/brand/:id",
  updateInfluencer: "/influencer/:id",
  fullUpdateInfluencer: "/influencer/:id",

  getNotifications: "/notifications/:recipient_id",
  deleteNotification: "/notifications/:recipient_id/:notification_id",

  // File upload URLs
  influencerUploadPhoto: "/upload/:influencerId/profile",
  influencerRemovePhoto: "/remove/:influencerId/profile/:fileName",
  brandUploadPhoto: "/upload/:brandId/logo",
  brandRemovePhoto: "/remove/:brandId/logo/:fileName",
  userGetFileURL: "/file/:fileName",
  chatUploadPhoto: "/upload",

  // Search URLs
  searchInfluencer: "/influencer/search",
  getInfluencerDetails: "/influencer/:influencerId",

  // Campaign URLs
  createCampaign: "/:brandId/campaigns",
  getCampaignByBrandId: "/:brandId/campaigns",
  getCampaignById: "/:brandId/campaign/:campaignId",
  applyToCampaign: "/:influencerId/campaign/:campaignId/apply",
  getRecommendedInfluencers: "/:brandId/campaigns/:campaignId/recommended",
  editCampaign: "/:brandId/campaign/:campaignId/accept",
  rejectInfluencerForCampaign: "/:brandId/campaign/:campaignId/reject",
  getAppliedCampaignsForInfluencer: "/:influencerId/campaigns/applied",
  getRegisteredCampaignsForInfluencer: "/:influencerId/campaigns/registered",
  // to be overridden
  getAllCampaigns: "/campaigns",

  // Auth credentials URLS
  getYoutubeAuthUrl: "/oauth/authorize/youtube",
  getFacebookAuthUrl: "/oauth/authorize/facebook",
  getInstagramAuthUrl: "/oauth/authorize/instagram",
  getTwitterAuthUrl: "/oauth/authorize/twitter",

  // chat URLs
  getAllChatRoomsForUser: "/chatrooms/:userId",
  getAllMessagesInChatroom: "/messages/:chatId",

  // deactivate account
  deactivateAccount: "/deactivate/:userId",
};
type TEndpoints = keyof typeof endpoints;
for (const key in endpoints) {
  endpoints[key as TEndpoints] =
    process.env.SERVER_URL + "/api" + endpoints[key as TEndpoints];
}
export default endpoints;
