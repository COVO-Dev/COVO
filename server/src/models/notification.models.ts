import mongoose, { Schema, Document } from "mongoose";
import { INotification } from "../types";
import { NotificationCategory, NotificationStatus, UserRole } from "../types/enum";

const NotificationSchema: Schema = new Schema(
    {
      recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      role: { type: String, enum: Object.values(UserRole), required: true },
      subject: { type: String, required: true },
      body: { type: String, required: true },
      status: { type: String, enum: Object.values(NotificationStatus), required: true, default: NotificationStatus.Unread },
      type: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      category: { type: String, enum: Object.values(NotificationCategory), required: true },
      isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
  );
  
const Notification = mongoose.model<INotification>("Notification", NotificationSchema);
export { Notification };
