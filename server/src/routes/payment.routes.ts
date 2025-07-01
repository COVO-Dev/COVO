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
paymentRouter.get('/transactions/:id', paymentController.getTransaction);
paymentRouter.get('/transactions/brand', paymentController.getBrandTransactions);
paymentRouter.get('/transactions/influencer', paymentController.getInfluencerTransactions);

export { paymentRouter };
