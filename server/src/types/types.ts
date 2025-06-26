export type AllowedFileTypes = 
  | "image/jpeg"
  | "image/png"
  | "image/svg"
  | "image/gif"
  | "application/pdf"
  | "application/msword"  // For Word documents
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document" // For Word documents (.docx)
  | "application/vnd.ms-excel" // For Excel files
  | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" // For Excel files (.xlsx)
  | "application/zip"
  | "text/plain"
  | "video/mp4"   
  | "audio/mp3"

export const allowedTypes: AllowedFileTypes[] = [
  "image/jpeg",
  "image/png",
  "image/svg",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
  "text/plain",
  "video/mp4",
  "audio/mp3",
];
