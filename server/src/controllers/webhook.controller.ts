import { Request, Response } from 'express';
import crypto from 'crypto';
import { Subscription } from '../models/subscription.model';
import { asyncHandler } from '../middleware/helper';
import { config } from '../config/configuration';

class WebhookController {
  public handlePaystackWebhook = asyncHandler ( async (req: Request, res: Response) => {
    try {
      const secret = config.PAYSTACK_WEBHOOK_SECRET!;
      const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
      
      if (hash !== req.headers['x-paystack-signature']) {
        return res.status(400).json({ error: 'Invalid signature' });
      }

      const { event, data } = req.body;
      console.log(`Received webhook event: ${event}`, data);

      switch (event) {
        case 'subscription.create':
          await this.handleSubscriptionCreated(data);
          break;
        case 'subscription.disable':
          await this.handleSubscriptionDisabled(data);
          break;
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(data);
          break;
        case 'charge.success':
          await this.handleChargeSuccess(data);
          break;
        default:
          console.log(`Unhandled webhook event: ${event}`);
      }

      res.status(200).json({ message: 'Webhook processed successfully' });
    } catch (error: any) {
      console.error('Webhook processing error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  })

  private async handleSubscriptionCreated(data: any) {
    await Subscription.findOneAndUpdate(
      { userId: data.customer.customer_code },
      { 
        providerSubscriptionId: data.subscription_code,
        status: 'active',
        paymentStatus: 'paid' 
      }
    );
  }

  private async handleSubscriptionDisabled(data: any) {
    await Subscription.findOneAndUpdate(
      { providerSubscriptionId: data.subscription_code },
      { 
        status: 'cancelled',
        cancelledAt: new Date() 
      }
    );
  }

  private async handlePaymentFailed(data: any) {
    await Subscription.findOneAndUpdate(
      { providerSubscriptionId: data.subscription.subscription_code },
      { paymentStatus: 'failed' }
    );
  }

  private async handleChargeSuccess(data: any) {
    if (data.plan) {
      await Subscription.findOneAndUpdate(
        { providerSubscriptionId: data.plan.plan_code },
        { 
          paymentStatus: 'paid',
          status: 'active' 
        }
      );
    }
  }
}

export default new WebhookController();