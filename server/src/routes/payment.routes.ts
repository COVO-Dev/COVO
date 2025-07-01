import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { authMiddleware } from '../middleware/auth'; // ensure this exists

const router = Router();

// Public webhook (no auth)
router.post('/webhook', paymentController.handleWebhook);

// Authenticated
router.use(authMiddleware);

router.post('/initiate', paymentController.initiatePayment);
router.post('/wallet/add-bank-account', paymentController.addBankAccount);
router.post('/wallet/withdraw', paymentController.withdrawFromWallet)
router.get('/wallet', paymentController.getWallet);
router.get('/wallet/withdrawals', paymentController.getWithdrawalHistory);
router.get('/transactions/:id', paymentController.getTransaction);
router.get('/transactions/brand', paymentController.getBrandTransactions);
router.get('/transactions/influencer', paymentController.getInfluencerTransactions);

export default router;
