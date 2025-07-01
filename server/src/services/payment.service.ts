import { Transaction } from '../models/transaction.model';
import { InfluencerBankAccount } from '../models/bankDetails.model';
import { Wallet } from '../models/wallet.model';
import { WalletTransaction } from '../models/walletTransaction.model';
import { paystackService } from './paystack.service';
import { UserRole } from '../types/enum';
import mongoose from 'mongoose';
import { Campaign } from '../models/campaign.models';
import { InitiatePaymentRequest } from '../types';
import { Influencer } from '../models/influencers.models';

export class PaymentService {
    private readonly PLATFORM_COMMISSION_RATE = 0.08;
    private readonly PLATFORM_RECIPIENT_CODE = process.env.PLATFORM_BANK_RECIPIENT_CODE!;

    // Initialize Payment
    async initiatePayment(request: InitiatePaymentRequest) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Calculate amounts
            const totalAmount = request.amount;
            const platformCommission = totalAmount * this.PLATFORM_COMMISSION_RATE;
            const influencerAmount = totalAmount - platformCommission;

            const influencer = await Influencer.findById(request.influencerId).select('paystackRecipientCode').session(session);
            if (!influencer) {
                throw new Error('Influencer not found');
            }

            const reference = paystackService.generateReference('CAMPAIGN');

            // Create transaction record
            const transaction = new Transaction({
                campaignId: request.campaignId,
                brandId: request.brandId,
                influencerId: request.influencerId,
                totalAmount,
                platformCommission,
                influencerAmount,
                paymentMethod: 'immediate_split',
                influencerPayoutPreference: influencer.payoutPreference || 'bank',
                paystackReference: reference,
            });

            await transaction.save({ session });

            // Initialize Paystack payment
            const paystackResponse = await paystackService.initialisePayment({
                email: request.brandEmail,
                amount: paystackService.toKobo(totalAmount),
                reference,
                callback_url: request.callbackUrl,
                metadata: {
                    campaignId: request.campaignId,
                    brandId: request.brandId,
                    influencerId: request.influencerId,
                    paymentMethod: 'immediate_split',
                }
            });

            await session.commitTransaction();
            return {
                success: true,
                transaction: transaction.toObject(),
                paymentUrl: paystackResponse.data.authorization_url,
                reference
            };

        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    // Handle Payment Webhook (called when payment is successful)
    async handlePaymentWebhook(payload: any) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { reference, status, id } = payload.data;

            // Find transaction
            const transaction = await Transaction.findOne({ paystackReference: reference }).session(session);
            if (!transaction) {
                throw new Error('Transaction not found');
            }

            if (status !== 'success') {
                transaction.paymentStatus = 'failed';
                await transaction.save({ session });
                await session.commitTransaction();
                return { success: false, message: 'Payment failed' };
            }

            // Update transaction
            transaction.paymentStatus = 'processing';
            transaction.paystackTransactionId = id;
            await transaction.save({ session });

            await this.transferPlatformCommission(transaction, session);
            if (transaction.influencerPayoutPreference === 'bank') {
                await this.transferToInfluencerBank(transaction, session);
            } else {
                await this.creditWallet(transaction, session);
            }

            transaction.paymentStatus = 'completed';
            await transaction.save({ session })
            await Campaign.findOneAndUpdate(
                transaction.campaignId,
                {
                    $inc: {
                        totalAmountPaid: transaction.totalAmount,
                        totalCommisionPaid: transaction.platformCommission,
                    }
                },
                { session }
            )
            await session.commitTransaction();
            return { success: true, transaction: transaction.toObject() };

        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    private async transferPlatformCommission(tx: any, session: mongoose.ClientSession) {
        try {
            const transferResponse = await paystackService.initiateTransfer({
                source: 'balance',
                amount: paystackService.toKobo(tx.platformCommission),
                recipient: this.PLATFORM_RECIPIENT_CODE,
                reason: `Platform commission for campaign ${tx.campaignId}`,
                reference: `COMM_${tx._id}_${Date.now()}`
            });
            tx.commissionTransferId = transferResponse.data.transfer_code;
            tx.commissionTransferStatus = 'completed';
            await tx.save({ session })

        } catch (error) {
            tx.commissionTransferStatus = 'failed';
            await tx.save({ session });
            throw new Error('Commission transfer failed')
        }
    }

