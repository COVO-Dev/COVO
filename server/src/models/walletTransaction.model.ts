import mongoose, { Schema, Document } from 'mongoose';

export interface IWalletTransaction extends Document {
    walletId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    type: 'credit' | 'debit';
    amount: number;
    sourceType: 'campaign_payment' | 'wallet_withdrawal';
    sourceId?: mongoose.Types.ObjectId | null;
    status: 'completed' | 'failed';
    description: string;
    balanceBefore: number;
    balanceAfter: number;
}

const WalletTransactionSchema = new Schema<IWalletTransaction>(
    {
        walletId: { type: Schema.Types.ObjectId, ref: 'Wallet', required: true },
        userId: { type: Schema.Types.ObjectId, required: true },
        type: { type: String, enum: ['credit', 'debit'], required: true },
        amount: { type: Number, required: true },
        sourceType: { type: String, enum: ['campaign_payment', 'wallet_withdrawal'], required: true },
        sourceId: { type: Schema.Types.ObjectId, default: null },
        status: { type: String, enum: ['completed', 'failed'], default: 'completed' },
        description: String,
        balanceBefore: Number,
        balanceAfter: Number
    },
    { timestamps: true }
);

WalletTransactionSchema.index({ walletId: 1, createdAt: -1 });
WalletTransactionSchema.index({ userId: 1, createdAt: -1 });

export const WalletTransaction = mongoose.model<IWalletTransaction>('WalletTransaction', WalletTransactionSchema);

