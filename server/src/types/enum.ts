// This file contains all the enums used in the application.
// It is used to define the different types of enums used in the application.
export enum UserRole {
    Influencer = 'Influencer',
    Brand = 'Brand',
    Admin = 'Admin',
}

export enum CampaignStatus {
    Pending = "pending",
    Active = "active",
    Completed = "completed"
}

export enum NotificationStatus {
    Unread = "unread",
    Read = "read"
}

export enum NotificationPreferenceType {
    Promotions = "promotions",
    Socials = "socials",
    Alerts = "alerts"
}

export enum NotificationCategory {
    Social = "social",
    EventAction = "eventAction",
    System = "system",
    Promotional = "promotional"
}


export enum UserType {
    Brand = "brand",
    Influencer = "influencer"
}


enum AllowedFileTypes {
    JPEG = "image/jpeg",
    PNG = "image/png",
    SVG = "image/svg",
    GIF = "image/gif",
    PDF = "application/pdf",
    MSWORD = "application/msword",
    DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    XLS = "application/vnd.ms-excel",
    XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ZIP = "application/zip",
    TXT = "text/plain",
    MP4 = "video/mp4",
    MP3 = "audio/mp3",
  }
  
  // Usage in allowedTypes array:
  const allowedTypes = [
    AllowedFileTypes.JPEG,
    AllowedFileTypes.PNG,
    AllowedFileTypes.SVG,
    AllowedFileTypes.GIF,
    AllowedFileTypes.PDF,
    AllowedFileTypes.MSWORD,
    AllowedFileTypes.DOCX,
    AllowedFileTypes.XLS,
    AllowedFileTypes.XLSX,
    AllowedFileTypes.ZIP,
    AllowedFileTypes.TXT,
    AllowedFileTypes.MP4,
    AllowedFileTypes.MP3,
  ];
  
