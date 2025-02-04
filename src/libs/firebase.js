import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCWHHFhAmOpEKhCkAxm4BjV71viTWY0Mo8",
  authDomain: "froggocodes-ab4ff.firebaseapp.com",
  projectId: "froggocodes-ab4ff",
  storageBucket: "froggocodes-ab4ff.firebasestorage.app",
  messagingSenderId: "899731480476",
  appId: "1:899731480476:web:2ac6b9737b2a24e64db259",
  measurementId: "G-ZWKKQRWEGS",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services with specific region and settings
export const db = getFirestore(app);
export const auth = getAuth(app);

// Initialize Analytics
let analytics = null;
if (typeof window !== "undefined") {
  const { getAnalytics } = require("firebase/analytics");
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn("Analytics failed to initialize:", error);
    analytics = null;
  }
}

// export { analytics };
