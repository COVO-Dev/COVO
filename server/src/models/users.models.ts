import mongoose, { Schema, Document } from "mongoose";
import { IUser, PlatformAuth } from "../types";
import { UserRole } from "../types/enum";

const UserSchema: Schema = new Schema(
  {
    firstName: { type: String, required: true, regex: /[a-zA-Z]/ },
    lastName: { type: String, required: true, regex: /[a-zA-Z]/ },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /\S+@\S+\.\S+/,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      // match: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    },
    phoneNumber: {
      type: String,
      match: /^\+?[1-9]\d{1,14}$/,
    },
    role: {
      type: String,
      enum: [UserRole.Admin, UserRole.Influencer, UserRole.Brand],
      required: true,
    },
    gender: { type: String },
    currency: { type: String },
    consentAndAgreements: {
      termsAccepted: { type: Boolean, required: true, default: false },
      marketingOptIn: { type: Boolean, default: false, required: true },
      dataComplianceConsent: { type: Boolean, required: true, default: false },
    },
    privacyPolicy: {
      type: Boolean,
      required: true,
      default: false,
    },
    language: { type: String },
    isActive: { type: Boolean, required: true, default: true },
    isDeleted: { type: Boolean, required: true, default: false },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  {
    timestamps: true,
    discriminatorKey: "role",
  }
);

const User = mongoose.model<IUser>("User", UserSchema);

export { User };
