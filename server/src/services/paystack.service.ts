import axios from 'axios';
import { PaystackPlan, PaystackSubscription } from '../types';
import crypto from 'crypto';
import { config } from '../config/configuration';


export interface PaystackConfig {
    secretKey: string;
    publicKey: string;
    baseUrl: string;
}

export interface InitializePaymentData {
    email: string;
    amount: number;
    reference: string;
    callback_url?: string;
    metadata?: any;
    currency?: string;
}

export interface TransferRecipientData {
    type: 'nuban' | 'mobile_money' | 'basa';
    name: string;
    account_number: string;
    bank_code: string;
    currency?: string;
}

export interface InitiateTransferData {
    source: 'balance';
    amount: number;
    recipient: string;
    reason: string;
    reference?: string;
}

export interface PaystackResponse<T = any> {
    status: boolean;
    message: string;
    data: T;
}


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

    async initialisePayment(data: InitializePaymentData): Promise<PaystackResponse> {
        try {
            const response = await axios.post(
                `${this.baseURL}/transaction/initialize`,
                data,
                { headers: this.getHeaders() }
            );
            return response.data;
        } catch (error: any) {
            throw new Error(`Paystack initialization error: ${error.response?.data?.message || error.message}`);
        }
    }

    async createTransferRecipient(data: TransferRecipientData): Promise<PaystackResponse> {
        try {
            const response = await axios.post(
                `${this.baseURL}/transferrecipient`,
                data,
                { headers: this.getHeaders() }
            );
            return response.data;
        } catch (error: any) {
            throw new Error(`Paystack recipient creation error: ${error.response?.data?.message || error.message}`);
        }
    }

    // Initiate Transfer
    async initiateTransfer(data: InitiateTransferData): Promise<PaystackResponse> {
        try {
            const response = await axios.post(
                `${this.baseURL}/transfer`,
                data,
                { headers: this.getHeaders() }
            );
            return response.data;
        } catch (error: any) {
            throw new Error(`Paystack transfer error: ${error.response?.data?.message || error.message}`);
        }
    }

    // Verify Transfer Status
    async verifyTransfer(transferCode: string): Promise<PaystackResponse> {
        try {
            const response = await axios.get(
                `${this.baseURL}/transfer/verify/${transferCode}`,
                { headers: this.getHeaders() }
            );
            return response.data;
        } catch (error: any) {
            throw new Error(`Paystack transfer verification error: ${error.response?.data?.message || error.message}`);
        }
    }

    // Get Banks List
    async getBanks(country: string = 'nigeria'): Promise<PaystackResponse> {
        try {
            const response = await axios.get(
                `${this.baseURL}/bank?country=${country}`,
                { headers: this.getHeaders() }
            );
            return response.data;
        } catch (error: any) {
            throw new Error(`Paystack banks fetch error: ${error.response?.data?.message || error.message}`);
        }
    }

    // Resolve Account Number
    async resolveAccountNumber(accountNumber: string, bankCode: string): Promise<PaystackResponse> {
        try {
            const response = await axios.get(
                `${this.baseURL}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
                { headers: this.getHeaders() }
            );
            return response.data;
        } catch (error: any) {
            throw new Error(`Paystack account resolution error: ${error.response?.data?.message || error.message}`);
        }
    }

    // Verify Webhook Signature
    verifyWebhookSignature(payload: string, signature: string): boolean {
        const hash = crypto
            .createHmac('sha512', this.secretKey)
            .update(payload, 'utf8')
            .digest('hex');
        return hash === signature;
    }

    // Generate Payment Reference
    generateReference(prefix: string = 'TX'): string {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        return `${prefix}_${timestamp}_${random}`.toUpperCase();
    }

    // Convert amount to kobo (Paystack uses kobo)
    toKobo(amount: number): number {
        return Math.round(amount * 100);
    }

    // Convert amount from kobo to naira
    fromKobo(amount: number): number {
        return amount / 100;
    }
}

export const paystackService = new PaystackService();