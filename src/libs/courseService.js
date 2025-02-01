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
    const userCoursesRef = collection(db, "user_courses");
    const q = query(userCoursesRef, where("user_id", "==", userId));
    const snapshot = await getDocs(q);

    const courses = [];
    for (const doc of snapshot.docs) {
      const courseDoc = await getDoc(doc(db, "courses", doc.data().course_id));
      courses.push({
        ...doc.data(),
        courses: courseDoc.data(),
      });
    }
    return courses;
  },

  async getCourseDetails(courseId) {
    const courseDoc = await getDoc(doc(db, "courses", courseId));
    const videosRef = collection(db, "videos");
    const q = query(videosRef, where("course_id", "==", courseId));
    const videosSnapshot = await getDocs(q);

    return {
      ...courseDoc.data(),
      videos: videosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })),
    };
  },

  async getAllCourses(userId) {
    const coursesSnapshot = await getDocs(collection(db, "courses"));
    const userCoursesRef = collection(db, "user_courses");
    const q = query(userCoursesRef, where("user_id", "==", userId));
    const userCoursesSnapshot = await getDocs(q);

    const enrolledCourseIds = new Set(
      userCoursesSnapshot.docs.map((doc) => doc.data().course_id)
    );

    return coursesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      isEnrolled: enrolledCourseIds.has(doc.id),
    }));
  },

  async updateVideoProgress(userId, videoId, completed) {
    const progressRef = doc(db, "user_progress", `${userId}_${videoId}`);
    await setDoc(
      progressRef,
      {
        user_id: userId,
        video_id: videoId,
        completed,
        last_watched: new Date().toISOString(),
      },
      { merge: true }
    );
  },

  async updateLastAccessed(userId, courseId) {
    const courseRef = doc(db, "user_courses", `${userId}_${courseId}`);
    await setDoc(
      courseRef,
      {
        user_id: userId,
        course_id: courseId,
        last_accessed: new Date().toISOString(),
      },
      { merge: true }
    );
  },
};
