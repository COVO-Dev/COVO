import { Router } from 'express';
import subscriptionController from '../controllers/subscription.controller';
import webhookController from '../controllers/webhook.controller';
import { authMiddleware } from '../middleware/auth';
import { checkSubscription } from '../middleware/authSubcription';

const subscriptionRoute = Router();

// Webhook (should be before auth middleware)
subscriptionRoute.post('/webhook/paystack', webhookController.handlePaystackWebhook);

// Public routes
subscriptionRoute.get('/plans', subscriptionController.getPlans);

// protected routes
subscriptionRoute.use(authMiddleware);
subscriptionRoute.post('/subscribe', subscriptionController.createSubscription);
subscriptionRoute.post('/verify-payment', subscriptionController.verifyPayment);
subscriptionRoute.get('/history', subscriptionController.getSubscriptionHistory);


// // Subscription management routes
subscriptionRoute.use(checkSubscription({ allowedPlans: ['free', 'premium', 'platinum'] }));
subscriptionRoute.get('/current', subscriptionController.getCurrentSubscription);
subscriptionRoute.post('/change-plan', subscriptionController.changeSubscription);

subscriptionRoute.delete('/:subscriptionId/cancel', subscriptionController.cancelSubscription);

export { subscriptionRoute };