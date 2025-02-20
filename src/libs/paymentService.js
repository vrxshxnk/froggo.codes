import { db } from "./firebase";
import { doc, setDoc, updateDoc, getDoc } from "firebase/firestore";
import { trackEvent } from "./analytics";

export const paymentService = {
  async createPayment(userId, courseId, amount) {
    try {
      const paymentDoc = {
        user_id: userId,
        course_id: courseId,
        amount,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const paymentRef = doc(db, "payments", `${userId}_${courseId}`);
      await setDoc(paymentRef, paymentDoc);

      trackEvent('payment_initiated', {
        course_id: courseId,
        amount: amount
      });

      return paymentDoc;
    } catch (error) {
      console.error("Error creating payment:", error);
      throw error;
    }
  },

  async updatePaymentStatus(userId, courseId, paymentId, status) {
    try {
      const paymentRef = doc(db, "payments", `${userId}_${courseId}`);
      await updateDoc(paymentRef, {
        razorpay_payment_id: paymentId,
        status,
        updated_at: new Date().toISOString()
      });

      trackEvent('payment_completed', {
        course_id: courseId,
        payment_id: paymentId
      });
    } catch (error) {
      console.error("Error updating payment:", error);
      throw error;
    }
  }
};