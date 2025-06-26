// Import necessary modules from AWS SDK
import {
  S3Client,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "../config/configuration";

// Validate environment variables
const requiredEnvVars = [
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_REGION",
  "AWS_BUCKET_NAME",
];

for (const envVar of requiredEnvVars) {
  if (!config[envVar]) {
    throw new Error(`Missing environment variable: ${envVar}`);
  }
}

// Initialize an S3 client with provided credentials
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY!,
  },
});

// Upload a file to AWS S3
export const uploadFileToAws = async (
  fileName: string,
  fileBuffer: Buffer
): Promise<string> => {
  try {
    const uriEncodedFileName = encodeURIComponent(fileName);

    const uploadParams: PutObjectCommandInput = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      // Key: fileName,
      Key: uriEncodedFileName,
      Body: fileBuffer,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));
    console.log("File uploaded successfully.");
    // return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uriEncodedFileName}`;
  } catch (err) {
    console.error("Error uploading file:", err);
    throw new Error("File upload failed");
  }
};

// Check if a file exists in AWS S3
export const isFileAvailableInAwsBucket = async (
  fileName: string
): Promise<boolean> => {
  try {
    const command = new HeadObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: fileName,
    });
    await s3Client.send(command);
    return true;
  } catch (err) {
    if (err instanceof Error && err.name === "NotFound") {
      return false;
    }
    console.error("Error checking file existence:", err);
    throw err;
  }
};

// Generate a signed URL to access a file in AWS S3
export const getFileUrlFromAws = async (
  fileName: string,
  expireTime: number | null = null
): Promise<string> => {
  try {
    // Verify file existence in the bucket
    const fileExists = await isFileAvailableInAwsBucket(fileName);
    if (!fileExists) {
      throw new Error("File does not exist in the bucket");
    }

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: fileName,
    });

    // Generate signed URL
    const url = await getSignedUrl(s3Client, command, {
      expiresIn: expireTime || 3600, // Default expiration time: 1 hour
    });
    return url;
  } catch (err) {
    console.error("Error generating signed URL:", err);
    throw new Error("Failed to generate signed URL");
  }
};

// Delete a file from AWS S3
export const deleteFileFromAws = async (fileName: string): Promise<void> => {
  try {
    const deleteParams = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: fileName,
    };

    await s3Client.send(new DeleteObjectCommand(deleteParams));
    console.log("File deleted successfully.");
  } catch (err) {
    console.error("Error deleting file:", err);
    throw new Error("File deletion failed");
  }
};
