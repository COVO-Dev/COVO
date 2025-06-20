import { Plan } from '../models/plan.model';
import { Subscription } from '../models/subscription.model';
import { IPlan, ISubscription } from '../types';
import paystackService from './paystack.service';
import { config } from '../config/configuration';

class SubscriptionService {
  // Initialize subscription plans in database and Paystack
  async initializePlans() {
    const plans = [
      {
        name: 'Free',
        price: 0,
        interval: 'monthly' as const,
        features: ['Basic features', 'Limited usage', 'Email support'],
      },
      {
        name: 'Premium',
        price: 20000,
        interval: 'monthly' as const,
        features: ['Enhanced features', 'Increased limits', 'Priority support', 'Advanced analytics'],
      },
      {
        name: 'Platinum',
        price: 50000,
        interval: 'monthly' as const,
        features: ['All features', 'Unlimited usage', '24/7 support', 'Custom integrations', 'White-label options'],
      },
    ];

    for (const planData of plans) {
      // Check if plan exists in database
      let plan = await Plan.findOne({ name: planData.name, isActive: true });

      if (!plan) {
        // Create in database
        plan = new Plan(planData);
        // Create in Paystack (skip free plan)
        if (planData.price > 0) {
          try {
            const paystackPlan = await paystackService.createPlan({
              name: planData.name,
              amount: planData.price,
              interval: planData.interval,
            });
            console.log(`✅ Created plan in Paystack: ${paystackPlan.data.name} (code: ${paystackPlan.data.plan_code})`);

            plan.planCode = paystackPlan.data.plan_code;
            console.log(`✅ Created plan in Paystack: ${planData.name}`);
          } catch (error: any) {
            if (error.message.includes('already exists') || error.message.includes('duplicate')) {
              console.log(`⚠️ Plan ${planData.name} already exists in Paystack`);
            } else {
              console.error(`❌ Failed to create ${planData.name} plan in Paystack:`, error.message);
            }
          }
        }
        await plan.save();
        console.log(`✅ Plan ${planData.name} initialized in database and Paystack`);
      } else {
        console.log(`ℹ️ Plan ${planData.name} already exists in database`);
      }
    }
    console.log('🎉 Plan initialization completed');
  }

  // Get all plans
  async getPlans() {
    return await Plan.find({ isActive: true }).sort({ price: 1 });
  }

  // Get plan by ID
  async getPlanById(planId: string) {
    return await Plan.findById(planId);
  }

  // Get plan by code
  async getPlanByCode(planCode: string) {
    return await Plan.findOne({ planCode, isActive: true });
  }

