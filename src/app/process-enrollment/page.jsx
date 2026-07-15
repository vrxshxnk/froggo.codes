"use client";

import { useEffect, useState, Suspense, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { courseService } from "@/libs/courseService";
import { locationService } from "@/libs/locationService";
import { auth } from "@/libs/firebase";
import config from "@/config";

const ProcessEnrollmentContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState("checking"); // checking, owned, purchasing, completing, error
  const [error, setError] = useState("");
  const [course, setCourse] = useState(null);
  const hasStartedRef = useRef(false);

  const courseId = searchParams.get("courseId");

  // After a Paddle checkout completes, access is granted by the webhook —
  // poll until the enrollment lands, then send the user into the course
  const pollForAccess = useCallback(
    async (targetCourseId) => {
      const maxAttempts = 20; // ~40 seconds

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const hasAccess = await courseService.verifyUserCourseAccess(
          user.id,
          targetCourseId
        );

        if (hasAccess) {
          sessionStorage.removeItem("pendingCourseEnrollment");
          router.push(`/my-courses/${targetCourseId}`);
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      setError(
        "Payment received! Your course access is being set up — check My Courses in a minute."
      );
      setStatus("error");
    },
    [user, router]
  );

  // International checkout via Paddle (merchant of record — handles cards,
  // PayPal, and tax). Fulfillment happens in /api/paddle-webhook.
  const initiatePaddleCheckout = useCallback(
    async (courseData) => {
      if (!window.Paddle) {
        const script = document.createElement("script");
        script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";

        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      let checkoutCompleted = false;

      if (config.paddle.environment === "sandbox") {
        window.Paddle.Environment.set("sandbox");
      }

      window.Paddle.Initialize({
        token: config.paddle.clientToken,
        eventCallback: (event) => {
          if (event.name === "checkout.completed") {
            checkoutCompleted = true;
            setStatus("completing");
            pollForAccess(courseData.id);
          } else if (event.name === "checkout.closed" && !checkoutCompleted) {
            sessionStorage.removeItem("pendingCourseEnrollment");
            router.push("/my-courses");
          }
        },
      });

      window.Paddle.Checkout.open({
        items: [{ priceId: courseData.paddle_price_id, quantity: 1 }],
        customData: {
          userId: user.id,
          courseId: courseData.id,
          email: user.email,
        },
        customer: { email: user.email },
        settings: { displayMode: "overlay", theme: "dark" },
      });
    },
    [user, router, pollForAccess]
  );

  const initiatePayment = useCallback(async (courseData, isIndianUser) => {
    try {
      // International buyers go through Paddle when the course has a Paddle
      // price configured; Indian buyers (and the fallback) use Razorpay in INR
      if (
        !isIndianUser &&
        courseData.paddle_price_id &&
        config.paddle.clientToken
      ) {
        await initiatePaddleCheckout(courseData);
        return;
      }

      // Get Firebase ID token for secure API authentication
      const idToken = await auth.currentUser?.getIdToken();

      if (!idToken) {
        throw new Error("Unable to authenticate. Please log in again.");
      }

      // The server derives the price from the course document and records
      // the pending payment — the client only says which course
      const response = await fetch("/api/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({ courseId: courseData.id }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Payment initialization failed");
      }

      // Load Razorpay script dynamically (only if not already loaded)
      if (!window.Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";

        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount * 100,
        currency: data.currency || "INR",
        name: "FroggoCodes",
        description: `${courseData.title} Course Purchase`,
        order_id: data.orderId,
        handler: async (razorpayResponse) => {
          try {
            setStatus("completing");

            // Verify payment signature server-side before granting access
            const idToken = await auth.currentUser?.getIdToken();

            if (!idToken) {
              throw new Error("Unable to authenticate. Please log in again.");
            }

            const verifyResponse = await fetch("/api/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${idToken}`,
              },
              body: JSON.stringify({
                razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                razorpay_order_id: razorpayResponse.razorpay_order_id,
                razorpay_signature: razorpayResponse.razorpay_signature,
                courseId: courseData.id,
              }),
            });

            if (!verifyResponse.ok) {
              const errorData = await verifyResponse.json();
              throw new Error(errorData.error || "Payment verification failed");
            }

            // Update display metadata (title, thumbnail) — non-security, best-effort
            await courseService.updateLastAccessed(user.id, courseData.id, {
              user_id: user.id,
              course_id: courseData.id,
              last_accessed: new Date().toISOString(),
              courses: {
                title: courseData.title,
                description: courseData.description,
                thumbnail: courseData.thumbnail,
              },
            });

            sessionStorage.removeItem("pendingCourseEnrollment");
            router.push(`/my-courses/${courseData.id}`);
          } catch (error) {
            console.error("Error in payment handler:", error);
            setError("Payment verification failed. Please contact support.");
            setStatus("error");
          }
        },
        prefill: {
          email: user.email,
        },
        modal: {
          ondismiss: function () {
            sessionStorage.removeItem("pendingCourseEnrollment");
            router.push("/my-courses");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        console.error("Payment failed:", response.error);
        setError(response.error.description || "Payment failed");
        setStatus("error");
        // Clear session storage on failure
        sessionStorage.removeItem("pendingCourseEnrollment");
      });
      rzp.open();
    } catch (error) {
      console.error("Error initiating payment:", error);
      setError(error.message || "Failed to process payment. Please try again.");
      setStatus("error");
    }
  }, [user, router, initiatePaddleCheckout]);

  useEffect(() => {
    if (hasStartedRef.current) return;

    const processEnrollment = async () => {
      if (authLoading) return;

      if (!user) {
        router.push("/");
        return;
      }

      if (!courseId) {
        setError("No course selected");
        setStatus("error");
        return;
      }

      hasStartedRef.current = true;

      try {
        // Detect user location for pricing as a local variable (not state)
        // to avoid re-triggering this effect
        let isIndianUser = true;
        try {
          isIndianUser = await locationService.detectUserLocation();
        } catch {
          // Fallback to Indian pricing
        }

        // Get course details with correct locale
        const courseData = await courseService.getCourseWithPricing(courseId, isIndianUser);
        setCourse(courseData);

        // Check if user already owns this course
        const hasAccess = await courseService.verifyUserCourseAccess(user.id, courseId);

        if (hasAccess) {
          setStatus("owned");
          setTimeout(() => {
            router.push(`/my-courses/${courseId}`);
          }, 2000);
          return;
        }

        // User doesn't own the course, start payment process
        setStatus("purchasing");
        await initiatePayment(courseData, isIndianUser);

      } catch (error) {
        console.error("Error processing enrollment:", error);
        setError(error.message || "Failed to process enrollment");
        setStatus("error");
      }
    };

    processEnrollment();
  }, [authLoading, user, courseId, router, initiatePayment]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#181818] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181818] flex items-center justify-center p-4">
      <div className="bg-neutral-800 rounded-lg p-8 max-w-md w-full border border-white/10 shadow-lg text-center">
        {status === "checking" && (
          <div className="space-y-4">
            <div className="animate-spin h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
            <h2 className="text-white text-xl font-semibold">Processing Enrollment</h2>
            <p className="text-gray-300">Checking your course access...</p>
          </div>
        )}

        {status === "owned" && (
          <div className="space-y-4">
            <div className="text-emerald-500 text-4xl">✓</div>
            <h2 className="text-white text-xl font-semibold">Course Already Owned</h2>
            <p className="text-gray-300">
              You already have access to {course?.title}. Redirecting you to the course...
            </p>
          </div>
        )}

        {status === "purchasing" && (
          <div className="space-y-4">
            <div className="animate-pulse h-8 w-8 bg-emerald-500 rounded-full mx-auto"></div>
            <h2 className="text-white text-xl font-semibold">Opening Payment</h2>
            <p className="text-gray-300">
              Initializing payment for {course?.title}...
            </p>
          </div>
        )}

        {status === "completing" && (
          <div className="space-y-4">
            <div className="animate-spin h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
            <h2 className="text-white text-xl font-semibold">Completing Enrollment</h2>
            <p className="text-gray-300">
              Payment successful! Setting up your course access...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="text-red-500 text-4xl">✕</div>
            <h2 className="text-white text-xl font-semibold">Enrollment Error</h2>
            <p className="text-red-400 text-sm">{error}</p>
            <div className="space-y-2">
              <button
                onClick={() => router.push("/my-courses")}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md transition-colors"
              >
                Go to My Courses
              </button>
              <button
                onClick={() => router.push("/")}
                className="w-full bg-neutral-700 hover:bg-neutral-600 text-white py-2 px-4 rounded-md transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ProcessEnrollment = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#181818] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <ProcessEnrollmentContent />
    </Suspense>
  );
};

export default ProcessEnrollment;