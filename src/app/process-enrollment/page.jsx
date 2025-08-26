"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { courseService } from "@/libs/courseService";
import { paymentService } from "@/libs/paymentService";
import { locationService } from "@/libs/locationService";

const ProcessEnrollmentContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState("checking"); // checking, owned, purchasing, error
  const [error, setError] = useState("");
  const [course, setCourse] = useState(null);
  const [isIndianUser, setIsIndianUser] = useState(false);

  const courseId = searchParams.get("courseId");

  const initiatePayment = useCallback(async (courseData) => {
    try {
      // Check if there's already a payment in progress to prevent duplicates
      if (status === "purchasing") {
        console.log("Payment already in progress, preventing duplicate");
        return;
      }

      console.log("Starting payment for course:", courseData.title, "Amount:", courseData.pricing?.discounted);

      // Get dynamic pricing for the course
      const paymentAmount = await courseService.getCoursePaymentAmount(
        courseData.id,
        isIndianUser
      );

      console.log("Payment amount from service:", paymentAmount);

      // Create payment record
      await paymentService.createPayment(user.id, courseData.id, paymentAmount);

      const response = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: paymentAmount, courseId: courseData.id }),
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
        amount: paymentAmount * 100,
        currency: "INR",
        name: "FroggoCodes",
        description: `${courseData.title} Course Purchase`,
        order_id: data.orderId,
        handler: async (response) => {
          try {
            console.log("Payment successful, processing enrollment...");
            setStatus("completing");

            await paymentService.updatePaymentStatus(
              user.id,
              courseData.id,
              response.razorpay_payment_id,
              "completed"
            );

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

            // Clear any session storage to prevent conflicts
            sessionStorage.removeItem("pendingCourseEnrollment");

            // Redirect to course
            router.push(`/my-courses/${courseData.id}`);
          } catch (error) {
            console.error("Error in payment handler:", error);
            setError("Payment successful but enrollment failed. Please contact support.");
            setStatus("error");
          }
        },
        prefill: {
          email: user.email,
        },
        modal: {
          ondismiss: function () {
            console.log("Payment modal closed, redirecting to courses");
            // Clear session storage when modal is dismissed
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
  }, [user, isIndianUser, router, status]);

  useEffect(() => {
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

      try {
        // Detect user location for pricing using centralized service
        try {
          const isIndia = await locationService.detectUserLocation();
          setIsIndianUser(isIndia);
        } catch (error) {
          console.error("Error detecting location:", error);
          setIsIndianUser(true); // Fallback to Indian pricing
        }

        // Get course details
        const courseData = await courseService.getCourseWithPricing(courseId, isIndianUser);
        setCourse(courseData);

        // Check if user already owns this course
        const hasAccess = await courseService.verifyUserCourseAccess(user.id, courseId);

        if (hasAccess) {
          setStatus("owned");
          // Redirect to course after 2 seconds
          setTimeout(() => {
            router.push(`/my-courses/${courseId}`);
          }, 2000);
          return;
        }

        // User doesn't own the course, start payment process
        setStatus("purchasing");
        await initiatePayment(courseData);

      } catch (error) {
        console.error("Error processing enrollment:", error);
        setError(error.message || "Failed to process enrollment");
        setStatus("error");
      }
    };

    processEnrollment();
  }, [authLoading, user, courseId, router, isIndianUser, initiatePayment]);

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