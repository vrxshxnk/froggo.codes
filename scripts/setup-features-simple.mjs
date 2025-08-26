// Simplified Firebase setup script - step by step approach
// Run with: node scripts/setup-features-simple.mjs

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
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

// Simple test data
const testFeature = {
  videoCount: "30",
  projectCount: "10",
  description: "Test course description",
};

async function testFirebaseConnection() {
  console.log("🔍 Testing Firebase connection...");

  try {
    // First, try to read existing courses
    console.log("📚 Testing read access to courses...");
    const coursesRef = collection(db, "courses");
    const snapshot = await getDocs(coursesRef);
    console.log(
      `✅ Successfully read courses collection (${snapshot.size} documents)`
    );

    return true;
  } catch (error) {
    console.error("❌ Firebase connection failed:", error.message);
    return false;
  }
}

async function addSingleFeature() {
  console.log("📝 Testing single feature creation...");

  try {
    // Try to add a simple test feature
    await setDoc(doc(db, "features", "test-course"), testFeature);
    console.log("✅ Successfully created test feature document");
    return true;
  } catch (error) {
    console.error("❌ Failed to create feature document:", error.message);
    return false;
  }
}

async function addHighlightField() {
  console.log("🎯 Testing highlight field addition...");

  try {
    // Try to update a course with highlight field
    await updateDoc(doc(db, "courses", "test-course"), {
      highlight: true,
    });
    console.log("✅ Successfully added highlight field");
    return true;
  } catch (error) {
    console.error("❌ Failed to add highlight field:", error.message);
    console.log("   This might be because the course doesn't exist");
    return false;
  }
}

async function runDiagnostics() {
  console.log("🚀 Running Firebase diagnostics...\n");

  // Step 1: Test connection
  const connectionOk = await testFirebaseConnection();
  if (!connectionOk) {
    console.log("\n💡 Connection failed. Please check:");
    console.log("- Internet connection");
    console.log("- Firebase project settings");
    console.log("- Environment variables in .env.local");
    return;
  }

  // Step 2: Test feature creation
  console.log("");
  const featureOk = await addSingleFeature();
  if (!featureOk) {
    console.log("\n💡 Feature creation failed. This might be due to:");
    console.log("- Firestore rules requiring authentication");
    console.log("- Invalid data structure");
    console.log("- Insufficient permissions");
  }

  // Step 3: Test highlight field
  console.log("");
  const highlightOk = await addHighlightField();
  if (!highlightOk) {
    console.log(
      "\n💡 Highlight field addition failed. This is expected if the course doesn't exist."
    );
  }

  console.log("\n📋 Summary:");
  console.log(`Connection: ${connectionOk ? "✅" : "❌"}`);
  console.log(`Feature Creation: ${featureOk ? "✅" : "❌"}`);
  console.log(`Highlight Field: ${highlightOk ? "✅" : "❌"}`);

  if (connectionOk && !featureOk) {
    console.log("\n🔧 Recommended next steps:");
    console.log("1. Use Firebase Console to manually add the data");
    console.log("2. Check Firestore rules for write permissions");
    console.log("3. Verify the data structure is correct");
  }

  if (connectionOk && featureOk) {
    console.log(
      "\n🎉 Firebase setup is working! You can now run the full setup script."
    );
  }
}

// Run diagnostics
runDiagnostics();
