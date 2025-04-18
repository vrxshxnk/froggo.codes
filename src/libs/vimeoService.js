import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

export const vimeoService = {
  // Check if user has paid for the course
  async verifyPurchase(userId, courseId) {
    try {
      // Check user_courses collection which is updated after successful payment
      const userCourseRef = doc(db, "user_courses", `${userId}_${courseId}`);
      const userCourseDoc = await getDoc(userCourseRef);

      if (!userCourseDoc.exists()) {
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error verifying purchase:", error);
      return false;
    }
  },

  // Generate a secure token for Vimeo private video access
  async generateVideoToken(userId, videoId, courseId) {
    try {
      // Verify the user has purchased this course
      const hasPurchased = await this.verifyPurchase(userId, courseId);

      if (!hasPurchased) {
        throw new Error("User has not purchased this course");
      }

      // Make API call to backend to get a time-limited token for this video
      const response = await fetch("/api/vimeo-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          videoId,
          courseId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate video token");
      }

      const { token } = await response.json();
      return token;
    } catch (error) {
      console.error("Error generating video token:", error);
      throw error;
    }
  },
};
