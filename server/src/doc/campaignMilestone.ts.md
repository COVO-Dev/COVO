# 📌 Campaign Milestone API

This module manages milestones in influencer-brand campaigns. Brands can create, update, and delete milestones for influencers they've accepted into a campaign. Influencers can check milestones when completed, and brands can verify them afterward.

---

## 📁 Folder Overview

- **campaignMilestone.route.ts**: Defines HTTP routes related to campaign milestones.
- **campaignMilestone.service.ts**: Contains business logic and validation for milestones.

---

## 📌 Roles & Permissions

| Action                      | Allowed Role   |
|----------------------------|----------------|
| Create milestone           | Brand only     |
| Update milestone           | Brand only     |
| Delete milestone           | Brand only     |
| Influencer check milestone | Influencer only|
| Brand check milestone      | Brand only     |
| Get milestones             | Both roles     |

---

## 🔐 Authentication

All routes are protected by `authMiddleware`. The role is checked inside the service layer to ensure authorized actions.

---

## 🚦 Routes & Endpoints

### ➕ Create Milestone


- **Role**: Brand  
- **Body**:
```json
{
  "description": "Submit first draft",
  "dueDate": "2025-08-15T00:00:00Z",
  "influencerId": "influencerObjectId",
  "campaignId": "campaignObjectId"
}
GET /milestones/:campaignId/:influencerId?
```

### Update Milestone
PUT /milestones/:id
```
{
  "description": "Revised milestone text",
  "dueDate": "2025-08-20T00:00:00Z",
  "notes": "Optional notes here"
}
```
### Delete MileStone
DELETE /milestones/:id
- Role: Brand
- Description: Deletes the milestone permanently.

### Influencer Checks Milestone
PUT /milestones/influencer-check/:milestoneId/:influencerId
- Role: Influencer
- Description: Marks the milestone as completed by the influencer.

### Brand Verifies Milestone
PUT /milestones/brand-check/:milestoneId
- Role: Brand
- Description: Marks the milestone as verified by the brand after influencer check.

## Business Rules
- A brand can only create milestones for influencers already accepted into their campaign.
- Influencer must check a milestone before a brand can verify it.
- Only allowed fields (description, dueDate, notes) can be updated.
- Milestones are sorted by dueDate when fetched.

## Milestone Data Model (Simplified)
```
{
  description: string;
  dueDate: Date;
  notes?: string;
  influencerId: ObjectId;
  campaignId: ObjectId;
  influencerChecked: boolean;
  brandChecked: boolean;
}
```

