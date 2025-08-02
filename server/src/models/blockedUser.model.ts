import mongoose, { Schema, Document } from "mongoose";

export interface IBlockedUser extends Document {
    blocker: mongoose.Types.ObjectId;
    blocked: mongoose.Types.ObjectId;
    reason?: string;
}

const BlockedUserSchema: Schema = new Schema(
    {
        blocker: { type: Schema.Types.ObjectId, ref: "User", required: true },
        blocked: { type: Schema.Types.ObjectId, ref: "User", required: true },
        reason: { type: String },
    },
    { timestamps: true }
);

BlockedUserSchema.index({ blocker: 1, blocked: 1 }, { unique: true });

const BlockedUser = mongoose.model<IBlockedUser>("BlockedUser", BlockedUserSchema);
export { BlockedUser };
