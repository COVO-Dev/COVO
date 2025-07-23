# 🔗 Referral Click Tracking - Developer Guide

This document describes the flow of the **Referral Click Tracking** feature in the COVO backend.

---

## 🎯 Purpose

To track when users click on a unique referral link shared by influencers, log analytics (location, device, etc.), and update campaign performance metrics.

---

## ⚙️ Full Flow Breakdown

### 📥 Incoming Request

* **Method**: `POST`
* **Route**: `api/ref/:referralCode`
* **Query Params (optional)**:

  * `postId`: ID of the campaign video post (for attribution)
  * `utm_source`: Where the click came from (e.g. `instagram`)
  * `utm_campaign`: The campaign name/tag

### ✅ Handler: `handleReferralClick`

1. **Identify Influencer**:

   * Finds the influencer using the `referralCode` in the URL params.
   * Returns `404` if not found.

2. **Get Campaign Performance**:

   * Retrieves the latest campaign performance record tied to the influencer.
   * Returns `404` if none found.

3. **Collect Click Metadata**:

   * `IP address`, `User-Agent`, `Geo Location`, `Device Type`, `Browser`, `OS`.
   * Uses `geoip-lite` and `ua-parser-js` to extract details.

4. **Check for Existing Click**:

   * If this user already clicked (same IP + User-Agent + influencer + campaign), do not duplicate the log.

5. **Create ClickLog Record**:

   * Saves full metadata to the `ClickLog` collection.
   * Includes optional `postId`, `utmSource`, `utmCampaign`.

6. **Update CampaignPerformance**:

   * Increments the `conversions` count by 1.
   * Updates the `lastUpdated` timestamp.

7. **Redirect**:

   * Redirects user to: `https://covo.co.za/campaign?utm_source=covo&utm_content=<referralCode>`

---

## 🧪 Local Route Usage

### 🔄 Track Click

```http
POST /ref/:referralCode
```

#### 🔍 Example

```
POST /ref/ABC123?postId=xyz123&utm_source=instagram&utm_campaign=summerLaunch
```

* Will create a click log if not already logged.
* Will increment conversion on influencer's current campaign.
* Will redirect user to COVO's campaign landing page.

---

## 📁 Related Models

* `Influencer`
* `CampaignPerformances`
* `ClickLog`

---

## 📦 Dependencies

* `geoip-lite`: Gets city/region/country from IP.
* `ua-parser-js`: Parses browser, OS, and device from user-agent.

---

## 📌 Notes

* Clicks from the same IP and user agent are not double-logged.
* Works only if influencer and campaign performance exist.
* Designed to work even if `utm_source` or `postId` are not present.
* The url link should on be created when a campaign is made and made avaliable when an influncer jioned the campaign
