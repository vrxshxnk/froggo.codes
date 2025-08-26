// src/libs/courseService.js
import { db } from "./firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";

// Pricing utility functions
const pricingUtils = {
  /**
   * Format price with currency symbol
   * @param {number} amount - Price amount
   * @param {boolean} isIndian - Whether to use Indian currency
   * @returns {string} Formatted price string
   */
  formatPrice(amount, isIndian = false) {
    const currency = isIndian ? "₹" : "$";
    return `${currency}${Math.floor(amount).toLocaleString()}`;
  },

  /**
   * Calculate discounted price
   * @param {number} basePrice - Original price
   * @param {number} discountPercentage - Discount percentage (e.g., 50 for 50%)
   * @returns {number} Discounted price (floored to nearest integer)
   */
  calculateDiscountedPrice(basePrice, discountPercentage) {
    if (!discountPercentage || discountPercentage <= 0) return basePrice;
    const discountAmount = (basePrice * discountPercentage) / 100;
    return Math.floor(basePrice - discountAmount);
  },

  /**
   * Get pricing data for a course
   * @param {Object} courseData - Course data from Firebase
   * @param {boolean} isIndian - Whether user is in India
   * @returns {Object} Pricing details with formatted strings and raw amounts
   */
  getPricingData(courseData, isIndian = false) {
    // Default fallback prices
    const defaultPrices = {
      india: 9999,
      international: 499,
      discount: 50,
    };

    // Extract pricing from course data or use defaults
    const basePrice = isIndian
      ? courseData?.price_india || defaultPrices.india
      : courseData?.price_int || defaultPrices.international;

    const discount = courseData?.discount || defaultPrices.discount;
    const discountedPrice = this.calculateDiscountedPrice(basePrice, discount);

    return {
      regular: this.formatPrice(basePrice, isIndian),
      discounted: this.formatPrice(discountedPrice, isIndian),
      percentage: `${discount}%`,
      currency: isIndian ? "₹" : "$",
      // Raw amounts for payment processing
      regularAmount: Math.floor(basePrice),
      discountedAmount: Math.floor(discountedPrice),
      discountPercentage: discount,
    };
  },
};

