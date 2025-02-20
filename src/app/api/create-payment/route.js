import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET  // Changed from RAZORPAY_SECRET
});

export async function POST(req) {
  try {
    const { amount, courseId } = await req.json();

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `course_${courseId}_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json({ orderId: order.id });
  } catch (error) {
    console.error('Payment creation failed:', error);
    return NextResponse.json(
      { error: 'Payment initialization failed' },
      { status: 500 }
    );
  }
}