import { Injectable } from '@nestjs/common';
import {
  CreatePaymentIntentParams,
  PaymentIntentResult,
  PaymentProvider,
} from './payment-provider.interface';

@Injectable()
export class MockPaymentProvider implements PaymentProvider {
  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResult> {
    const paymentIntentId = `pi_mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const clientSecret = `${paymentIntentId}_secret_${Math.random().toString(36).slice(2, 10)}`;

    return {
      paymentIntentId,
      clientSecret,
      amount: params.amount,
      currency: params.currency,
      status: 'PENDING',
    };
  }

  verifyWebhookSignature(payload: any, signature: string): boolean {
    if (!signature) return false;
    // Mock verification: valid if signature starts with 'sig_valid_' or equals mock-secret
    return signature.startsWith('sig_valid_') || signature === 'mock-webhook-secret';
  }

  async processRefund(paymentIntentId: string, amount: number): Promise<{ refundId: string; status: string }> {
    const refundId = `ref_mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    return {
      refundId,
      status: 'PROCESSED',
    };
  }
}
