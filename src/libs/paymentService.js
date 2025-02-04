import { loadRazorpay } from './razorpay';

export const initializePayment = async (user) => {
  try {
    // Create order on your backend
    const order = await fetch('/api/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 1999,
        userId: user.uid, // Changed from user.id to user.uid
      }),
    }).then(res => res.json());

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: "INR",
      name: "FroggoCodes",
      description: "Python Bootcamp Course Purchase",
      order_id: order.id,
      prefill: {
        email: user.email,
        name: user.displayName || '', // Changed from user.user_metadata?.full_name
      },
      theme: {
        color: "#059669",
      },
      handler: async (response) => {
        try {
          const result = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              userId: user.uid, // Changed from user.id to user.uid
            }),
          });

          if (result.ok) {
            window.location.href = '/my-courses';
          }
        } catch (error) {
          console.error('Payment verification failed:', error);
          alert('Payment verification failed. Please contact support.');
        }
      },
    };

    const rzp = await loadRazorpay();
    const paymentObject = new rzp(options);
    paymentObject.open();
  } catch (error) {
    console.error('Payment initialization failed:', error);
    throw error; // Propagate the error to be handled by the component
  }
};