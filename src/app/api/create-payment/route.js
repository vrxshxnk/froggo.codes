// src/app/api/create-payment/route.js
// Secure payment creation API with Firebase token verification and Redis rate limiting.
// The charge amount is derived server-side from the course document — the client
// cannot influence the price.
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { verifyAuthToken, adminDb } from '@/libs/firebaseAdmin';
import { getCourseChargeInr } from '@/libs/enrollment';
import { paymentRateLimiter, checkRateLimit } from '@/libs/ratelimit';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

export async function POST(req) {
  try {
    // 1. Verify Firebase authentication token (SERVER-SIDE)
    const authResult = await verifyAuthToken(req);

    if (!authResult) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in and try again.' },
        { status: 401 }
      );
    }

    // Extract userId from the VERIFIED token, not from request body
    const { userId, email } = authResult;

    // 2. Rate limiting using Redis (distributed, persistent)
    const rateLimitResult = await checkRateLimit(paymentRateLimiter, userId);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many payment requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          }
        }
      );
    }

    // 3. Parse and validate input
    let requestData;
    try {
      requestData = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    const { courseId } = requestData;

    if (
      typeof courseId !== 'string' ||
      courseId.length === 0 ||
      courseId.length > 50 ||
      !/^[a-zA-Z0-9_-]+$/.test(courseId)
    ) {
      return NextResponse.json(
        { error: 'Invalid courseId' },
        { status: 400 }
      );
    }

    // 4. Derive the price server-side — client-sent amounts are ignored
    const charge = await getCourseChargeInr(courseId);

    if (!charge) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    const { amount } = charge;

    // 5. Create Razorpay order with the server-computed amount
    const options = {
      amount: amount * 100, // Convert to paise
      currency: "INR",
      receipt: `course_${courseId}_${userId}_${Date.now()}`.slice(0, 40), // Razorpay receipt limit
      notes: {
        userId: userId,
        courseId: courseId,
        email: email,
      }
    };

    const order = await razorpay.orders.create(options);

    // 6. Record the pending payment server-side so verify-payment can
    // match the order id and amount (clients can no longer forge these)
    const now = new Date().toISOString();
    await adminDb.collection('payments').doc(`${userId}_${courseId}`).set({
      user_id: userId,
      course_id: courseId,
      provider: 'razorpay',
      order_id: order.id,
      amount: amount,
      currency: 'INR',
      status: 'pending',
      created_at: now,
      updated_at: now,
    }, { merge: true });

    console.log('Payment order created:', {
      orderId: order.id,
      userId: userId,
      courseId: courseId,
      amount: amount,
      timestamp: now
    });

    return NextResponse.json({
      orderId: order.id,
      amount: amount,
      currency: "INR"
    });

  } catch (error) {
    console.error('Payment creation failed:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    // Don't leak internal errors to client
    return NextResponse.json(
      { error: 'Payment initialization failed. Please try again.' },
      { status: 500 }
    );
  }
}

// Explicitly deny other methods
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
