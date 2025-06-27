import subscriptionService from '../services/subscription.service';

export class SubscriptionUtils {
  // Check if user has specific feature access
  static async hasFeatureAccess(userId: string, feature: string): Promise<boolean> {
    try {
      const subscription = await subscriptionService.getUserActiveSubscription(userId);
      
      if (!subscription) return false;
      
      const plan = subscription.planId as any;
      return plan.features.includes(feature);
    } catch (error) {
      return false;
    }
  }

  // Get user's plan type
  static async getUserPlanType(userId: string): Promise<string | null> {
    try {
      const subscription = await subscriptionService.getUserActiveSubscription(userId);
      return subscription ? subscription.planName.toLowerCase() : null;
    } catch (error) {
      return null;
    }
  }

  // Check if user has premium or platinum access
  static async hasPremiumAccess(userId: string): Promise<boolean> {
    const planType = await this.getUserPlanType(userId);
    return planType === 'premium' || planType === 'platinum';
  }

  // Check if user has platinum access (all features)
  static async hasPlatinumAccess(userId: string): Promise<boolean> {
    const planType = await this.getUserPlanType(userId);
    return planType === 'platinum';
  }

  // Format subscription for frontend
  static formatSubscriptionForFrontend(subscription: any) {
    return {
      id: subscription._id,
      planName: subscription.planName,
      planPrice: subscription.planPrice,
      status: subscription.status,
      paymentStatus: subscription.paymentStatus,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      isActive: subscription.status === 'active' && new Date() < subscription.endDate,
      daysLeft: Math.ceil((subscription.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    };
  }
}

// Cron job function to check expired subscriptions
export const checkExpiredSubscriptions = async () => {
  try {
    const expiredCount = await subscriptionService.checkAndUpdateExpiredSubscriptions();
    console.log(`Updated ${expiredCount} expired subscriptions`);
  } catch (error) {
    console.error('Error checking expired subscriptions:', error);
  }
};