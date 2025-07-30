# 📊 COVO Survey Module

This module manages feedback collection from **brands** and **influencers** within campaigns. It powers the COVO Score system, helping evaluate creator performance and brand reliability across the platform.

---

## 🌟 Features

- Submit feedback surveys for campaigns
- Compute & update:
  - Influencer **COVO Score**
  - Brand **Reliability Rating**
- Survey validation using Zod
- Prevent duplicate submissions
- Role-based access control (Brand or Influencer)
- Retrieve survey history

---

## 📦 Endpoints

All endpoints are protected by `authMiddleware`.

### 🔹 POST `/submit-survey`

Submit a feedback survey (from either a brand or influencer).

**Headers:**
- `Authorization: Bearer <token>`

**Body:**
```json
{
  "campaignId": "campaignId123",
  "influencerId": "influencerId123",
  "brandId": "brandId123",
  "type": "brand_feedback", // or "creator_feedback"
  "engagementPerception": 4,
  "deliveryConsistency": 5,
  "brandFeedback": 4,
  "audienceFit": 5,
  "communication": 4,
  "paymentTimeliness": 5,
  "respect": 5
}
``` 
### Required fields depend on type:
- brand_feedback: Influencer rates the brand
- creator_feedback: Brand rates the influencer

```GET /survey-history ```
- Get all submitted surveys for the current user (brand or influencer).

### Headers:
- Authorization: Bearer <token>

## Core Logic
## Validation
- Payloads are validated using Zod schema:
- Ensures required fields exist
- Validates numerical ratings and types

## COVO Score Calculation
### For Influencers:
```
ts
COVO Score = 
  (engagementPerception * 0.3) +
  (deliveryConsistency * 0.25) +
  (brandFeedback * 0.25) +
  (audienceFit * 0.2)
```
### For Brands:
```
ts
Reliability Score = 
  (communication * 0.4) +
  (paymentTimeliness * 0.3) +
  (respect * 0.3)
```
- Scores are averaged across multiple feedbacks and stored:
- Influencer.covoScore.overall
- Brand.reliabilityRating.overall

## Models Involved
CovoSurvey
Influencer
Brand
Campaign

## Authorization Rules
- Only a brand can submit creator_feedback
- Only an influencer can submit brand_feedback
- Duplicate submissions for the same campaign/type are blocked

## Flow
- A campaign ends,
- A brand submits feedback on the influencer
- Influencer’s covoScore is recalculated and updated
- Influencer submits feedback on the brand
- Brand’s reliabilityRating is recalculated and updated
- All surveys are stored and available via history endpoint

