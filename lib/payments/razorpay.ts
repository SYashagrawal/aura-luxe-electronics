import crypto from 'crypto';

export interface CreatePaymentOrderParams {
  orderId: string;
  amount: number; // in INR rupees
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface PaymentVerificationParams {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

/**
 * Creates a Razorpay Order via their standard API
 */
export async function createRazorpayOrder(params: CreatePaymentOrderParams) {
  const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_placeholder';

  const amountInPaise = Math.round(params.amount * 100);

  // If running in development with mock/missing keys, return a structured test payload
  if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('placeholder')) {
    return {
      id: `order_mock_${Date.now()}`,
      amount: amountInPaise,
      currency: params.currency || 'INR',
      receipt: params.receipt,
      status: 'created',
      is_mock: true,
    };
  }

  const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${basicAuth}`,
    },
    body: JSON.stringify({
      amount: amountInPaise,
      currency: params.currency || 'INR',
      receipt: params.receipt,
      notes: params.notes || {},
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Razorpay Order creation failed: ${errorBody}`);
  }

  return response.json();
}

/**
 * Cryptographically verifies Razorpay payment signature
 */
export function verifyRazorpaySignature(params: PaymentVerificationParams): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_placeholder';
  
  const text = `${params.razorpayOrderId}|${params.razorpayPaymentId}`;
  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(text)
    .digest('hex');

  return generatedSignature === params.razorpaySignature;
}

/**
 * Cryptographically verifies Razorpay Webhook signature
 */
export function verifyRazorpayWebhook(rawBody: string, webhookSignature: string): boolean {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_webhook_secret_placeholder';
  
  const generatedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  return generatedSignature === webhookSignature;
}