  // Create subscription
  async createSubscription(userId: string, planId: string, email: string) {
    const plan = await Plan.findById(planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    // Check if user already has an active subscription
    const existingSubscription = await this.getUserActiveSubscription(userId);
    if (existingSubscription && existingSubscription.status === 'active') {
      throw new Error('User already has an active subscription');
    }

    // For free plan, create subscription directly
    if (plan.price === 0) {
      const subscription = new Subscription({
        userId,
        planId,
        planName: plan.name,
        planPrice: plan.price,
        endDate: this.calculateEndDate(plan.interval),
        status: 'active',
        paymentStatus: 'paid',
        provider: 'paystack',
      });

      await subscription.save();
      return { subscription, requiresPayment: false };
    }

    const paymentData = await paystackService.initializeTransaction(
      email,
      plan.price,
      plan.planCode,
      `${config.FRONTEND_URL}/subscription/callback`
    );

    const subscription = new Subscription({
      userId,
      planId,
      planName: plan.name,
      planPrice: plan.price,
      endDate: this.calculateEndDate(plan.interval),
      status: 'inactive',
      paymentStatus: 'pending',
      provider: 'paystack',
      providerSubscriptionId: paymentData.data.reference,
    });

    await subscription.save();

    return {
      subscription,
      requiresPayment: true,
      paymentData: paymentData.data,
    };
  }

  // Activate subscription after payment
  async activateSubscription(reference: string) {
    const verification = await paystackService.verifyTransaction(reference);

    if (verification.status && verification.data.status === 'success') {
      // Find subscription by reference
      const subscription = await Subscription.findOne({
        providerSubscriptionId: reference,
        paymentStatus: 'pending',
      });

      if (subscription) {
        subscription.status = 'active';
        subscription.paymentStatus = 'paid';
        subscription.startDate = new Date();
        await subscription.save();

        return subscription;
      } else {
        throw new Error('Subscription not found for this payment');
      }
    }

    throw new Error('Payment verification failed');
  }

  async cancelSubscription(subscriptionId: string, userId: string) {
    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      userId,
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (subscription.status === 'cancelled') {
      throw new Error('Subscription is already cancelled');
    }

    console.log(`Cancelling subscription ${subscriptionId} for user ${userId}`);

    if (subscription.providerSubscriptionId && subscription.planPrice > 0) {
      try {
        await paystackService.cancelSubscription(subscription.providerSubscriptionId, userId);
      } catch (error) {
        console.error('Failed to cancel subscription in Paystack:', error);
      }
    }
    console.log(`Subscription ${subscriptionId} cancelled in Paystack (if applicable)`);
    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
    await subscription.save();

    return subscription;
  }

  async getUserActiveSubscription(userId: string) {
    return await Subscription.findOne({
      userId,
      status: 'active',
      endDate: { $gt: new Date() },
    }).populate('planId');
  }

  async getUserSubscriptionHistory(userId: string) {
    return await Subscription.find({ userId })
      .populate('planId')
      .sort({ createdAt: -1 });
  }

  async changeSubscription(userId: string, newPlanId: string, email: string) {
    console.log('Changing subscription for user:', userId, 'to new plan:', newPlanId, 'with email:', email);
    const currentSubscription = await this.getUserActiveSubscription(userId);
    console.log('Current subscription:', currentSubscription);

    if (currentSubscription && currentSubscription.planId.toString() === newPlanId) {
      throw new Error('You are already subscribed to this plan');
    }

    console.log("canceling current subscription:", currentSubscription?._id.toString(), "for user:", userId);
    if (currentSubscription) {
      await this.cancelSubscription(currentSubscription._id.toString(), userId);
    }

    console.log("Creating new subscription for user:", userId, "with plan:", newPlanId);

    const newSub = await this.createSubscription(userId, newPlanId, email);

    // await this.activateSubscription(newSub.subscription.providerSubscriptionId);
    return newSub;
  }

  private calculateEndDate(interval: string): Date {
    const now = new Date();
    const endDate = new Date(now);

    if (interval === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (interval === 'weekly') {
      endDate.setDate(endDate.getDate() + 7);
    } else if (interval === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }
    return endDate;
  }

  async checkAndUpdateExpiredSubscriptions() {
    const expiredSubscriptions = await Subscription.find({
      status: 'active',
      endDate: { $lt: new Date() },
    });

    for (const subscription of expiredSubscriptions) {
      subscription.status = 'inactive';
      await subscription.save();
    }

    return expiredSubscriptions.length;
  }

  async getSubscriptionStats() {
    const totalSubscriptions = await Subscription.countDocuments();
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
    const cancelledSubscriptions = await Subscription.countDocuments({ status: 'cancelled' });
    const pendingSubscriptions = await Subscription.countDocuments({ paymentStatus: 'pending' });

    const paidSubscriptions = await Subscription.find({ paymentStatus: 'paid' });
    const totalRevenue = paidSubscriptions.reduce((sum, sub) => sum + sub.planPrice, 0);

    return {
      totalSubscriptions,
      activeSubscriptions,
      cancelledSubscriptions,
      pendingSubscriptions,
      totalRevenue: totalRevenue / 100,
    };
  }

  async renewSubscription(subscriptionId: string, userId: string) {
    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      userId,
    }).populate('planId');

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const plan = subscription.planId as any;

    // Extend the end date
    const newEndDate = this.calculateEndDate(plan.interval);
    subscription.endDate = newEndDate;
    subscription.status = 'active';

    await subscription.save();

    return subscription;
  }
}

export default new SubscriptionService();