# 🔐 Auth Service & Routes

This module handles user registration, login, and password reset functionality for three user types: **Influencer**, **Brand**, and **Admin**.

---

## 📌 Endpoints

| Method | Endpoint                   | Description                            |
|--------|----------------------------|----------------------------------------|
| POST   | `/register/influencer`     | Register an Influencer                 |
| POST   | `/register/brand`          | Register a Brand                       |
| POST   | `/register/admin`          | Register an Admin                      |
| POST   | `/login`                   | Login user                             |
| POST   | `/forgot-password`         | Send password reset link               |
| POST   | `/reset-password`          | Reset password via token               |

---

## 🚀 Core Service Methods

### `registerInfluencer(payload)`
- Validates payload using `Zod`.
- Checks for email duplication or deleted account.
- Generates unique referral code.
- Sends welcome email.
- Returns JWT access token and influencer data.

### `registerBrand(payload)`
- Validates payload using `Zod`.
- Ensures all required fields are present.
- Sends welcome email.
- Returns JWT token and brand data.

### `registerAdmin(payload)`
- Validates payload using `Zod`.
- Verifies role is strictly `Admin`.
- Sends welcome email.
- Returns JWT token and admin data.

### `login(email, password)`
- Validates credentials.
- Checks user existence and password match.
- Returns access token on success.

### `forgetPassword(email)`
- Looks up user by email.
- Generates secure reset token and expiration time.
- Sends password reset email with token link.

### `resetPassword(token, newPassword, confirmPassword)`
- Verifies token and expiration.
- Validates password match.
- Updates password and clears reset fields.

---

## ✅ Validations

- **Zod schemas** are used for strict payload validation per user type.
- Custom error messages are returned for incomplete forms, duplicate users, or expired tokens.
- Tokens are signed with `JWT` and respect role-based access control.

---

## 🔐 Tokens & Security

- Tokens are generated with `jsonwebtoken`.
- Passwords are hashed using `bcrypt`.
- Reset tokens are securely generated and hashed using `crypto`.

---

## 📨 Email Features

- Sends welcome emails post-registration.
- Sends secure reset password links with embedded JWT tokens.

---

## 📣 Note

- Consent to **terms**, **privacy policy**, and **data compliance** is required for all registrations.
- Reset password tokens expire in **1 hour**.
- Auth tokens expire in **10–50 days** depending on user type.
