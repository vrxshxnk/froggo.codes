// src/app/api/razorpay-webhook/route.js
// Razorpay webhook — grants enrollment even if the buyer's browser never
// completes the client-side verify flow (tab closed, network drop, etc).
// Configure in the Razorpay dashboard: event "payment.captured", secret in
// RAZORPAY_WEBHOOK_SECRET.
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { grantCourseAccess } from '@/libs/enrollment';

export async function POST(req) {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret) {
      console.error('RAZORPAY_WEBHOOK_SECRET is not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    // Signature is computed over the raw body — read it before parsing
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    const signatureValid =
      signature.length === expectedSignature.length &&
      crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));

    if (!signatureValid) {
      console.error('Razorpay webhook signature mismatch');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === 'payment.captured') {
      const payment = event.payload?.payment?.entity;
      const { userId, courseId, email } = payment?.notes || {};

      if (!userId || !courseId || !/^[a-zA-Z0-9_-]+$/.test(courseId)) {
        // Not one of our course orders (or malformed) — acknowledge and skip
        console.warn('Razorpay webhook: payment.captured without valid notes', {
          paymentId: payment?.id,
        });
        return NextResponse.json({ received: true });
      }

      const { alreadyCompleted } = await grantCourseAccess({
        userId,
        courseId,
        email,
        provider: 'razorpay',
        orderId: payment.order_id,
        paymentId: payment.id,
        amount: payment.amount / 100, // paise → rupees
        currency: payment.currency || 'INR',
      });

      console.log('Razorpay webhook processed:', {
        paymentId: payment.id,
        userId,
        courseId,
        alreadyCompleted,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Razorpay webhook error:', {
      message: error.message,
      timestamp: new Date().toISOString(),
    });
    // Non-2xx makes Razorpay retry — desirable for transient failures
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
