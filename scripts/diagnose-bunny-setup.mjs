#!/usr/bin/env node

/**
 * Bunny.net Setup Diagnostic Script
 *
 * This script helps diagnose your Bunny.net setup and creates test data if needed.
 *
 * Usage: node scripts/diagnose-bunny-setup.mjs
 */

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  query,
  where,
} from "firebase/firestore";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Check environment variables
 */
function checkEnvironment() {
  console.log("🔍 Checking Environment Variables...");
  console.log("==========================================");

  const bunnyLibraryId = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID;
  const bunnyApiKey = process.env.BUNNY_API_KEY;

  console.log(
    `✅ NEXT_PUBLIC_BUNNY_LIBRARY_ID: ${
      bunnyLibraryId ? "✓ Set" : "❌ Missing"
    }`
  );
  console.log(`✅ BUNNY_API_KEY: ${bunnyApiKey ? "✓ Set" : "❌ Missing"}`);

  if (bunnyLibraryId) {
    console.log(`📋 Library ID: ${bunnyLibraryId}`);
  }

  console.log("");
  return { bunnyLibraryId, bunnyApiKey };
}

/**
 * Check Firebase collections
 */
async function checkFirebaseData() {
  console.log("🔍 Checking Firebase Data...");
  console.log("==========================================");

  try {
    // Check courses
    const coursesRef = collection(db, "courses");
    const coursesSnapshot = await getDocs(coursesRef);
    console.log(`📚 Courses found: ${coursesSnapshot.size}`);

    let zeroToHeroCourse = null;
    coursesSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`  - ${doc.id}: ${data.title || "No title"}`);
      if (doc.id === "zero-to-hero") {
        zeroToHeroCourse = { id: doc.id, ...data };
      }
    });

    // Check videos for zero-to-hero course
    const videosRef = collection(db, "videos");
    const videosQuery = query(
      videosRef,
      where("course_id", "==", "zero-to-hero")
    );
    const videosSnapshot = await getDocs(videosQuery);
    console.log(`🎬 Videos for 'zero-to-hero' course: ${videosSnapshot.size}`);

    videosSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(
        `  - ${doc.id}: ${data.title || "No title"} (bunny_video_id: ${
          data.bunny_video_id || "Not set"
        })`
      );
    });

    console.log("");
    return { zeroToHeroCourse, videoCount: videosSnapshot.size };
  } catch (error) {
    console.error("❌ Error checking Firebase data:", error.message);
    return { zeroToHeroCourse: null, videoCount: 0 };
  }
}

/**
 * Create test data if missing
 */
async function createTestData() {
  console.log("🛠️  Creating Test Data...");
  console.log("==========================================");

  try {
    // Create zero-to-hero course if it doesn't exist
    const courseRef = doc(db, "courses", "zero-to-hero");
    await setDoc(
      courseRef,
      {
        title: "Zero To Hero Bootcamp",
        description: "Complete coding bootcamp from zero to hero",
        price_india: 9999,
        price_int: 499,
        discount: 50,
        highlight: true,
        created_at: new Date().toISOString(),
      },
      { merge: true }
    );
    console.log("✅ Created/Updated zero-to-hero course");

    // Create test video
    const videoRef = doc(db, "videos", "zth-intro");
    await setDoc(
      videoRef,
      {
        title: "Introduction to Programming",
        description:
          "Learn the basics of programming and get started with your coding journey",
        duration: "15:30",
        course_id: "zero-to-hero",
        order: 1,
        bunny_video_id: "zero-to-hero/Video1",
        created_at: new Date().toISOString(),
      },
      { merge: true }
    );
    console.log("✅ Created/Updated test video: Introduction to Programming");

    // Create a second test video
    const video2Ref = doc(db, "videos", "zth-variables");
    await setDoc(
      video2Ref,
      {
        title: "Variables and Data Types",
        description:
          "Understanding variables and different data types in programming",
        duration: "12:45",
        course_id: "zero-to-hero",
        order: 2,
        bunny_video_id: "zero-to-hero/Video2",
        created_at: new Date().toISOString(),
      },
      { merge: true }
    );
    console.log("✅ Created/Updated test video: Variables and Data Types");

    console.log("");
  } catch (error) {
    console.error("❌ Error creating test data:", error.message);
  }
}

