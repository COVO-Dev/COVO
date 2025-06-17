import mongoose, { Schema, Document } from "mongoose";
import { ISubscription } from "../types";

const SubscriptionSchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },
    planName: { type: String, required: true },
    planPrice: { type: Number, required: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ["active", "inactive", "cancelled"], default: "active" },
    paymentStatus: { type: String, enum: ["paid", "pending", "failed"], default: "pending" },
    providerSubscriptionId: { type: String },
    provider: { type: String, default: "paystack" },
    cancelledAt: { type: Date },
    billingType: { type: String, enum: ["recurring", "one-time"], default: "recurring" },
},
    { timestamps: true },
);

const Subscription = mongoose.model<ISubscription>("Subscription", SubscriptionSchema);

export { Subscription };
