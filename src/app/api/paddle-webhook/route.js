// src/app/api/paddle-webhook/route.js
// Paddle Billing webhook — fulfills international purchases. Paddle acts as
// merchant of record (handles cards, PayPal, tax), so enrollment is granted
// here on transaction.completed rather than via a client verify flow.
// Configure in Paddle dashboard → Developer Tools → Notifications:
// event "transaction.completed", secret in PADDLE_WEBHOOK_SECRET.
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { grantCourseAccess } from '@/libs/enrollment';

// Header format: "ts=1671552777;h1=abc123..."
function parsePaddleSignature(header) {
  const parts = Object.fromEntries(
    header.split(';').map((part) => part.split('=').map((s) => s.trim()))
  );
  return { ts: parts.ts, h1: parts.h1 };
}

export async function POST(req) {
  try {
    const secret = process.env.PADDLE_WEBHOOK_SECRET;

    if (!secret) {
      console.error('PADDLE_WEBHOOK_SECRET is not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    const rawBody = await req.text();
    const signatureHeader = req.headers.get('paddle-signature');

    if (!signatureHeader) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const { ts, h1 } = parsePaddleSignature(signatureHeader);

    if (!ts || !h1) {
      return NextResponse.json({ error: 'Malformed signature' }, { status: 400 });
    }

    // Paddle signs `${ts}:${rawBody}` with HMAC-SHA256, hex-encoded
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${ts}:${rawBody}`)
      .digest('hex');

    const signatureValid =
      h1.length === expectedSignature.length &&
      crypto.timingSafeEqual(Buffer.from(h1), Buffer.from(expectedSignature));

    if (!signatureValid) {
      console.error('Paddle webhook signature mismatch');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    if (event.event_type === 'transaction.completed') {
      const transaction = event.data;
      const { userId, courseId, email } = transaction?.custom_data || {};

      if (!userId || !courseId || !/^[a-zA-Z0-9_-]+$/.test(courseId)) {
        console.warn('Paddle webhook: transaction.completed without valid custom_data', {
          transactionId: transaction?.id,
        });
        return NextResponse.json({ received: true });
      }

      // Totals come back as strings in the currency's smallest unit
      const totalRaw = transaction.details?.totals?.total;
      const amount = totalRaw != null ? Number(totalRaw) / 100 : null;

      const { alreadyCompleted } = await grantCourseAccess({
        userId,
        courseId,
        email,
        provider: 'paddle',
        orderId: transaction.id,
        paymentId: transaction.id,
        amount: Number.isFinite(amount) ? amount : null,
        currency: transaction.currency_code || 'USD',
      });

      console.log('Paddle webhook processed:', {
        transactionId: transaction.id,
        userId,
        courseId,
        alreadyCompleted,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Paddle webhook error:', {
      message: error.message,
      timestamp: new Date().toISOString(),
    });
    // Non-2xx makes Paddle retry — desirable for transient failures
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
