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

export const courseService = {
  async getUserCourses(userId) {
    try {
      if (!userId) {
        console.warn("No userId provided to getUserCourses");
        return [];
      }

      const userCoursesRef = collection(db, "user_courses");
      // Query documents with IDs that start with userId_
      const q = query(
        userCoursesRef,
        where("user_id", "==", userId)
      );

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
              courses: courseDoc.data()
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

      return {
        id: courseId,
        ...courseDoc.data(),
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
};
