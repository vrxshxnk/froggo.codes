import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  try {
    const { amount, userId } = await req.json();

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: "INR",
      receipt: `receipt_${userId}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    return Response.json(order);
  } catch (error) {
    console.error('Order creation failed:', error);
    return Response.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}