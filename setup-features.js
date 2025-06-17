// Firebase setup script to add features collection and highlight field
// Run this once to set up your Firebase data structure

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
} from "firebase/firestore";

// Your Firebase config (replace with your actual config)
const firebaseConfig = {
  // You'll need to replace this with your actual Firebase config
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Features data for each course
const featuresData = {
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
    description: "Want to find a job? Upskill? Or Build a startup?",
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

// Courses to highlight in the slideshow
const coursesToHighlight = [
  "zero-to-hero",
  "ai-saas",
  // Add more course IDs as needed
];

async function setupFirebaseData() {
  try {
    console.log("🚀 Setting up Firebase data...");

    // 1. Create features collection
    console.log("📝 Adding features collection...");
    for (const [courseId, features] of Object.entries(featuresData)) {
      await setDoc(doc(db, "features", courseId), features);
      console.log(`✅ Added features for ${courseId}`);
    }

    // 2. Add highlight field to courses
    console.log("🎯 Adding highlight field to courses...");
    for (const courseId of coursesToHighlight) {
      try {
        await updateDoc(doc(db, "courses", courseId), {
          highlight: true,
        });
        console.log(`✅ Added highlight: true to ${courseId}`);
      } catch (error) {
        console.warn(`⚠️ Could not update ${courseId}:`, error.message);
        console.log(`   Make sure the course document exists in Firebase`);
      }
    }

    console.log("🎉 Firebase setup complete!");
    console.log("\n📋 Next steps:");
    console.log("1. Verify the data in Firebase Console");
    console.log("2. Test the pricing slideshow");
    console.log("3. Add more courses to the highlight list as needed");
  } catch (error) {
    console.error("❌ Error setting up Firebase data:", error);
  }
}

// Run the setup
setupFirebaseData();
