"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { courseService } from "@/libs/courseService";
import { paymentService } from "@/libs/paymentService";
import Link from "next/link";

const MyCourses = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [myCourses, setMyCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/?signin=true");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchCourses = async () => {
      if (user) {
        try {
          console.log("Fetching courses for user:", user.id);

          // Fetch all courses first
          const allAvailableCourses = await courseService.getAllCourses();
          console.log("All courses fetched:", allAvailableCourses);

          if (!Array.isArray(allAvailableCourses)) {
            throw new Error("Invalid response from getAllCourses");
          }

          setAllCourses(
            allAvailableCourses.map((course) => ({
              ...course,
              isEnrolled: false, // Will update this after getting user courses
              thumbnail: course.thumbnail || "🐍",
            }))
          );

          // Then fetch user's enrolled courses
          const userCourses = await courseService.getUserCourses(user.id);
          console.log("User courses fetched:", userCourses);

          if (
            userCourses &&
            Array.isArray(userCourses) &&
            userCourses.length > 0
          ) {
            const coursesWithProgress = await Promise.all(
              userCourses.map(async (course) => {
                try {
                  const progress = await courseService.getCourseProgress(
                    user.id,
                    course.course_id
                  );

                  return {
                    id: course.course_id,
                    title: course.courses?.title || "Untitled Course",
                    description: course.courses?.description || "",
                    thumbnail: course.courses?.thumbnail || "🐍",
                    progress: progress?.percentage || 0,
                    lastAccessed:
                      course.last_accessed || new Date().toISOString(),
                  };
                } catch (progressError) {
                  console.error("Error fetching progress:", progressError);
                  return null;
                }
              })
            );

            // Filter out any null values from failed progress fetches
            const validCourses = coursesWithProgress.filter(Boolean);
            setMyCourses(validCourses);

            // Update enrolled status in allCourses
            const enrolledCourseIds = new Set(validCourses.map((c) => c.id));
            setAllCourses((prev) =>
              prev.map((course) => ({
                ...course,
                isEnrolled: enrolledCourseIds.has(course.id),
              }))
            );
          }
        } catch (error) {
          console.error("Detailed error:", {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: error.code,
          });
          // Set default states on error
          setMyCourses([]);
          setAllCourses([]);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchCourses();
  }, [user]);

  // Inside the MyCourses component
  const waitForRazorpay = (maxAttempts = 10, interval = 1000) => {
    return new Promise((resolve, reject) => {
      let attempts = 0;

      const check = () => {
        attempts++;
        if (typeof window.Razorpay !== "undefined") {
          resolve(window.Razorpay);
        } else if (attempts === maxAttempts) {
          reject(new Error("Razorpay SDK failed to load"));
        } else {
          setTimeout(check, interval);
        }
      };

      check();
    });
  };

  const handleEnroll = async (courseId) => {
    if (!user) {
      console.log("Enroll button clicked, dispatching open-signup-modal event");
      window.dispatchEvent(new CustomEvent("open-signup-modal"));
      return;
    }

    try {
      const course = allCourses.find((c) => c.id === courseId);
      if (!course) throw new Error("Course not found");

      // Create payment record
      await paymentService.createPayment(user.id, courseId, 4999);

      const response = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 4999, courseId }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Payment initialization failed");

      // Load Razorpay script dynamically
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";

      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: 4999 * 100,
        currency: "INR",
        name: "FroggoCodes",
        description: `${course.title} Course Purchase`,
        order_id: data.orderId,
        handler: async (response) => {
          try {
            await paymentService.updatePaymentStatus(
              user.id,
              courseId,
              response.razorpay_payment_id,
              "completed"
            );

            await courseService.updateLastAccessed(user.id, courseId, {
              user_id: user.id,
              course_id: courseId,
              last_accessed: new Date().toISOString(),
              courses: {
                title: course.title,
                description: course.description,
                thumbnail: course.thumbnail,
              },
            });

            window.location.reload();
          } catch (error) {
            console.error("Error in payment handler:", error);
            alert(
              "Payment successful but enrollment failed. Please contact support."
            );
          }
        },
        prefill: {
          email: user.email,
        },
        modal: {
          ondismiss: function () {
            console.log("Payment modal closed");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        console.error("Payment failed:", response.error);
        alert(response.error.description);
      });
      rzp.open();
    } catch (error) {
      console.error("Error in handleEnroll:", error);
      alert(error.message || "Failed to process payment. Please try again.");
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-[#181818] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-[#181818] py-24 px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="text-white hover:text-gray-300 mb-8 inline-flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5 mr-2"
          >
            <path
              fillRule="evenodd"
              d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
              clipRule="evenodd"
            />
          </svg>
          Back
        </Link>

        {myCourses.length === 0 ? (
          <>
            {/* All Courses Section - Prominent when no enrollments */}
            <section className="mb-16">
              <h2 className="text-4xl font-bold text-white mb-8 bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                Discover Our Courses
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                {allCourses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-neutral-800 rounded-lg p-6 border border-white/10 hover:border-emerald-500/50 transition-all relative"
                  >
                    {course.isEnrolled && (
                      <div className="absolute top-4 right-4">
                        <span className="bg-emerald-600 text-white text-xs px-2 py-1 rounded-full">
                          Enrolled
                        </span>
                      </div>
                    )}
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-4xl mb-4 block">
                          {course.thumbnail}
                        </span>
                        <h3 className="text-xl font-bold text-white mb-2">
                          {course.title}
                        </h3>
                        <p className="text-gray-400 mb-4">
                          {course.description}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/10">
                      {course.isEnrolled ? (
                        <Link
                          href={`/my-courses/${course.id}`}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md transition-colors inline-block text-center"
                        >
                          Continue Learning
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleEnroll(course.id)}
                          className="w-full bg-white hover:bg-emerald-100 text-emerald-700 py-2 px-4 rounded-md transition-colors"
                        >
                          Enroll Now
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* My Courses Section - Empty state */}
            <section>
              <h1 className="text-4xl font-bold text-white mb-8">My Courses</h1>
              <div className="text-center py-12">
                <p className="text-gray-400 text-center mt-4">
                  You haven&apos;t enrolled in any courses yet.
                </p>
              </div>
            </section>
          </>
        ) : (
          <>
            {/* My Courses Section - When user has enrollments */}
            <section className="mb-16">
              <h1 className="text-4xl font-bold text-white mb-8">My Courses</h1>
              <div className="grid gap-6 md:grid-cols-2">
                {myCourses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-neutral-800 rounded-lg p-6 border border-white/10 hover:border-emerald-500/50 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-4xl mb-4 block">
                          {course.thumbnail}
                        </span>
                        <h3 className="text-xl font-bold text-white mb-2">
                          {course.title}
                        </h3>
                        <p className="text-emerald-500 mb-4">
                          Progress: {course.progress}%
                        </p>
                        <p className="text-sm text-gray-400">
                          Last accessed:{" "}
                          {new Date(course.lastAccessed).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <Link
                        href={`/my-courses/${course.id}`}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md transition-colors inline-block text-center"
                      >
                        Continue Learning
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* All Courses Section - Normal when user has enrollments */}
            <section>
              <h2 className="text-4xl font-bold text-white mb-8">
                All Courses
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                {allCourses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-neutral-800 rounded-lg p-6 border border-white/10 hover:border-emerald-500/50 transition-all relative"
                  >
                    {course.isEnrolled && (
                      <div className="absolute top-4 right-4">
                        <span className="bg-emerald-600 text-white text-xs px-2 py-1 rounded-full">
                          Enrolled
                        </span>
                      </div>
                    )}
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-4xl mb-4 block">
                          {course.thumbnail}
                        </span>
                        <h3 className="text-xl font-bold text-white mb-2">
                          {course.title}
                        </h3>
                        <p className="text-gray-400 mb-4">
                          {course.description}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/10">
                      {course.isEnrolled ? (
                        <Link
                          href={`/my-courses/${course.id}`}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md transition-colors inline-block text-center"
                        >
                          Continue Learning
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleEnroll(course.id)}
                          className="w-full bg-white hover:bg-emerald-100 text-emerald-700 py-2 px-4 rounded-md transition-colors"
                        >
                          Enroll Now
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
};

export default MyCourses;
