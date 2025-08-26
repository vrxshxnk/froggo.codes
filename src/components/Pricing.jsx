"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { courseService } from "@/libs/courseService";
import { locationService } from "@/libs/locationService";
import config from "@/config";

const Feature = ({ text }) => {
  return (
    <li className="flex items-start">
      <svg
        className="h-5 w-5 text-emerald-400 mt-0.5 mr-2 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
      <span className="text-white/80">{text}</span>
    </li>
  );
};

const Pricing = () => {
  const router = useRouter();
  const { user } = useAuth();

  // State for courses and slideshow
  const [allCourses, setAllCourses] = useState([]);
  const [courseFeatures, setCourseFeatures] = useState({});
  const [currentCourseIndex, setCurrentCourseIndex] = useState(0);
  const [isIndianUser, setIsIndianUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [ownedCourses, setOwnedCourses] = useState(new Set());
  const [isCheckingOwnership, setIsCheckingOwnership] = useState(false);

  // Get current course
  const currentCourse = useMemo(() => {
    if (!allCourses.length) return null;
    return allCourses[currentCourseIndex];
  }, [allCourses, currentCourseIndex]);

  // Get current course features
  const currentCourseFeatures = useMemo(() => {
    if (!currentCourse) return null;
    return courseFeatures[currentCourse.id] || null;
  }, [currentCourse, courseFeatures]);

  // Course data with features
  const courseData = useMemo(() => {
    if (!currentCourse) {
      return {
        title: "Zero To Hero Bootcamp",
        videoCount: "30+",
        projectCount: "10+",
        features: [
          "Go from Zero to Advanced",
          "Build Real-World Projects",
          "Learn Web Development with NextJS",
          "Learn How to Use AI in Your Projects",
          "Learn Data Structures and Algorithms",
          "Learn Job-Ready Skills & Interview Prep",
          "Get Lifetime Access to Updates",
          "Get a Certificate of Completion",
        ],
        description: "Want to find a job? Upskill? Or Build a startup?",
        pricing: {
          regular: isIndianUser ? "₹9,999" : "$499",
          discounted: isIndianUser ? "₹4,999" : "$249",
          percentage: "50%",
        },
      };
    }

    const features = currentCourseFeatures || {
      videoCount: "30+",
      projectCount: "10+",
      features: ["Go from Zero to Advanced", "Build Real-World Projects"],
      description: "Transform your career with this course",
    };

    return {
      title: currentCourse.title || "Zero To Hero Bootcamp",
      videoCount: features.videoCount,
      projectCount: features.projectCount,
      features: features.features,
      description: features.description,
      pricing: currentCourse.pricing || {
        regular: isIndianUser ? "₹9,999" : "$499",
        discounted: isIndianUser ? "₹4,999" : "$249",
        percentage: "50%",
      },
    };
  }, [currentCourse, currentCourseFeatures, isIndianUser]);

  useEffect(() => {
    const initializePricing = async () => {
      try {
        // Detect user location using centralized service
        try {
          const isIndia = await locationService.detectUserLocation();
          setIsIndianUser(isIndia);
        } catch (error) {
          console.error("Error detecting location:", error);
          setIsIndianUser(true); // Fallback to Indian pricing
        }

        // Fetch highlighted courses
        try {
          const courses = await courseService.getHighlightedCourses();
          const coursesWithPricing = await Promise.all(
            courses.slice(0, 5).map(async (course) => {
              // Limit to 5 courses
              const courseWithPricing =
                await courseService.getCourseWithPricing(
                  course.id,
                  isIndianUser
                );
              return courseWithPricing;
            })
          );

          if (coursesWithPricing.length > 0) {
            // If user is signed in, check course ownership first to filter owned courses
            let filteredCourses = coursesWithPricing;
            let ownedCoursesSet = new Set();

            if (user) {
              try {
                const ownershipPromises = coursesWithPricing.map((course) =>
                  courseService.verifyUserCourseAccess(user.id, course.id)
                );
                const ownershipResults = await Promise.all(ownershipPromises);

                coursesWithPricing.forEach((course, index) => {
                  if (ownershipResults[index]) {
                    ownedCoursesSet.add(course.id);
                  }
                });

                // Move owned courses to the bottom of the list
                const unownedCourses = coursesWithPricing.filter(
                  (course) => !ownedCoursesSet.has(course.id)
                );
                const ownedCourses = coursesWithPricing.filter((course) =>
                  ownedCoursesSet.has(course.id)
                );
                filteredCourses = [...unownedCourses, ...ownedCourses];

                setOwnedCourses(ownedCoursesSet);
              } catch (error) {
                console.warn("Error checking course ownership:", error);
                // Continue without ownership information
                setOwnedCourses(new Set());
              }
            } else {
              // Clear ownership for non-authenticated users
              setOwnedCourses(new Set());
            }

            // Set courses for slideshow (unowned first, owned at bottom)
            setAllCourses(filteredCourses);

            // Fetch features for the filtered courses
            if (filteredCourses.length > 0) {
              const featuresPromises = filteredCourses.map((course) =>
                courseService.getCourseFeatures(course.id)
              );
              const featuresResults = await Promise.all(featuresPromises);

              const featuresMap = {};
              filteredCourses.forEach((course, index) => {
                featuresMap[course.id] = featuresResults[index];
              });
              setCourseFeatures(featuresMap);
            } else {
              // No courses to show in slideshow - user owns all highlighted courses
              setCourseFeatures({});
            }
          } else {
            // Fallback to featured course
            const fallbackCourse = await courseService.getCourseWithPricing(
              config.featuredCourseId,
              isIndianUser
            );
            setAllCourses([fallbackCourse]);
          }
        } catch (error) {
          console.error("Error fetching courses:", error);
          // Set empty state for fallback
          setAllCourses([]);
        }
      } catch (error) {
        console.error("Error initializing pricing:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializePricing();
  }, [isIndianUser, user]);

  // Reset current course index when courses change
  useEffect(() => {
    if (allCourses.length > 0 && currentCourseIndex >= allCourses.length) {
      setCurrentCourseIndex(0);
    }
  }, [allCourses.length, currentCourseIndex]);

  // Auto-rotation timer
  useEffect(() => {
    if (allCourses.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentCourseIndex((prev) => (prev + 1) % allCourses.length);
    }, 6000); // Change every 6 seconds

    return () => clearInterval(interval);
  }, [allCourses.length]);

  // Check for pending enrollment to avoid payment conflicts
  useEffect(() => {
    const pendingEnrollment = sessionStorage.getItem("pendingCourseEnrollment");
    if (pendingEnrollment && user) {
      // Clear any pending enrollment since user is now signed in
      console.log("Clearing pending enrollment - user is signed in");
      sessionStorage.removeItem("pendingCourseEnrollment");
    }
  }, [user]);

  // Handle manual course navigation
  const goToCourse = (index) => {
    setCurrentCourseIndex(index);
  };

  const handleButtonClick = async () => {
    if (!user) {
      if (!currentCourse) return;
      
      // Store the selected course for after sign-in
      console.log("Storing course for post-signin enrollment:", currentCourse.id);
      sessionStorage.setItem("pendingCourseEnrollment", JSON.stringify({
        courseId: currentCourse.id,
        courseTitle: currentCourse.title,
        timestamp: Date.now()
      }));
      
      console.log(
        "Pricing button clicked, dispatching open-signin-modal event"
      );
      window.dispatchEvent(
        new CustomEvent("open-signin-modal", {
          detail: { startWithSignUp: true },
        })
      );
      return;
    }

    if (!currentCourse) return;

    setIsCheckingOwnership(true);

    try {
      // Check if user owns this course
      const hasAccess = await courseService.verifyUserCourseAccess(
        user.id,
        currentCourse.id
      );

      if (hasAccess) {
        // User owns the course, redirect to it
        router.push(`/my-courses/${currentCourse.id}`);
      } else {
        // User doesn't own the course, redirect to centralized enrollment process
        router.push(`/process-enrollment?courseId=${currentCourse.id}`);
      }
    } catch (error) {
      console.error("Error checking course access:", error);
    } finally {
      setIsCheckingOwnership(false);
    }
  };


  const getButtonText = () => {
    if (!user) return "Enroll Now";
    if (isCheckingOwnership) return "Checking...";
    if (currentCourse && ownedCourses.has(currentCourse.id))
      return "Go To Course";
    return "Enroll Now";
  };

  const getButtonStyles = () => {
    if (currentCourse && ownedCourses.has(currentCourse.id)) {
      // Owned course - different styling
      return "w-full inline-flex items-center justify-center bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-4 rounded-lg text-lg transition-all duration-200 mb-6 shadow-md hover:shadow-lg hover:shadow-emerald-500/30 relative overflow-hidden group";
    }
    // Purchasable course - original styling
    return "w-full inline-flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white font-bold py-4 rounded-lg text-lg transition-all duration-200 mb-6 shadow-md hover:shadow-lg hover:shadow-emerald-500/30 relative overflow-hidden group";
  };

  return (
    <section
      className="bg-neutral-800 text-white flex flex-col justify-center items-center"
      id="pricing"
    >
      <div className="max-w-7xl mx-auto px-8 py-8 md:py-16 text-center">
        <span className="leading-loose text-5xl"> 💰 💰 💰 </span>
        <h2 className="max-w-5xl mx-auto font-bold text-4xl md:text-4xl tracking-tight leading-normal">
          Don&apos;t Miss The Next Big Opportunity...
        </h2>

        <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-teal-400 to-green-400 max-w-4xl mx-auto font-extrabold text-4xl md:text-7xl tracking-tighter leading-normal mt-8 mb-6 md:mb-16">
          Join Now.
        </h2>

        <div className="flex flex-col lg:flex-row justify-center items-start gap-12 lg:gap-20">
          {/* Pricing Card */}
          <div className="w-full max-w-md lg:max-w-lg relative flex-shrink-0">
            {/* Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-white font-bold py-1 px-6 rounded-full text-sm z-10">
              {currentCourse && ownedCourses.has(currentCourse.id)
                ? "✓ OWNED"
                : "LIMITED TIME OFFER"}
            </div>

            {/* Card with hover effect - Fixed height for consistency */}
            <div className="relative bg-gradient-to-b from-neutral-800 to-neutral-900 border-2 border-emerald-400/30 rounded-xl p-8 md:p-10 flex flex-col justify-between transition-transform duration-300 overflow-hidden h-[550px]">
              {/* Shine effect - explicitly using ::after pseudo-element - MOVED UP AND ADDED pointer-events-none */}
              <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                <div className="absolute inset-0 hidden h-full w-full hover:inline-block pointer-events-none">
                  <div className="absolute inset-0 -translate-x-full animate-[shine_1s_ease-in-out] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"></div>
                </div>
              </div>

              {/* Card content - Top section */}
              <div className="flex-1">
                {isLoading ? (
                  <div className="h-32 flex items-center justify-center">
                    <div className="animate-pulse bg-neutral-700 h-10 w-48 rounded"></div>
                  </div>
                ) : (
                  <>
                    {/* Title with fixed height */}
                    <div className="h-20 flex items-center justify-center mb-6 mt-4">
                      <h3 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-l from-emerald-300 to-teal-400 transition-all duration-500 text-center">
                        <div
                          className="line-clamp-2"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {courseData.title}
                        </div>
                      </h3>
                    </div>

                    {/* Price content with fixed height */}
                    <div className="h-24 flex items-center justify-center mb-8 transition-all duration-500">
                      <div className="flex flex-col items-center">
                        <div className="flex items-baseline mb-1">
                          <span className="text-5xl font-extrabold text-white">
                            {courseData.pricing.discounted}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-2xl text-white/50 line-through">
                            {courseData.pricing.regular}
                          </span>
                          <span className="bg-emerald-400/20 text-emerald-400 text-sm font-medium px-2 py-0.5 rounded">
                            {courseData.pricing.percentage} OFF
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Card content - Bottom section */}
              <div className="flex-shrink-0">
                {/* Enhanced button with better styling */}
                <button
                  onClick={handleButtonClick}
                  disabled={isCheckingOwnership}
                  className={getButtonStyles()}
                >
                  <span className="relative">
                    {currentCourse && ownedCourses.has(currentCourse.id) && (
                      <span className="mr-2">✓</span>
                    )}
                    {getButtonText()}
                  </span>
                </button>

                {/* Course stats with fixed height */}
                {!isLoading && (
                  <div className="h-20 flex justify-center space-x-8 border-t border-neutral-700 pt-4">
                    <div className="text-center w-20">
                      <div className="flex items-center justify-center h-10">
                        <span className="text-3xl font-bold bg-gradient-to-r from-green-300 to-cyan-400 bg-clip-text text-transparent">
                          {courseData.videoCount}
                        </span>
                      </div>
                      <div className="text-xs text-white/70 mt-1">Videos</div>
                    </div>
                    <div className="text-center w-20">
                      <div className="flex items-center justify-center h-10">
                        <span className="text-3xl font-bold bg-gradient-to-r from-green-300 to-cyan-400 bg-clip-text text-transparent">
                          {courseData.projectCount}
                        </span>
                      </div>
                      <div className="text-xs text-white/70 mt-1">Projects</div>
                    </div>
                    <div className="text-center w-20">
                      <div className="flex items-center justify-center h-10">
                        <span className="text-5xl font-bold bg-gradient-to-l from-green-300 to-cyan-400 bg-clip-text text-transparent">
                          ∞
                        </span>
                      </div>
                      <div className="text-xs text-white/70 mt-1">
                        Opportunities
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Course indicators */}
            {allCourses.length > 1 && (
              <div className="flex justify-center mt-6 space-x-2">
                {allCourses.map((course, index) => {
                  const isOwned = ownedCourses.has(course.id);
                  const isActive = index === currentCourseIndex;

                  return (
                    <button
                      key={index}
                      onClick={() => goToCourse(index)}
                      className={`relative w-3 h-3 rounded-full transition-all duration-300 ${
                        isActive
                          ? "bg-emerald-400 scale-110"
                          : isOwned
                          ? "bg-emerald-300/70 hover:bg-emerald-300"
                          : "bg-white/30 hover:bg-white/50"
                      }`}
                      title={isOwned ? `${course.title} (Owned)` : course.title}
                    >
                      {isOwned && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full border border-neutral-800"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Features List */}
          <div
            className="w-full max-w-md lg:max-w-lg text-left flex flex-col justify-between flex-shrink-0"
            style={{ minHeight: "550px" }}
          >
            <div>
              {/* Description with fixed height */}
              <div className="h-16 flex items-center justify-center lg:justify-start mb-6">
                <h3 className="text-2xl font-bold text-center lg:text-left transition-all duration-500">
                  {courseData?.description ||
                    "Want to find a job? Or Build a startup?"}
                </h3>
              </div>

              {/* Features list with fixed height */}
              <div className="min-h-[300px]">
                <ul className="space-y-4 transition-all duration-500">
                  {(courseData?.features || []).map((feature, index) => (
                    <Feature
                      key={`${currentCourseIndex}-${index}`}
                      text={feature}
                    />
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 p-4 bg-neutral-700/30 border border-neutral-600 rounded-lg">
              <p className="flex items-center text-white/80">
                <svg
                  className="w-5 h-5 mr-4 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Join thousands of developers who have transformed their careers
                building SaaS products.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shine {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(100%);
          }
        }

        .card::after {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          background: linear-gradient(
            to right,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transform: translateX(-100%);
          opacity: 0;
          transition: opacity 0.1s;
        }

        .card:hover::after {
          animation: shine 1s ease-in-out;
          opacity: 1;
        }
      `}</style>
    </section>
  );
};

export default Pricing;
