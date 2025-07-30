# Campaign Service API Documentation

This document provides an overview of the Campaign Service API, detailing available endpoints, request parameters, and expected responses. The service manages campaigns for brands and influencers, including campaign creation, applications, invitations, and influencer management.

---

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Campaigns](#campaigns)
  - [Campaign Applications](#campaign-applications)
  - [Invitations](#invitations)
  - [Recommended Influencers](#recommended-influencers)
- [Error Handling](#error-handling)

---

## Overview

The Campaign Service allows brands to create and manage campaigns and influencers to apply or be invited to participate. Features include:

- Creating, updating, and deleting campaigns.
- Brands inviting influencers to campaigns.
- Influencers applying to campaigns.
- Managing invitations (accept/reject).
- Retrieving campaigns associated with brands or influencers.
- Retrieving recommended influencers for campaigns.

---

## Authentication

All endpoints require authentication via `authMiddleware`. Ensure the request includes a valid authentication token.

---

## Endpoints

### Campaigns

| Method | Endpoint                          | Description                                    |
|--------|---------------------------------|------------------------------------------------|
| GET    | `/campaigns`                    | Get all campaigns (paginated).                 |
| POST   | `/:brandId/campaigns`           | Create a new campaign for a brand.             |
| GET    | `/:brandId/campaigns`           | Get all campaigns associated with a brand.    |
| GET    | `/:brandId/campaign/:id`        | Get campaign details by brand and campaign ID.|
| PUT    | `/:brandId/campaign/:id`        | Update a campaign.                              |
| DELETE | `/:brandId/campaign/:id`        | Delete (soft-delete) a campaign.                |

#### Reject or Accept Influencer for Campaign

| Method | Endpoint                              | Description                          |
|--------|-------------------------------------|------------------------------------|
| PUT    | `/:brandId/campaign/:id/reject`     | Reject an influencer's application.|
| PUT    | `/:brandId/campaign/:id/accept`     | Accept an influencer for campaign. |

---

### Campaign Applications

| Method | Endpoint                                  | Description                                  |
|--------|-------------------------------------------|----------------------------------------------|
| POST   | `/:influencerId/campaign/:id/apply`       | Influencer applies to a campaign.            |
| PUT    | `/influencer/:influencerId/campaign/:id` | Edit an influencer's application (within 5 hours). |
| GET    | `/influencer/:influencerId/campaign/:id/applications` | Get a specific application by influencer and campaign. |
| GET    | `/influencer/:influencerId/applications` | Get all applications submitted by an influencer.      |
| GET    | `/:influencerId/campaigns/:brandId/applied` | Get campaigns applied to for a specific brand.        |
| GET    | `/:influencerId/campaigns/applied`       | Get all campaigns influencer applied to.                |

---

### Invitations

| Method | Endpoint                                                      | Description                                |
|--------|---------------------------------------------------------------|--------------------------------------------|
| POST   | `/:brandId/campaign/:id/invite`                               | Brand invites an influencer to a campaign.|
| GET    | `/:influencerId/campaigns/invitations`                       | Get all invitations received by an influencer. |
| PUT    | `/:influencerId/campaign/:campaignId/brand/:brandId/invitations/accept` | Influencer accepts an invitation.            |
| PUT    | `/:influencerId/campaign/:campaignId/brand/:brandId/invitations/reject` | Influencer rejects an invitation.            |

---

### Recommended Influencers

| Method | Endpoint                                    | Description                          |
|--------|---------------------------------------------|------------------------------------|
| GET    | `/:brandId/campaigns/:id/recommended`       | Get recommended influencers for a campaign.|

---

### Campaigns Registered by Influencer

| Method | Endpoint                                  | Description                          |
|--------|-------------------------------------------|------------------------------------|
| GET    | `/:influencerId/campaigns/registered`    | Get campaigns where influencer is registered.|

---

## Error Handling

The API returns appropriate HTTP status codes and error messages for cases such as:

- Invalid IDs (`400 Bad Request`)
- Resource not found (`404 Not Found`)
- Validation failures
- Server errors (`500 Internal Server Error`)

---

## Notes

- All IDs should be valid MongoDB ObjectIds.
- Campaign soft deletes do not remove the record but mark it as deleted.
- Applications can only be edited within 5 hours of submission.
- Chat rooms are automatically created when influencers are accepted into campaigns.
- Pagination parameters are available for list endpoints (`page`, `limit`).

---

If you want, I can help generate example request and response bodies for these routes as well!

---