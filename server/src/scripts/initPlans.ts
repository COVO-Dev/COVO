import mongoose from 'mongoose';
import subscriptionService from '../services/subscription.service';
import { config } from '../config/configuration';

const initializePlans = async () => {
  try {
    console.log('🚀 Starting plan initialization...');

    // Connect to MongoDB
    await mongoose.connect(config.MAIN_DB_URI);
    console.log('✅ Connected to MongoDB');

    // Initialize plans
    await subscriptionService.initializePlans();

    // Display created plans
    const plans = await subscriptionService.getPlans();
    console.log('\n📋 Available Plans:');
    console.table(plans.map(plan => ({
      Name: plan.name,
      Price: `₦${(plan.price / 100).toFixed(2)}`,
      Code: plan.planCode,
      Interval: plan.interval,
    })));

  } catch (error) {
    console.error('❌ Initialization failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run initialization
initializePlans();