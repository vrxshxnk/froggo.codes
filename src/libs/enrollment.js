// src/libs/enrollment.js
// Server-side enrollment logic shared by verify-payment and the
// Razorpay/Paddle webhooks. All writes go through the Admin SDK.
import { adminDb } from "./firebaseAdmin";
import { sendEnrollmentEmail } from "./email";

// Fallbacks mirror pricingUtils in courseService.js
const DEFAULT_PRICE_INDIA = 9999;
const DEFAULT_DISCOUNT = 50;

/**
 * Compute the INR amount to charge for a course, server-side.
 * Never trusts a client-provided amount.
 * @param {string} courseId
 * @returns {Promise<{amount: number, title: string, comingSoon: boolean} | null>} null if course doesn't exist
 */
export async function getCourseChargeInr(courseId) {
    const courseDoc = await adminDb.collection("courses").doc(courseId).get();

    if (!courseDoc.exists) {
        return null;
    }

    const data = courseDoc.data();
    const basePrice = data.price_india || DEFAULT_PRICE_INDIA;
    const discount = data.discount ?? DEFAULT_DISCOUNT;
    const amount =
        discount > 0
            ? Math.floor(basePrice - (basePrice * discount) / 100)
            : Math.floor(basePrice);

    return {
        amount,
        title: data.title || courseId,
        comingSoon: Boolean(data.coming_soon),
    };
}

/**
 * Idempotently mark a payment completed and grant course access.
 * Safe to call from both the client-driven verify flow and webhooks —
 * the enrollment email is only sent on the first completion.
 */
export async function grantCourseAccess({
    userId,
    courseId,
    email,
    provider,
    orderId,
    paymentId,
    amount,
    currency,
}) {
    const now = new Date().toISOString();
    const paymentRef = adminDb.collection("payments").doc(`${userId}_${courseId}`);

    const alreadyCompleted = await adminDb.runTransaction(async (tx) => {
        const snapshot = await tx.get(paymentRef);
        const existing = snapshot.exists ? snapshot.data() : null;

        if (existing?.status === "completed") {
            return true;
        }

        tx.set(
            paymentRef,
            {
                user_id: userId,
                course_id: courseId,
                provider: provider || "razorpay",
                order_id: orderId || existing?.order_id || null,
                payment_id: paymentId || null,
                amount: amount ?? existing?.amount ?? null,
                currency: currency || existing?.currency || "INR",
                status: "completed",
                created_at: existing?.created_at || now,
                updated_at: now,
            },
            { merge: true }
        );

        return false;
    });

    await adminDb.collection("user_courses").doc(`${userId}_${courseId}`).set(
        {
            user_id: userId,
            course_id: courseId,
            last_accessed: now,
        },
        { merge: true }
    );

    if (!alreadyCompleted && email) {
        try {
            const courseDoc = await adminDb.collection("courses").doc(courseId).get();
            await sendEnrollmentEmail({
                to: email,
                courseTitle: courseDoc.exists ? courseDoc.data().title : courseId,
                courseId,
                amount,
                currency,
            });
        } catch (error) {
            // Email is best-effort — never fail enrollment over it
            console.error("Enrollment email failed:", error.message);
        }
    }

    return { alreadyCompleted };
}