export const courseService = {
  async getUserCourses(userId) {
    try {
      if (!userId) {
        console.warn("No userId provided to getUserCourses");
        return [];
      }

      const userCoursesRef = collection(db, "user_courses");
      // Query documents with IDs that start with userId_
      const q = query(userCoursesRef, where("user_id", "==", userId));

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.log("No enrolled courses found for user");
        return [];
      }

      const courses = [];
      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        if (!data || !data.course_id) {
          console.warn("Invalid course data found:", data);
          continue;
        }

        try {
          const courseRef = doc(db, "courses", data.course_id);
          const courseDoc = await getDoc(courseRef);

          if (courseDoc.exists()) {
            courses.push({
              ...data,
              course_id: data.course_id,
              courses: courseDoc.data(),
            });
          }
        } catch (courseError) {
          console.error("Error fetching course:", courseError);
          continue;
        }
      }
      return courses;
    } catch (error) {
      console.error("getUserCourses error:", error);
      return []; // Return empty array instead of throwing
    }
  },
  async getAllCourses() {
    try {
      const coursesRef = collection(db, "courses");
      const snapshot = await getDocs(coursesRef);

      if (snapshot.empty) {
        console.warn("No courses found in database");
        return [];
      }

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error in getAllCourses:", error);
      throw error;
    }
  },

  async getHighlightedCourses() {
    try {
      const coursesRef = collection(db, "courses");
      const q = query(coursesRef, where("highlight", "==", true));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.warn(
          "No highlighted courses found, falling back to all courses"
        );
        // Fallback to all courses if no highlighted courses exist
        return await this.getAllCourses();
      }

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error in getHighlightedCourses:", error);
      // Fallback to all courses on error
      return await this.getAllCourses();
    }
  },

  async getCourseFeatures(courseId) {
    try {
      const featureDoc = await getDoc(doc(db, "features", courseId));

      if (featureDoc.exists()) {
        return featureDoc.data();
      } else {
        console.warn(
          `No features found for course ${courseId}, using defaults`
        );
        // Return default features for backward compatibility
        return this.getDefaultFeatures(courseId);
      }
    } catch (error) {
      console.error(`Error fetching features for course ${courseId}:`, error);
      // Return default features on error
      return this.getDefaultFeatures(courseId);
    }
  },

  getDefaultFeatures(courseId) {
    // Default features for backward compatibility
    const defaultFeatures = {
      "zero-to-hero": {
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
        description: "Want to find a job? Or Build a startup?",
      },
      "ai-saas": {
        videoCount: "25+",
        projectCount: "5+",
        features: [
          "Build Complete AI SaaS Applications",
          "Learn OpenAI API Integration",
          "Master Vector Databases & Embeddings",
          "Implement AI Chat & Completion Features",
          "Learn Subscription & Payment Systems",
          "Deploy AI Apps to Production",
          "Get Lifetime Access to Updates",
          "Get a Certificate of Completion",
        ],
        description: "Ready to build the next big AI startup?",
      },
    };

    return defaultFeatures[courseId] || defaultFeatures["zero-to-hero"];
  },
  async getCourseProgress(userId, courseId) {
    try {
      // First get all videos for this course
      const videosRef = collection(db, "videos");
      const videosQuery = query(videosRef, where("course_id", "==", courseId));
      const videosSnapshot = await getDocs(videosQuery);
      const totalVideos = videosSnapshot.docs.length;

      // Then get the progress
      const progressRef = collection(db, "user_progress");
      const q = query(
        progressRef,
        where("user_id", "==", userId),
        where("course_id", "==", courseId)
      );
      const snapshot = await getDocs(q);

      const completedVideos = snapshot.docs.filter(
        (doc) => doc.data().completed
      ).length;
      const progressPercentage =
        totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

      return {
        completedCount: completedVideos,
        totalCount: totalVideos,
        percentage: progressPercentage,
        videos: snapshot.docs.map((doc) => ({
          video_id: doc.data().video_id,
          completed: doc.data().completed || false,
          last_watched: doc.data().last_watched,
        })),
      };
    } catch (error) {
      console.error("Error getting course progress:", error);
      return {
        completedCount: 0,
        totalCount: 0,
        percentage: 0,
        videos: [],
      };
    }
  },

  async updateLastAccessed(userId, courseId, courseData) {
    try {
      const courseRef = doc(db, "user_courses", `${userId}_${courseId}`);
      await setDoc(courseRef, courseData, { merge: true });
    } catch (error) {
      console.error("Error updating last accessed:", error);
      throw error;
    }
  },
  async getCourseDetails(courseId) {
    try {
      const courseDoc = await getDoc(doc(db, "courses", courseId));
      const videosRef = collection(db, "videos");
      const q = query(videosRef, where("course_id", "==", courseId));
      const videosSnapshot = await getDocs(q);

      if (!courseDoc.exists()) {
        throw new Error("Course not found");
      }

      const courseData = courseDoc.data();

      return {
        id: courseId,
        ...courseData,
        videos: videosSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })),
      };
    } catch (error) {
      console.error("Error fetching course details:", error);
      throw error;
    }
  },

  async updateVideoProgress(userId, videoId, courseId, completed) {
    try {
      const progressRef = doc(db, "user_progress", `${userId}_${videoId}`);
      await setDoc(
        progressRef,
        {
          user_id: userId,
          video_id: videoId,
          course_id: courseId,
          completed,
          last_watched: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error updating video progress:", error);
      throw error;
    }
  },

  /**
   * Verify if user has purchased/enrolled in a course
   * @param {string} userId - User ID
   * @param {string} courseId - Course ID
   * @returns {Promise<boolean>} Whether user has access to the course
   */
  async verifyUserCourseAccess(userId, courseId) {
    try {
      if (!userId || !courseId) {
        console.warn("Missing userId or courseId for access verification");
        return false;
      }

      // Check if user has enrolled in the course
      const userCourseRef = doc(db, "user_courses", `${userId}_${courseId}`);
      const userCourseDoc = await getDoc(userCourseRef);

      if (!userCourseDoc.exists()) {
        console.log("User has not enrolled in this course");
        return false;
      }

      // Optionally, also verify payment status
      const paymentRef = doc(db, "payments", `${userId}_${courseId}`);
      const paymentDoc = await getDoc(paymentRef);

      if (!paymentDoc.exists()) {
        console.log("No payment record found for this course");
        return false;
      }

      const paymentData = paymentDoc.data();
      if (paymentData.status !== "completed") {
        console.log("Payment not completed for this course");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error verifying course access:", error);
      return false;
    }
  },

  /**
   * Get course with pricing data for pricing component
   * @param {string} courseId - Course ID to fetch
   * @param {boolean} isIndian - Whether user is in India
   * @returns {Promise<Object>} Course data with pricing information
   */
  async getCourseWithPricing(courseId, isIndian = false) {
    try {
      const courseDoc = await getDoc(doc(db, "courses", courseId));

      if (!courseDoc.exists()) {
        console.warn(`Course ${courseId} not found, using fallback pricing`);
        // Return fallback data if course not found
        return {
          id: courseId,
          title: "Zero To Hero Bootcamp",
          pricing: pricingUtils.getPricingData(null, isIndian),
        };
      }

      const courseData = courseDoc.data();

      return {
        id: courseId,
        ...courseData,
        pricing: pricingUtils.getPricingData(courseData, isIndian),
      };
    } catch (error) {
      console.error("Error fetching course with pricing:", error);
      // Return fallback data on error
      return {
        id: courseId,
        title: "Zero To Hero Bootcamp",
        pricing: pricingUtils.getPricingData(null, isIndian),
      };
    }
  },

  /**
   * Get payment amount for a course
   * @param {string} courseId - Course ID
   * @param {boolean} isIndian - Whether user is in India
   * @returns {Promise<number>} Payment amount (discounted price)
   */
  async getCoursePaymentAmount(courseId, isIndian = false) {
    try {
      const courseWithPricing = await this.getCourseWithPricing(
        courseId,
        isIndian
      );
      return courseWithPricing.pricing.discountedAmount;
    } catch (error) {
      console.error("Error getting course payment amount:", error);
      // Return fallback amount
      return isIndian ? 4999 : 249;
    }
  },
};
