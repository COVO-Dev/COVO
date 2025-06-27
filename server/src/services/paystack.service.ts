import axios from 'axios';
import { PaystackPlan, PaystackSubscription } from '../types';
import { config } from '../config/configuration';

class PaystackService {
    private baseURL = 'https://api.paystack.co';
    private secretKey: string;

    constructor() {
        this.secretKey = config.PAYSTACK_SECRET_KEY!;
    }

    private getHeaders() {
        return {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
        };
    }

    // Create a plan on Paystack
    async createPlan(planData: PaystackPlan) {
        try {
            const response = await axios.post(
                `${this.baseURL}/plan`,
                {
                    name: planData.name,
                    amount: planData.amount * 100,
                    interval: planData.interval,
                },
                { headers: this.getHeaders() }
            );
            return response.data;
        } catch (error: any) {
            throw new Error(`Paystack plan creation failed: ${error.response?.data?.message || error.message}`);
        }
    }

    // Create customer
    async createCustomer(email: string, firstName: string, lastName: string) {
        try {
            const response = await axios.post(
                `${this.baseURL}/customer`,
                {
                    email,
                    first_name: firstName,
                    last_name: lastName,
                },
                { headers: this.getHeaders() }
            );
            return response.data;
        } catch (error: any) {
            throw new Error(`Customer creation failed: ${error.response?.data?.message || error.message}`);
        }
    }

    // Initialize transaction for subscription
    async initializeTransaction(email: string, amount: number, planCode: string, callbackUrl?: string) {
        try {
            const response = await axios.post(
                `${this.baseURL}/transaction/initialize`,
                {
                    email,
                    amount: amount * 100, // Convert to kobo
                    plan: planCode,
                    callback_url: callbackUrl,
                },
                { headers: this.getHeaders() }
            );
            return response.data;
        } catch (error: any) {
            throw new Error(`Transaction initialization failed: ${error.response?.data?.message || error.message}`);
        }
    }

    // Create subscription
    async createSubscription(subscriptionData: PaystackSubscription) {
        try {
            const response = await axios.post(
                `${this.baseURL}/subscription`,
                subscriptionData,
                { headers: this.getHeaders() }
            );
            return response.data;
        } catch (error: any) {
            throw new Error(`Subscription creation failed: ${error.response?.data?.message || error.message}`);
        }
    }

    // Cancel subscription
    async cancelSubscription(subscriptionCode: string, token: string) {
        try {
            const response = await axios.post(
                `${this.baseURL}/subscription/disable`,
                {
                    code: subscriptionCode,
                    token: token,
                },
                { headers: this.getHeaders() }
            );
            return response.data;
        } catch (error: any) {
            throw new Error(`Subscription cancellation failed: ${error.response?.data?.message || error.message}`);
        }
    }

    // Verify transaction
    async verifyTransaction(reference: string) {
        try {
            const response = await axios.get(
                `${this.baseURL}/transaction/verify/${reference}`,
                { headers: this.getHeaders() }
            );
            return response.data;
        } catch (error: any) {
            throw new Error(`Transaction verification failed: ${error.response?.data?.message || error.message}`);
        }
    }

    // Get subscription details
    async getSubscription(subscriptionCode: string) {
        try {
            const response = await axios.get(
                `${this.baseURL}/subscription/${subscriptionCode}`,
                { headers: this.getHeaders() }
            );
            return response.data;
        } catch (error: any) {
            throw new Error(`Failed to get subscription: ${error.response?.data?.message || error.message}`);
        }
    }
}

export default new PaystackService();