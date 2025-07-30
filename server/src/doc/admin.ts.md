# 📘 Admin Service & Routes

This module provides admin-level operations for managing users and retrieving platform statistics. It includes functionalities to **view**, **update**, **delete users**, and **fetch platform-wide metrics**.

---

## 📂 Endpoints

All routes are prefixed and protected by authentication and authorization middleware (`authMiddleware`, `isAdminAndHasPermission` where applicable).

| Method | Endpoint                             | Description                         |
|--------|--------------------------------------|-------------------------------------|
| GET    | `/admin/:adminId/users`              | Fetch all users (excluding passwords) |
| PUT    | `/admin/:adminId/users/:id`          | Update a specific user              |
| DELETE | `/admin/:adminId/users/:id`          | Delete a specific user              |
| GET    | `/admin/:adminId/platform`           | Get platform stats (user counts)    |

---

## 🔒 Middleware

- `authMiddleware`: Ensures the user is authenticated.
- `isAdminAndHasPermission`: Verifies the user has admin privileges (used for fetching all users).

---

## 🧠 Service Methods

### `getAllUsersByAdmin(adminId: string)`
Fetches all registered users from the database, excluding password fields.

- **Returns:** `ServiceResponse<IUser[]>`

---

### `updateUserByAdmin(adminId: string, id: string, data: IUser)`
Updates a user's information by ID.

- **Returns:** `ServiceResponse<IUser>`

---

### `deleteUserByAdmin(adminId: string, id: string)`
Deletes a user from the system by ID.

- **Returns:** `ServiceResponse<IUser>`

---

### `getPlatformData(adminId: string)`
Retrieves platform-wide metrics: total users, brands, influencers, and admins (active only).

- **Returns:** `ServiceResponse<IPlatformData>`

---

## ✅ Validation & Errors

All service methods validate required parameters (`adminId`, `userId`, etc.) and throw:
- `BadRequest` for missing fields
- `ResourceNotFound` if the entity doesn't exist
- `HttpError` or `ServerError` for server-related failures

---
## Example Request
```
GET /admin/64acbe1b12/users
Authorization: Bearer <token>

{
  "status_code": 200,
  "message": "Users fetched successfully",
  "data": [
    {
      "_id": "123",
      "name": "John Doe",
      "email": "john@example.com"
    }
  ]
}
```