#!/usr/bin/env node

/**
 * Migration Script: Bunny.net Library-per-Course → Single Library with Collections
 *
 * This script helps migrate from the old architecture (separate libraries per course)
 * to the new collection-based architecture (single library with course collections).
 *
 * Usage: node scripts/migrate-to-collections.mjs
 */

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  writeBatch,
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
 * Convert old video ID format to collection-based format
 * @param {string} courseId - Course identifier
 * @param {string} oldVideoId - Old video ID (e.g., "Video1" or "course-Video1")
 * @returns {string} New collection-based video ID
 */
function convertToCollectionVideoId(courseId, oldVideoId) {
  // If already in collection format, return as-is
  if (oldVideoId.includes("/")) {
    return oldVideoId;
  }

  // Convert simple "Video1" format to "courseId/Video1"
  if (oldVideoId.startsWith("Video")) {
    return `${courseId}/${oldVideoId}`;
  }

  // Convert "courseId-Video1" format to "courseId/Video1"
  if (oldVideoId.includes("-Video")) {
    const videoNumber = oldVideoId.split("-Video")[1];
    return `${courseId}/Video${videoNumber}`;
  }

  // Fallback: assume it's a video number and prepend course ID
  return `${courseId}/Video${oldVideoId}`;
}

/**
 * Migrate video documents to use collection-based video IDs
 */
async function migrateVideos() {
  console.log("🎬 Starting video migration...");

  try {
    const videosRef = collection(db, "videos");
    const snapshot = await getDocs(videosRef);

    if (snapshot.empty) {
      console.log("No videos found to migrate.");
      return;
    }

    const batch = writeBatch(db);
    let updateCount = 0;

    for (const docSnapshot of snapshot.docs) {
      const videoData = docSnapshot.data();
      const videoId = docSnapshot.id;

      if (!videoData.course_id) {
        console.warn(`⚠️  Video ${videoId} has no course_id, skipping...`);
        continue;
      }

      // Check if bunny_video_id needs updating
      if (videoData.bunny_video_id) {
        const newVideoId = convertToCollectionVideoId(
          videoData.course_id,
          videoData.bunny_video_id
        );

        if (newVideoId !== videoData.bunny_video_id) {
          console.log(
            `📝 Updating ${videoId}: ${videoData.bunny_video_id} → ${newVideoId}`
          );

          batch.update(doc(db, "videos", videoId), {
            bunny_video_id: newVideoId,
          });
          updateCount++;
        }
      } else if (videoData.order) {
        // Generate bunny_video_id from order if missing
        const newVideoId = `${videoData.course_id}/Video${videoData.order}`;
        console.log(`📝 Adding bunny_video_id to ${videoId}: ${newVideoId}`);

        batch.update(doc(db, "videos", videoId), {
          bunny_video_id: newVideoId,
        });
        updateCount++;
      }
    }

    if (updateCount > 0) {
      await batch.commit();
      console.log(`✅ Successfully updated ${updateCount} videos`);
    } else {
      console.log("✅ No videos needed updating");
    }
  } catch (error) {
    console.error("❌ Error migrating videos:", error);
    throw error;
  }
}

/**
 * Clean up course documents by removing bunny_library_id (no longer needed)
 */
async function cleanupCourses() {
  console.log("🧹 Cleaning up course documents...");

  try {
    const coursesRef = collection(db, "courses");
    const snapshot = await getDocs(coursesRef);

    if (snapshot.empty) {
      console.log("No courses found.");
      return;
    }

    const batch = writeBatch(db);
    let updateCount = 0;

    for (const docSnapshot of snapshot.docs) {
      const courseData = docSnapshot.data();
      const courseId = docSnapshot.id;

      if (courseData.bunny_library_id) {
        console.log(`📝 Removing bunny_library_id from course: ${courseId}`);

        // Create a copy without bunny_library_id
        const updatedData = { ...courseData };
        delete updatedData.bunny_library_id;

        batch.update(doc(db, "courses", courseId), updatedData);
        updateCount++;
      }
    }

    if (updateCount > 0) {
      await batch.commit();
      console.log(`✅ Successfully cleaned up ${updateCount} courses`);
    } else {
      console.log("✅ No courses needed cleanup");
    }
  } catch (error) {
    console.error("❌ Error cleaning up courses:", error);
    throw error;
  }
}

/**
 * Display migration summary and next steps
 */
function displaySummary() {
  console.log("\n🎉 Migration Complete!");
  console.log("\n📋 Next Steps:");
  console.log("1. Update your Bunny.net library:");
  console.log("   - Create collections (folders) for each course");
  console.log("   - Move videos to appropriate collections");
  console.log("   - Use naming: courseId/Video1, courseId/Video2, etc.");
  console.log("\n2. Update your .env.local file:");
  console.log(
    "   - Set NEXT_PUBLIC_BUNNY_LIBRARY_ID to your single library ID"
  );
  console.log("   - Add BUNNY_API_KEY for API operations");
  console.log("\n3. Test video playback:");
  console.log("   - Ensure users can watch videos");
  console.log("   - Verify progress tracking works");
  console.log("\n4. Remove old Bunny.net libraries (optional):");
  console.log("   - Once migration is confirmed working");
  console.log("   - This will reduce your Bunny.net costs");
}

/**
 * Main migration function
 */
async function main() {
  console.log("🚀 Starting Bunny.net Collection Migration");
  console.log("==========================================\n");

  try {
    // Step 1: Migrate videos to collection-based IDs
    await migrateVideos();

    // Step 2: Clean up course documents
    await cleanupCourses();

    // Step 3: Display summary
    displaySummary();
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run migration
main();
