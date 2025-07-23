# 📊 COVO Analytics Flow Documentation

## Overview

The COVO analytics system enables the collection, standardization, and storage of post-level performance metrics from social media platforms (e.g., YouTube, Instagram, TikTok). It supports access token-based API fetching and scraping-based fallbacks, and integrates with campaign and referral reporting systems.

## 🔁 High-Level Flow

- User submits a social media post URL.

- Backend identifies the platform (YouTube, Instagram, TikTok).

- Platform service is called to fetch metrics using access token (primary) or scraping (fallback).

- Metrics are normalized to a standard format.

- Normalized metrics are saved to CampaignPerformances if linked to a campaign.

- Referral report is updated/exported with the same standardized metrics.


⚙️ How It Works (Flow)
Frontend collects a social media post URL from the influencer (e.g., during campaign progress reporting).

It makes a POST request to POST /metrics/extract with the URL and related campaign data.

The backend:

Detects the platform (youtube, instagram, facebook, etc.).

Calls the platform-specific service (e.g., getYouTubeMetrics()).

Fetches metrics using either access tokens or scraping as fallback.

Stores the metrics in the CampaignPerformances model.

A brand can later download the performance report as a CSV file via GET /metrics/download/:campaignId.

🔐 Authentication
All routes are protected by authMiddleware. Only authenticated users can access.

## 🧪 Local Routes
1. Extract Metrics from URL
```bash
Copy
Edit
POST /metrics/extract
```
# 📥 Body (JSON)
```json
{
  "url": "https://www.instagram.com/reel/xyz123",
  "campaignId": "64e41a72a9ef883ccdfc1234",
  "influencerId": "64e41a72a9ef883ccdfc5678",
  "startFollowers": 12345,
  "endFollowers": 12800
}
```

## 📤 Response
```json
{
  "message": "Metrics extracted and saved successfully",
  "data": {
    "campaignId": "...",
    "platform": "instagram",
    "postId": "...",
    "metrics": {
      "views": 4000,
      "likes": 800,
      "comments": 90
    },
    ...
  }
}
```
2. Download Campaign Metrics as CSV
```bash
GET /metrics/download/:campaignId
```
## 📥 Params
campaignId: The ID of the campaign you want a performance report for.

## 📤 Response
Returns a downloadable .csv file with performance metrics for all influencers in the campaign.

## 📌 Notes
- detectPlatform() detects the platform based on the URL structure.

- Each platform service handles its own token validation and fallback scraping if necessary.

- If metrics fetching fails, a warning is added in the response.