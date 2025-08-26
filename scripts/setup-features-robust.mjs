// Robust Firebase setup script with better error handling
// Run with: node scripts/setup-features-robust.mjs

import dotenv from "dotenv";
import { initializeApp } from "firebase/app";

// Load environment variables
dotenv.config({ path: ".env.local" });
import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  getDoc,
  connectFirestoreEmulator,
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

// Sample course data (in case courses collection is empty)
const sampleCourses = {
  "zero-to-hero": {
    title: "Zero To Hero Bootcamp",
    highlight: true,
    price_india: 9999,
    price_int: 499,
    discount: 50,
    description:
      "Complete web development bootcamp from zero to advanced level",
    status: "active",
    created_at: new Date().toISOString(),
  },
  "ai-saas": {
    title: "AI SaaS Masterclass",
    highlight: true,
    price_india: 12999,
    price_int: 599,
    discount: 50,
    description: "Build and deploy complete AI SaaS applications",
    status: "active",
    created_at: new Date().toISOString(),
  },
};

async function checkEnvironmentVariables() {
  console.log("🔧 Checking environment variables...");

  const requiredVars = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  ];

  const missing = requiredVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    console.error("❌ Missing environment variables:", missing.join(", "));
    return false;
  }

  console.log("✅ Environment variables are set");
  return true;
}

async function testConnection() {
  console.log("🔍 Testing Firebase connection...");

  try {
    // Try a simple read operation
    const testDoc = doc(db, "test", "connection");
    await getDoc(testDoc);
    console.log("✅ Firebase connection successful");
    return true;
  } catch (error) {
    console.error("❌ Firebase connection failed:", error.code, error.message);
    return false;
  }
}

async function checkExistingData() {
  console.log("📊 Checking existing data...");

  try {
    // Check courses collection
    const coursesSnapshot = await getDocs(collection(db, "courses"));
    console.log(`📚 Found ${coursesSnapshot.size} courses`);

    // Check features collection
    const featuresSnapshot = await getDocs(collection(db, "features"));
    console.log(`🎯 Found ${featuresSnapshot.size} features`);

    // List existing courses
    if (coursesSnapshot.size > 0) {
      console.log("Existing courses:");
      coursesSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        console.log(
          `  - ${doc.id}: ${data.title || "No title"} (highlight: ${
            data.highlight || "not set"
          })`
        );
      });
    }

    return {
      coursesCount: coursesSnapshot.size,
      featuresCount: featuresSnapshot.size,
      courses: coursesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })),
    };
  } catch (error) {
    console.error("❌ Error checking existing data:", error.message);
    return { coursesCount: 0, featuresCount: 0, courses: [] };
  }
}

async function setupFeatures() {
  console.log("📝 Setting up features collection...");

  let successCount = 0;
  const errors = [];

  for (const [courseId, features] of Object.entries(featuresData)) {
    try {
      await setDoc(doc(db, "features", courseId), features);
      console.log(`✅ Added features for ${courseId}`);
      successCount++;
    } catch (error) {
      console.error(
        `❌ Failed to add features for ${courseId}:`,
        error.message
      );
      errors.push(`${courseId}: ${error.message}`);
    }
  }

  return { successCount, errors };
}

async function setupCourses(existingCourses) {
  console.log("📚 Setting up courses...");

  let successCount = 0;
  const errors = [];

  for (const [courseId, courseData] of Object.entries(sampleCourses)) {
    try {
      // Check if course already exists
      const existingCourse = existingCourses.find((c) => c.id === courseId);

      if (existingCourse) {
        // Just add highlight field if missing
        if (!existingCourse.highlight) {
          await updateDoc(doc(db, "courses", courseId), { highlight: true });
          console.log(`✅ Added highlight to existing course ${courseId}`);
        } else {
          console.log(`ℹ️  Course ${courseId} already highlighted`);
        }
      } else {
        // Create new course
        await setDoc(doc(db, "courses", courseId), courseData);
        console.log(`✅ Created new course ${courseId}`);
      }
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to setup course ${courseId}:`, error.message);
      errors.push(`${courseId}: ${error.message}`);
    }
  }

  return { successCount, errors };
}

async function runSetup() {
  console.log("🚀 Starting robust Firebase setup...\n");

  // Step 1: Check environment
  if (!(await checkEnvironmentVariables())) {
    console.log("\n💡 Please check your .env.local file");
    return;
  }

  // Step 2: Test connection
  console.log("");
  if (!(await testConnection())) {
    console.log(
      "\n💡 Please check your internet connection and Firebase project settings"
    );
    return;
  }

  // Step 3: Check existing data
  console.log("");
  const existingData = await checkExistingData();

  // Step 4: Setup features
  console.log("");
  const featuresResult = await setupFeatures();

  // Step 5: Setup courses
  console.log("");
  const coursesResult = await setupCourses(existingData.courses);

  // Summary
  console.log("\n📋 Setup Summary:");
  console.log(
    `Features: ${featuresResult.successCount}/${
      Object.keys(featuresData).length
    } successful`
  );
  console.log(
    `Courses: ${coursesResult.successCount}/${
      Object.keys(sampleCourses).length
    } successful`
  );

  if (featuresResult.errors.length > 0) {
    console.log("\n❌ Feature errors:");
    featuresResult.errors.forEach((error) => console.log(`  - ${error}`));
  }

  if (coursesResult.errors.length > 0) {
    console.log("\n❌ Course errors:");
    coursesResult.errors.forEach((error) => console.log(`  - ${error}`));
  }

  const totalSuccess = featuresResult.successCount + coursesResult.successCount;
  const totalPossible =
    Object.keys(featuresData).length + Object.keys(sampleCourses).length;

  if (totalSuccess === totalPossible) {
    console.log("\n🎉 Setup completed successfully!");
    console.log("✅ Your pricing slideshow should now work with Firebase data");
    console.log("🌐 Visit http://localhost:3000 to test the slideshow");
  } else if (totalSuccess > 0) {
    console.log("\n⚠️  Partial setup completed");
    console.log(
      "💡 Some data was added successfully. Check the errors above for details."
    );
    console.log(
      "🔧 You may need to add the remaining data manually via Firebase Console"
    );
  } else {
    console.log("\n❌ Setup failed completely");
    console.log(
      "💡 Please follow the manual setup guide in FIREBASE_SETUP_GUIDE.md"
    );
  }
}

// Run the setup
runSetup().catch((error) => {
  console.error("💥 Unexpected error:", error);
  console.log(
    "💡 Please follow the manual setup guide in FIREBASE_SETUP_GUIDE.md"
  );
});
