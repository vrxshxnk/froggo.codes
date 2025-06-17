// Firebase setup script to add features collection and highlight field
// Run with: node scripts/setup-features.mjs

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, updateDoc } from "firebase/firestore";

// Use your existing Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
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

// Courses to highlight in the slideshow (update these IDs to match your actual course IDs)
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
        console.log(
          `   Make sure the course document exists in Firebase with this exact ID`
        );
      }
    }

    console.log("🎉 Firebase setup complete!");
    console.log("\n📋 What was created:");
    console.log('1. New "features" collection with course-specific data');
    console.log('2. Added "highlight: true" field to specified courses');
    console.log("\n🔍 Next steps:");
    console.log("1. Check Firebase Console to verify the data");
    console.log(
      "2. Update course IDs in the script if they don't match your actual IDs"
    );
    console.log("3. Test the pricing slideshow");
    console.log("4. Add more courses to the highlight list as needed");
  } catch (error) {
    console.error("❌ Error setting up Firebase data:", error);
    console.log("\n💡 Troubleshooting:");
    console.log(
      "- Make sure your .env.local file has the correct Firebase config"
    );
    console.log("- Verify your Firebase project has the correct permissions");
    console.log(
      "- Check that the course IDs in the script match your actual course documents"
    );
  }
}

// Run the setup
setupFirebaseData();
