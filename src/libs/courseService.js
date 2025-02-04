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

  async getCourseProgress(userId, courseId) {
    const progressRef = collection(db, "user_progress");
    const q = query(
      progressRef,
      where("user_id", "==", userId),
      where("course_id", "==", courseId)
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      video_id: doc.data().video_id,
      completed: doc.data().completed,
      last_watched: doc.data().last_watched
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

  async getAllCourses() {
    const coursesRef = collection(db, "courses");
    const snapshot = await getDocs(coursesRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
};
