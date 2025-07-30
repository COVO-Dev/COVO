# AWS S3 Upload Service

This service handles file uploads, retrieval, and deletion on AWS S3 for Influencer profile pictures, Brand logos, and other content files like rate cards and media kits.

---

## Features

- Upload files to AWS S3 (profile pictures, logos, content files)
- Generate signed URLs for secure file access
- Check file existence in S3 bucket
- Delete files from S3 bucket
- Manage profile pictures and logos in your database with updated URLs
- Secure endpoints with authentication middleware

---

## Environment Variables

Ensure the following environment variables are set for AWS S3 access:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `AWS_BUCKET_NAME`

---

## API Endpoints

| Method  | Endpoint                                      | Description                          | Auth Required | Request Body / Params                    |
|---------|-----------------------------------------------|------------------------------------|---------------|-----------------------------------------|
| POST    | `/upload/:influencerId/profile`               | Upload influencer profile picture  | Yes           | Form-data file field named `file`       |
| POST    | `/upload/:brandId/logo`                        | Upload brand logo                  | Yes           | Form-data file field named `file`       |
| POST    | `/upload/:influencerId/content`                | Upload influencer content file (rate card or media kit) | Yes | Form-data file `file` + body param `fileType` (`rateCard` or `mediaKit`) |
| GET     | `/file/:fileName`                              | Get a signed URL to access a file  | No            | URL param: `fileName` (URI encoded)     |
| DELETE  | `/file/:fileName`                              | Delete a file from S3 bucket       | No            | URL param: `fileName` (URI encoded)     |
| PATCH   | `/remove/:influencerId/profile/:fileName`     | Remove influencer profile picture  | Yes           | URL param: `fileName` (URI encoded)     |
| PATCH   | `/remove/:brandId/logo/:fileName`              | Remove brand logo                  | Yes           | URL param: `fileName` (URI encoded)     |

---

## Usage Details

### Uploading a file

- Use `multipart/form-data` with a `file` field.
- For influencer content files, include a `fileType` field with either `rateCard` or `mediaKit`.
- The uploaded file will be stored in your configured AWS S3 bucket.
- The respective database document (Influencer or Brand) is updated with the new file URL.

### Accessing files

- Use the GET `/file/:fileName` endpoint to get a signed URL valid for 1 hour by default.
- The `fileName` should be URL-encoded when used in the route.

### Deleting files

- Use DELETE `/file/:fileName` to remove files directly from S3.
- Use PATCH endpoints to remove profile pictures or logos from both S3 and update the database accordingly.

---

## Important Notes

- File names are URI encoded before uploading to prevent issues with special characters.
- Ensure that the `fileName` URL parameters are URI encoded when making requests.
- The service validates MongoDB ObjectIds for `influencerId` and `brandId` before database operations.
- Authenticated routes require a valid token/session via `authMiddleware`.
- Upload size limits and file type validation should be implemented at middleware or client side as needed.

---

## Example Request: Upload Influencer Profile Picture

```bash
POST /upload/60f9a1b12c9d440000a1e5b4/profile
Authorization: Bearer your_token_here
Content-Type: multipart/form-data
```