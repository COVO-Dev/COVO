# 🏢 Brand Service & Routes

This module provides functionality for **retrieving**, **updating**, and **searching** brand accounts. It includes full and partial updates, detail lookup, and pagination-enabled search.

---

## 📌 Endpoints

All routes are protected with `authMiddleware`.

| Method | Endpoint             | Description                         |
|--------|----------------------|-------------------------------------|
| GET    | `/brands`            | Fetch all brands                    |
| GET    | `/brands/search`     | Search brands with pagination       |
| GET    | `/brand/:id`         | Get brand by ID                     |
| PUT    | `/brand/:id`         | Full update of brand details        |
| PATCH  | `/brand/:id`         | Partial update of brand details     |

---

## 🔧 Service Methods

### `getAllBrands()`
- Retrieves all brand documents excluding passwords.
- Populates associated `campaigns`.

### `getBrandDetails({ id })`
- Finds a brand by ID.
- Excludes sensitive fields.

### `getBrandAndUpdate(payload)`
- Fully replaces brand document with provided payload.
- Requires valid ID.

### `updateBrand(payload)`
- Partially updates brand document.
- Validates input with `brandRegisterSchema`.

### `searchBrands(searchParams, page?, limit?)`
- Searches brands by industry using regex.
- Supports pagination with default `page = 1`, `limit = 10`.

---

## ✅ Validation & Errors

- Payloads are validated using **Zod schemas**.
- Errors handled with custom classes:
  - `HttpError` for general errors
  - `ResourceNotFound` for missing records

---

## 🧠 Notes

- `PUT` is used for full brand replacement.
- `PATCH` is used for partial updates.
- Password field is excluded from all responses.
- Search supports filtering by `industry` and paginates results.