    private async transferToInfluencerBank(tx: any, session: mongoose.ClientSession) {
        const bank = await InfluencerBankAccount.findOne({
            influencerId: tx.influencerId,
            isActive: true,
            isVerified: true
        }).session(session);

        if (!bank) {
            await this.creditWallet(tx, session);
            return;
        }

        try {
            const response = await paystackService.initiateTransfer({
                source: 'balance',
                amount: paystackService.toKobo(tx.influencerAmount),
                recipient: bank.paystackRecipientCode,
                reason: `Payment for campaign ${tx.campaignId}`,
                reference: `INF_${tx._id}_${Date.now()}`
            });

            tx.influencerTransferId = response.data.transfer_code;
            tx.influencerPayoutStatus = 'completed';
            await tx.save({ session });

        } catch (error) {
            console.error('Influencer bank transfer failed:', error);
            tx.influencerPayoutStatus = 'failed';
            await tx.save({ session });

            console.log('Falling back to wallet credit due to bank transfer failure');
            await this.creditWallet(tx, session);
        }
    }

    private async creditWallet(tx: any, session: mongoose.ClientSession) {
        try {
            let wallet = await Wallet.findOne({
                userId: tx.influencerId,
                userType: 'influencer'
            }).session(session);

            if (!wallet) {
                wallet = new Wallet({
                    userId: tx.influencerId,
                    userType: 'influencer',
                    balance: 0,
                    totalEarnings: 0,
                    totalWithdrawals: 0
                });
                await wallet.save({ session });
            }

            const balanceBefore = wallet.balance;
            wallet.balance += tx.influencerAmount;
            wallet.totalEarnings += tx.influencerAmount;
            await wallet.save({ session });

            const wallettx = new WalletTransaction({
                walletId: wallet._id,
                userId: tx.influencerId,
                type: 'credit',
                amount: tx.influencerAmount,
                sourceType: 'campaign_payment',
                sourceId: tx.campaignId,
                status: 'completed',
                description: `Payment received for campaign ${tx.campaignId}`,
                balanceBefore,
                balanceAfter: wallet.balance
            });
            await wallettx.save({ session });
            tx.influencerPayoutStatus = 'completed';
            await tx.save({ session });

        } catch (error) {
            console.error('Wallet credit failed:', error);
            tx.influencerPayoutStatus = 'failed';
            await tx.save({ session });
            throw error;
        }
    }

    // Add/Update Influencer Bank Account
    async addInfluencerBankAccount(influencerId: string, bankDetails: {
        accountNumber: string;
        bankCode: string;
        bankName: string;
    }) {
        const session = await mongoose.startSession();
        session.startTransaction()
        try {
            const accountResolution = await paystackService.resolveAccountNumber(
                bankDetails.accountNumber,
                bankDetails.bankCode
            );

            if (!accountResolution.status) {
                throw new Error('Invalid bank account details');
            }

            const accountName = accountResolution.data.account_name;

            // Create Paystack transfer recipient
            const recipient = await paystackService.createTransferRecipient({
                type: 'nuban',
                name: accountName,
                account_number: bankDetails.accountNumber,
                bank_code: bankDetails.bankCode,
                currency: 'NGN'
            });

            // Deactivate existing bank accounts
            await InfluencerBankAccount.updateMany(
                { influencerId: new mongoose.Types.ObjectId(influencerId) },
                { isActive: false }
            ).session(session);

            // Create new bank account record
            const bankAccount = new InfluencerBankAccount({
                influencerId: new mongoose.Types.ObjectId(influencerId),
                accountNumber: bankDetails.accountNumber,
                bankCode: bankDetails.bankCode,
                accountName,
                bankName: bankDetails.bankName,
                paystackRecipientCode: recipient.data.recipient_code,
                isActive: true,
                isVerified: true
            });

            await bankAccount.save({ session });
            await session.commitTransaction();

            return {
                success: true,
                bankAccount: bankAccount.toObject(),
                message: 'Bank account added successfully'
            };

        } catch (error: any) {
            await session.abortTransaction();
            throw new Error(`Failed to add bank account: ${error.message}`);
        } finally {
            session.endSession();
        }
    }

