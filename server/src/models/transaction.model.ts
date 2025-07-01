import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
    campaignId: mongoose.Types.ObjectId;
    brandId: mongoose.Types.ObjectId;
    influencerId: mongoose.Types.ObjectId;
    totalAmount: number;
    platformCommission: number;
    influencerAmount: number;
    paymentMethod: 'immediate_split';
    influencerPayoutPreference: 'direct_bank' | 'platform_wallet';
    paystackReference: string;
    paystackTransactionId?: string;
    commissionTransferStatus?: 'completed' | 'failed';
    influencerPayoutStatus?: 'completed' | 'failed';
    influencerTransferId?: string;
    paymentStatus?: 'pending' | 'processing' | 'completed' | 'failed';
}

const TransactionSchema = new Schema<ITransaction>(
    {
        campaignId: { type: Schema.Types.ObjectId, required: true, ref: 'Campaign' },
        brandId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
        influencerId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
        totalAmount: { type: Number, required: true },
        platformCommission: { type: Number, required: true },
        influencerAmount: { type: Number, required: true },
        paymentMethod: { type: String, enum: ['immediate_split'], required: true },
        influencerPayoutPreference: {
            type: String,
            enum: ['direct_bank', 'platform_wallet'],
            default: 'direct_bank'
        },
        paystackReference: { type: String, required: true },
        paystackTransactionId: String,
        commissionTransferStatus: { type: String, enum: ['completed', 'failed'], default: 'completed' },
        influencerPayoutStatus: { type: String, enum: ['completed', 'failed'], default: 'completed' },
        influencerTransferId: String,
        paymentStatus: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed'],
            default: 'pending'
        }
    },
    { timestamps: true }
);

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);
