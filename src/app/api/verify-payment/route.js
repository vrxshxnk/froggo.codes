// src/app/api/verify-payment/route.js
// Verifies Razorpay payment signature server-side before granting course access
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { verifyAuthToken, adminDb } from '@/libs/firebaseAdmin';
import { grantCourseAccess } from '@/libs/enrollment';
import { paymentRateLimiter, checkRateLimit } from '@/libs/ratelimit';

export async function POST(req) {
  try {
    // 1. Verify Firebase authentication
    const authResult = await verifyAuthToken(req);

    if (!authResult) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { userId } = authResult;

    // 2. Rate limiting (reuse payment limiter — same window)
    const rateLimitResult = await checkRateLimit(paymentRateLimiter, userId);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // 3. Parse request body
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, courseId } = body;

    // 4. Validate required fields
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !courseId) {
      return NextResponse.json(
        { error: 'Missing required fields: razorpay_payment_id, razorpay_order_id, razorpay_signature, courseId' },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(courseId)) {
      return NextResponse.json(
        { error: 'Invalid courseId format' },
        { status: 400 }
      );
    }

    // 5. Verify Razorpay signature (HMAC-SHA256)
    // Razorpay signs: order_id + "|" + payment_id
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      console.error('RAZORPAY_KEY_SECRET is not configured');
      return NextResponse.json(
        { error: 'Payment verification service error' },
        { status: 500 }
      );
    }

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('Razorpay signature mismatch', { userId, courseId, orderId: razorpay_order_id });
      return NextResponse.json(
        { error: 'Payment signature verification failed' },
        { status: 400 }
      );
    }

    // 6. Confirm the pending payment record belongs to this user
    const paymentRef = adminDb.collection('payments').doc(`${userId}_${courseId}`);
    const paymentDoc = await paymentRef.get();

    if (!paymentDoc.exists) {
      return NextResponse.json(
        { error: 'Payment record not found' },
        { status: 404 }
      );
    }

    const paymentData = paymentDoc.data();

    if (paymentData.user_id !== userId) {
      console.error('Payment user_id mismatch', { userId, courseId });
      return NextResponse.json(
        { error: 'Payment record mismatch' },
        { status: 403 }
      );
    }

    // The pending record is created server-side in create-payment with the
    // Razorpay order id — the submitted order must be the one we created,
    // which pins the verified payment to the server-computed amount.
    if (paymentData.order_id && paymentData.order_id !== razorpay_order_id) {
      console.error('Razorpay order_id mismatch', {
        userId,
        courseId,
        expected: paymentData.order_id,
        received: razorpay_order_id,
      });
      return NextResponse.json(
        { error: 'Payment order mismatch' },
        { status: 400 }
      );
    }

    if (paymentData.status === 'completed') {
      // Already verified — idempotent response
      return NextResponse.json({ success: true, courseId });
    }

    // 7. Mark payment completed, create enrollment, send receipt email
    await grantCourseAccess({
      userId,
      courseId,
      email: authResult.email,
      provider: 'razorpay',
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      amount: paymentData.amount,
      currency: paymentData.currency || 'INR',
    });

    console.log('Payment verified, enrollment granted:', {
      userId,
      courseId,
      paymentId: razorpay_payment_id,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, courseId });

  } catch (error) {
    console.error('Payment verification error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { error: 'Payment verification failed. Please contact support.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
