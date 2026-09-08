export interface CreatePaymentIntentParams {
  bookingId: string;
  amount: number;
  currency: string;
  customerEmail?: string;
  customerPhone?: string;
  metadata?: Record<string, any>;
}

export interface PaymentIntentResult {
  paymentIntentId: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'FAILED';
}

export interface WebhookEventPayload {
  event: string;
  paymentIntentId: string;
  bookingId: string;
  amount: number;
  status: string;
  signature?: string;
}

export interface PaymentProvider {
  createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResult>;
  verifyWebhookSignature(payload: any, signature: string): boolean;
  processRefund(paymentIntentId: string, amount: number): Promise<{ refundId: string; status: string }>;
}