/**
 * Test Bunny.net URL generation
 */
function testBunnyUrls(libraryId) {
  console.log("🔗 Testing Bunny.net URL Generation...");
  console.log("==========================================");

  if (!libraryId) {
    console.log("❌ Cannot test URLs - Library ID not set");
    return;
  }

  const testUrls = [
    `https://iframe.mediadelivery.net/embed/${libraryId}/zero-to-hero/Video1`,
    `https://iframe.mediadelivery.net/embed/${libraryId}/zero-to-hero/Video2`,
  ];

  console.log("📋 Generated URLs:");
  testUrls.forEach((url, index) => {
    console.log(`  ${index + 1}. ${url}`);
  });

  console.log("\n💡 To test these URLs:");
  console.log("1. Open the URLs in your browser");
  console.log("2. You should see the Bunny.net video player");
  console.log(
    "3. If you get a 404, check that the videos exist in your Bunny.net library"
  );
  console.log("");
}

/**
 * Provide troubleshooting steps
 */
function provideTroubleshooting() {
  console.log("🔧 Troubleshooting Steps...");
  console.log("==========================================");
  console.log("If videos still don't appear:");
  console.log("");
  console.log("1. 📁 Check Bunny.net Library Structure:");
  console.log("   - Login to https://dash.bunny.net/");
  console.log("   - Go to Stream → Libraries → Your Library");
  console.log('   - Ensure you have a collection named "zero-to-hero"');
  console.log(
    '   - Ensure videos are named "Video1", "Video2", etc. inside the collection'
  );
  console.log("");
  console.log("2. 🔐 Check Domain Permissions:");
  console.log("   - In Bunny.net library settings");
  console.log('   - Add "localhost" and "froggo.codes" to allowed domains');
  console.log("");
  console.log("3. 🌐 Test Direct URL:");
  console.log("   - Try opening the generated URLs above in your browser");
  console.log("   - If they don't work, the issue is with Bunny.net setup");
  console.log("");
  console.log("4. 🔍 Check Browser Console:");
  console.log("   - Open browser dev tools (F12)");
  console.log("   - Look for any error messages when trying to play videos");
  console.log("");
  console.log("5. 🎯 Verify Course Access:");
  console.log("   - Make sure you're logged in");
  console.log("   - Ensure you have access to the zero-to-hero course");
  console.log("   - Check that user_courses collection has your enrollment");
}

/**
 * Main diagnostic function
 */
async function main() {
  console.log("🚀 Bunny.net Setup Diagnostic");
  console.log("==========================================\n");

  try {
    // Step 1: Check environment
    const { bunnyLibraryId } = checkEnvironment();

    // Step 2: Check Firebase data
    const { videoCount } = await checkFirebaseData();

    // Step 3: Create test data if needed
    if (videoCount === 0) {
      console.log(
        "📝 No videos found for zero-to-hero course. Creating test data...\n"
      );
      await createTestData();
    }

    // Step 4: Test URL generation
    testBunnyUrls(bunnyLibraryId);

    // Step 5: Provide troubleshooting
    provideTroubleshooting();

    console.log("🎉 Diagnostic Complete!");
    console.log("==========================================");
    console.log("Next steps:");
    console.log("1. Start your dev server: npm run dev");
    console.log(
      "2. Navigate to: http://localhost:3000/my-courses/zero-to-hero"
    );
    console.log('3. Try clicking "Watch" on a video');
  } catch (error) {
    console.error("❌ Diagnostic failed:", error);
    process.exit(1);
  }
}

// Run diagnostic
main();
