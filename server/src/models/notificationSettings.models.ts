import mongoose, { Schema, Document } from "mongoose";
import { INotificationSettings } from "../types";
import { UserRole, NotificationPreferenceType } from "../types/enum";

const NotificationSettingsSchema: Schema = new Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isEnabled: { type: Boolean, default: true },
    preferences: {
      type: Map,
      of: Boolean,
      default: Object.values(NotificationPreferenceType).reduce(
        (acc, type) => ({ ...acc, [type]: true }),
        {}
      ),
    },
    doNotDisturb: {
      start: { type: String, default: null },
      end: { type: String, default: null },
    },
  },
  { timestamps: true }
);

const NotificationSettings = mongoose.model<INotificationSettings>(
  "NotificationSettings",
  NotificationSettingsSchema
);

export default NotificationSettings;
