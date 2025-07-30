# 🔍 SearchLog Service & Routes (Influencer Discovery)

Provides functionality to **search influencers** based on multiple filters including platform metrics, demographics, location, and interests. It also logs search filters per brand for tracking.

---

## 📌 Endpoint

| Method | Endpoint              | Description                       | Auth Required |
|--------|-----------------------|---------------------------------|---------------|
| POST   | `/search-influencers` | Search influencers by filters    | Yes           |

---

## 🔧 Service Methods

### `searchInfluencers(brandId, filters)`
- Filters influencers based on:
  - Location (country, city)
  - Age and age range
  - Gender
  - Interest categories, primary and secondary niches
  - Covo score (minimum overall)
- Queries influencer platform data (Instagram, YouTube, Facebook, Twitter) based on:
  - Platform selection (or all)
  - Follower count range
  - Engagement rate range
  - Age range
  - Gender distribution
  - Platform engagement metrics
- Merges influencer base data with platform-specific data.
- Logs the search filters (excluding `brandId`) into `SearchLog`.
- Returns matched influencers with platform data.

---

## ✅ Validation & Errors

- Throws error on invalid platform.
- Catches and logs errors during search.
- Uses MongoDB queries with flexible filter composition.

---

## 🧠 Notes

- Supports multi-platform and cross-filter searches.
- Filters apply to both influencer profiles and platform metrics.
- Search filters are saved for audit or analytics.
- Returns empty list if no influencers match.

---