    // Get Transaction Details
    async getTransaction(transactionId: string) {
        return await Transaction.findById(transactionId)
            .populate('campaignId')
            .populate('brandId')
            .populate('influencerId');
    }

    // Get Transactions for Brand
    async getBrandTransactions(brandId: string, page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;

        const transactions = await Transaction.find({ brandId })
            .populate('campaignId')
            .populate('influencerId')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Transaction.countDocuments({ brandId });

        return {
            transactions,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total
            }
        };
    }

    // Get Transactions for Influencer
    async getInfluencerTransactions(influencerId: string, page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;

        const transactions = await Transaction.find({ influencerId })
            .populate('campaignId')
            .populate('brandId')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Transaction.countDocuments({ influencerId });

        return {
            transactions,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total
            }
        };
    }

    async withdrawFromWallet(userId: string, amount: number) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const wallet = await Wallet.findOne({
                userId: new mongoose.Types.ObjectId(userId),
                userType: 'influencer'
            }).session(session);

            if (!wallet) {
                throw new Error('Wallet not found');
            }
            if (wallet.balance < amount) throw new Error('Insufficient wallet balance');

            const bankDetails = await InfluencerBankAccount.findOne({
                influencerId: userId,
                isActive: true,
                isVerified: true
            }).session(session);

            if (!bankDetails) {
                throw new Error('No verified bank account found for this influencer');
            }

            const transferResponse = await paystackService.initiateTransfer({
                source: 'balance',
                amount: paystackService.toKobo(amount),
                recipient: bankDetails.paystackRecipientCode,
                reason: `Withdrawal from wallet by influencer ${userId}`,
                reference: `WITHDRAW_${userId}_${Date.now()}`
            });

            const balanceBefore = wallet.balance;
            wallet.balance -= amount;
            wallet.totalWithdrawals += amount;
            await wallet.save({ session });

            const transaction = new WalletTransaction({
                walletId: wallet._id,
                userId,
                type: 'debit',
                amount,
                sourceType: 'wallet_withdrawal',
                sourceId: null,
                status: 'completed',
                description: `Withdrawal to bank`,
                balanceBefore,
                balanceAfter: wallet.balance
            });

            await transaction.save({ session });

            await session.commitTransaction();

            return {
                success: true,
                message: 'Withdrawal successful',
                transferReference: transferResponse.data.reference
            };
        } catch (error) {
            await session.abortTransaction()
            throw error;
        } finally {
            session.endSession();
        }
    }

    async getWallet(userId: string, userType: UserRole.Brand | UserRole.Influencer) {
        const wallet = await Wallet.findOne({ userId, userType });

        if (!wallet) {
            return {
                success: true,
                wallet: {
                    balance: 0,
                    totalEarnings: 0,
                    totalWithdrawals: 0
                },
                transactions: []
            };
        }

        const transactions = await WalletTransaction.find({ userId }).sort({ createdAt: -1 }).limit(20); // optional

        return {
            success: true,
            wallet: wallet.toObject(),
            transactions
        };
    }

    getWithdrawalHistory(userId: string) {
        return WalletTransaction.find({
            userId,
            type: 'debit',
            sourceType: 'wallet_withdrawal'
        }).sort({ createdAt: -1 });
    }
}

export const paymentService = new PaymentService();
