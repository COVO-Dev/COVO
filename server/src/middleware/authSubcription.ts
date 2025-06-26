import { Response, NextFunction } from 'express';
import subscriptionService from '../services/subscription.service';
import { AuthenticatedRequest } from '../types';
import { asyncHandler } from './helper';

interface SubscriptionCheckOptions {
  allowedPlans?: string[];
  requiredFeatures?: string[];
}

export function checkSubscription(options: SubscriptionCheckOptions = {}) {
  const { allowedPlans = [], requiredFeatures = [] } = options;

  return asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    console.log('Checking subscription for user:', req.user.userId);

    const subscription = await subscriptionService.getUserActiveSubscription(req.user.userId);
    console.log('User subscription:', subscription);

    if (!subscription) {
      return res.status(403).json({
        error: 'Active subscription required',
        code: 'NO_SUBSCRIPTION',
      });
    }

    const plan = subscription.planId as any;
    const planName = plan.name?.toLowerCase();

    const isAllowedPlan = allowedPlans.length === 0 || allowedPlans.includes(planName);
    const hasRequiredFeatures =
      requiredFeatures.length === 0 || requiredFeatures.every(feature => plan.features?.includes(feature));

    if (!isAllowedPlan || !hasRequiredFeatures) {
      return res.status(403).json({
        error: 'Subscription plan does not include required access',
        code: 'INSUFFICIENT_PLAN',
        allowedPlans,
        requiredFeatures,
      });
    }

    req.subscription = subscription;
    next();
  });
}
