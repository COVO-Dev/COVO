# 👤 Influencer Management Module

This module provides CRUD operations and advanced search capabilities for managing influencer profiles in the system. It also allows for updating influencer payout preferences.

---

## 📌 Features

- Retrieve influencer details
- Perform partial or full updates
- Search influencers with filters and pagination
- Update payout preferences (`bank` or `wallet`)
- Zod validation for input schemas
- Robust error handling

---

## 🛣️ API Endpoints

All endpoints are protected with `authMiddleware`.

---

### 🔍 GET `/influencer/search`

Search influencers based on multiple filters.

**Query Params (optional):**
- `name`
- `username`
- `primaryNiche`
- `secondaryNiche`
- `country`
- `page` (default: 1)
- `limit` (default: 10)

**Response:**
```json
{
  "status_code": 200,
  "message": "Influencers found.",
  "data": {
    "data": [/* influencers */],
    "totalCount": 50,
    "totalPages": 5,
    "currentPage": 1
  }
}
```

### 📄 GET /influencer/:id  
- Get influencer details by ID.

Response:
```json
{
  "status_code": 200,
  "message": "User found",
  "data": {
    "_id": "123...",
    "username": "influencer_name",
    ...
  }
}
```
### PUT /influencer/:id
- Partial update of influencer data.
Body:
```json
{
  "id": "influencerId",
  "bio": "Updated bio",
  "country": "Canada"
}
```

- Response:
```json
{
  "status_code": 200,
  "message": "User updated",
  "data": { /* updated influencer */ }
}
```

### PATCH /influencer/:id
- Full update of influencer data using $set.
Body:
```json
{
  "id": "influencerId",
  "username": "newUsername",
  "bio": "Complete updated info"
}
```
Response:
```json
{
  "status_code": 200,
  "message": "Influencer information updated successfully.",
  "data": { /* updated influencer */ }
}
```
### PATCH /influencer/:id/payout-preference
- Update an influencer's payout preference.
Body:
```json
{
  "payoutPreference": "bank" // or "wallet"
}
```
Response:
```json
{
  "status_code": 200,
  "message": "Payout preference updated successfully.",
  "data": { /* updated influencer */ }
}
```
### Advanced Search Logic
- Search uses a MongoDB aggregation pipeline with the following matching fields:
- username, name
- contentAndAudience.primaryNiche
- contentAndAudience.secondaryNiche
- location.country

### Pagination is controlled using:
- page
- limit

### Validation
- Uses Zod for schema validation via influencerMoreInformationSchema
- All ObjectIds are validated using mongoose.Types.ObjectId.isValid()

### Services Overview
- getInfluencerDetails(id: string)
- Retrieves a user by ID, excluding the password.

- getInfluencerAndUpdate(payload: Partial<IInfluencer>)
- Validates and updates fields using PUT logic (findByIdAndUpdate).

- updateInfluencer(payload: Partial<IInfluencer>)
- Performs full update with $set for PATCH requests.

- searchInfluencers(searchParams, page, limit)
- Runs an aggregation with dynamic filters and returns paginated results.

- updateInfluencerPayoutPreference(id: string, preference: 'bank' | 'wallet')
- Updates payout settings for the influencer.