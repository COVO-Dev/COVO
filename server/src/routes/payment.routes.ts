import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { authMiddleware } from '../middleware/auth'; // ensure this exists

const paymentRouter = Router();

// Public webhook (no auth)
paymentRouter.post('/webhook', paymentController.handleWebhook);

// Authenticated
paymentRouter.use(authMiddleware);

paymentRouter.post('/initiate', paymentController.initiatePayment);
paymentRouter.post('/wallet/add-bank-account', paymentController.addBankAccount);
paymentRouter.post('/wallet/withdraw', paymentController.withdrawFromWallet)
paymentRouter.get('/wallet', paymentController.getWallet);
paymentRouter.get('/wallet/withdrawals', paymentController.getWithdrawalHistory);
paymentRouter.get('/transactions/brand', paymentController.getBrandTransactions);
paymentRouter.get('/transactions/influencer', paymentController.getInfluencerTransactions);
paymentRouter.get('/transactions/:id', paymentController.getTransaction);

// Export the payment router
// Query format: e.g /export/transactions/brand?format=pdf
paymentRouter.get('/export/transactions/brand', paymentController.exportBrandTransactions);
paymentRouter.get('/export/transactions/influencer', paymentController.exportInfluencerTransactions);

export { paymentRouter };
