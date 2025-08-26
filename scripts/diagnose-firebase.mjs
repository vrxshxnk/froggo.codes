// Firebase diagnostic script to check current database state
// Run with: node scripts/diagnose-firebase.mjs

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";

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

async function diagnoseDatabaseState() {
  try {
    console.log("🔍 Diagnosing Firebase database state...\n");

    // 1. Check courses collection
    console.log("📚 Checking courses collection:");
    const coursesRef = collection(db, "courses");
    const coursesSnapshot = await getDocs(coursesRef);

    if (coursesSnapshot.empty) {
      console.log("❌ No courses found in database");
    } else {
      console.log(`✅ Found ${coursesSnapshot.size} courses:`);
      coursesSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        console.log(`  - ID: ${doc.id}`);
        console.log(`    Title: ${data.title || "No title"}`);
        console.log(`    Highlight: ${data.highlight || "Not set"}`);
        console.log(`    Price India: ${data.price_india || "Not set"}`);
        console.log(`    Price Int: ${data.price_int || "Not set"}`);
        console.log("");
      });
    }

    // 2. Check features collection
    console.log("🎯 Checking features collection:");
    const featuresRef = collection(db, "features");
    const featuresSnapshot = await getDocs(featuresRef);

    if (featuresSnapshot.empty) {
      console.log("❌ No features found in database");
    } else {
      console.log(`✅ Found ${featuresSnapshot.size} feature documents:`);
      featuresSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        console.log(`  - Course ID: ${doc.id}`);
        console.log(`    Video Count: ${data.videoCount || "Not set"}`);
        console.log(`    Project Count: ${data.projectCount || "Not set"}`);
        console.log(
          `    Features: ${
            data.features ? data.features.length + " items" : "Not set"
          }`
        );
        console.log("");
      });
    }

    // 3. Test specific course IDs we want to use
    console.log("🎯 Testing specific course IDs:");
    const testCourseIds = ["zero-to-hero", "ai-saas"];

    for (const courseId of testCourseIds) {
      const courseDoc = await getDoc(doc(db, "courses", courseId));
      if (courseDoc.exists()) {
        console.log(`✅ Course '${courseId}' exists`);
      } else {
        console.log(`❌ Course '${courseId}' does not exist`);
      }
    }

    console.log("\n📋 Summary:");
    console.log(
      "- If courses exist, we can proceed with adding highlight field"
    );
    console.log("- If courses don't exist, we need to create them first");
    console.log("- Features collection can be created independently");
  } catch (error) {
    console.error("❌ Error diagnosing database:", error);
    console.log("\n💡 This might indicate:");
    console.log("- Firebase configuration issues");
    console.log("- Network connectivity problems");
    console.log("- Permission issues");
  }
}

// Run the diagnosis
diagnoseDatabaseState();
