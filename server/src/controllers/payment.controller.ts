import { Request, Response } from 'express';
import { paymentService } from '../services/payment.service';
import { asyncHandler, sendJsonResponse } from '../middleware/helper';
import { exportService } from '../services/export.service';
import { UserRole } from '../types/enum';
import { send } from 'process';

export class PaymentController {
    initiatePayment = asyncHandler(async (req: Request, res: Response) => {
        const result = await paymentService.initiatePayment(req.body);
        sendJsonResponse(res, 200, 'Payment initiated successfully', result);
    });

    getTransaction = asyncHandler(async (req: Request, res: Response) => {
        const transaction = await paymentService.getTransaction(req.params.id);
        sendJsonResponse(res, 200, 'Transaction retrieved', transaction);
    });

    getBrandTransactions = asyncHandler(async (req: Request, res: Response) => {
        const { page = 1, limit = 10 } = req.query;
        const brandId = req.user.userId;
        const result = await paymentService.getBrandTransactions(
            brandId,
            Number(page),
            Number(limit)
        );
        sendJsonResponse(res, 200, 'Brand transactions retrieved', result,);
    });

    getInfluencerTransactions = asyncHandler(async (req: Request, res: Response) => {
        const { page = 1, limit = 10 } = req.query;
        const influencerId = req.user.userId;
        const result = await paymentService.getInfluencerTransactions(
            influencerId,
            Number(page),
            Number(limit)
        );
        sendJsonResponse(res, 200, 'Influencer transactions retrieved', result);
    });

    getWallet = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user.id;
        const role = req.user.role;

        if (role !== UserRole.Brand && role !== UserRole.Influencer) {
            return sendJsonResponse(res, 403, 'Only brands or influencers can access wallet data.');
        }

        const result = await paymentService.getWallet(
            userId,
            role
        );
        sendJsonResponse(res, 200, 'Wallet retrieved', result);
    });


    withdrawFromWallet = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user.id;
        const { amount } = req.body;
        const result = await paymentService.withdrawFromWallet(userId, amount);
        sendJsonResponse(res, 200, 'Withdrawal successful', result);
    });

    getWithdrawalHistory = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user.id;
        const result = await paymentService.getWithdrawalHistory(userId);
        sendJsonResponse(res, 200, 'Withdrawal history retrieved', result);
    });

    addBankAccount = asyncHandler(async (req: Request, res: Response) => {
        const influencerId = req.user.id;
        const result = await paymentService.addInfluencerBankAccount(influencerId, req.body);
        sendJsonResponse(res, 200, 'Bank account added', result);
    });

    handleWebhook = asyncHandler(async (req: Request, res: Response) => {
        const result = await paymentService.handlePaymentWebhook(req.body);
        sendJsonResponse(res, 200, 'Webhook handled', result);
    });

    exportBrandTransactions = asyncHandler(async (req: Request, res: Response) => {
        const brandId = req.user.id;
        const format = req.query.format || 'csv';

        const { transactions } = await paymentService.getBrandTransactions(brandId);

        if (format === 'csv') {
            const csv = await exportService.generateCSV(transactions);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=brand_transactions.csv');
            return res.send(csv);
        }

        if (format === 'pdf') {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=brand_transactions.pdf');
            return exportService.generatePDF(transactions, res);
        }

        sendJsonResponse(res, 400, 'Invalid format. Use csv or pdf.');
    });

    exportInfluencerTransactions = asyncHandler(async (req: Request, res: Response) => {
        const influencerId = req.user.id;
        const format = req.query.format || 'csv';

        const { transactions } = await paymentService.getInfluencerTransactions(influencerId);

        if (format === 'csv') {
            const csv = await exportService.generateCSV(transactions);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=influencer_transactions.csv');
            return res.send(csv);
        }

        if (format === 'pdf') {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=influencer_transactions.pdf');
            return exportService.generatePDF(transactions, res);
        }

        sendJsonResponse(res, 400, 'Invalid format. Use csv or pdf.');
    });

}

export const paymentController = new PaymentController();
