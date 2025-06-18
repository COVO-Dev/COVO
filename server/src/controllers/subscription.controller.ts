import { Response } from 'express';
import subscriptionService from '../services/subscription.service';
import { AuthenticatedRequest } from '../types';
import { asyncHandler } from '../middleware/helper';
import { User } from '../models/users.models';

class SubscriptionController {
  /*
    * @swagger
    * tags:
    *   name: Get Plans
    *   description: Subscription management endpoints
    */
  public getPlans = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const plans = await subscriptionService.getPlans();
      res.json({ success: true, data: plans });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  })

  /**
   * @swagger 
   * tags:
   * name: Create Subscription
   * description: Subscription management endpoints
   */

  public createSubscription = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { planId } = req.body;
      const userId = req.user!.userId;
      const email = req.user!.email;

      // Check if user already has an active subscription
      const existingSubscription = await subscriptionService.getUserActiveSubscription(userId);
      if (existingSubscription) {
        return res.status(400).json({
          success: false,
          error: 'User already has an active subscription'
        });
      }

      const result = await subscriptionService.createSubscription(userId, planId, email);

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  })

  // Verify payment and activate subscription
  public verifyPayment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { reference } = req.body;

      const subscription = await subscriptionService.activateSubscription(reference);

      res.json({
        success: true,
        message: 'Subscription activated successfully',
        data: subscription
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // Get user's current subscription
  public getCurrentSubscription = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const subscription = await subscriptionService.getUserActiveSubscription(userId);
      if (!subscription) {
        return res.status(404).json({
          success: false,
          error: 'No active subscription found for this user'
        });
      }
      res.json({
        success: true,
        data: subscription
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get subscription history
  public getSubscriptionHistory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const history = await subscriptionService.getUserSubscriptionHistory(userId);

      res.json({
        success: true,
        data: history
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Cancel subscription
  public cancelSubscription = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { subscriptionId } = req.params;
      const userId = req.user!.userId;

      const subscription = await subscriptionService.cancelSubscription(subscriptionId, userId);

      res.json({
        success: true,
        message: 'Subscription cancelled successfully',
        data: subscription
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  })

  public changeSubscription = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { newPlanId } = req.body;
      const userId = req.user!.userId;

      console.log('Changing subscription for user:', userId, 'to new plan:', newPlanId);

      const user = await User.findById(userId).select('email');
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      const email = user.email;
      console.log('User email:', email);

      const result = await subscriptionService.changeSubscription(userId, newPlanId, email);
      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  })
}

export default new SubscriptionController();