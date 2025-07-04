import mongoose, { Document } from 'mongoose';


export interface IWallet extends Document {
    userId: mongoose.Types.ObjectId;
    userType: 'influencer' | 'brand';
    balance: number;
    totalEarnings: number;
    totalWithdrawals: number;
}


const WalletSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    userType: { type: String, enum: ['influencer', 'brand'], required: true },
    balance: Number,
    totalEarnings: Number,
    totalWithdrawals: Number
}, { timestamps: true });

export const Wallet = mongoose.model('Wallet', WalletSchema);
