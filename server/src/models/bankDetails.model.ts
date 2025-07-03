import mongoose, { Schema, Document } from 'mongoose';

export interface IInfluencerBankAccount extends Document {
    influencerId: mongoose.Types.ObjectId;
    accountName: string;
    accountNumber: string;
    bankCode: string;
    bankName: string;
    paystackRecipientCode: string;
    isActive: boolean;
    isVerified: boolean;
}

const InfluencerBankAccountSchema = new Schema<IInfluencerBankAccount>(
    {
        influencerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        accountName: { type: String, required: true },
        accountNumber: { type: String, required: true },
        bankCode: { type: String, required: true },
        bankName: { type: String, required: true },
        paystackRecipientCode: { type: String, required: true },
        isActive: { type: Boolean, default: true },
        isVerified: { type: Boolean, default: true }
    },
    { timestamps: true }
);

export const InfluencerBankAccount = mongoose.model<IInfluencerBankAccount>('InfluencerBankAccount', InfluencerBankAccountSchema);
