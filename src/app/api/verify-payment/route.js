import { db } from '@/libs/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import crypto from 'crypto';

export async function POST(req) {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      userId,
    } = await req.json();

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    if (signature !== razorpay_signature) {
      return Response.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Record payment in Firebase
    await setDoc(doc(db, 'payments', razorpay_payment_id), {
      userId,
      orderId: razorpay_order_id,
      amount: 1999,
      status: 'completed',
      createdAt: serverTimestamp(),
    });

    // Grant course access
    await setDoc(doc(db, 'user_courses', userId), {
      courseId: 'python-bootcamp',
      purchasedAt: serverTimestamp(),
      status: 'active',
    }, { merge: true });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Payment verification failed:', error);
    return Response.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}