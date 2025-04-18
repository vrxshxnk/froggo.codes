// Migration script to add Vimeo IDs to existing videos
// Run this script using Node.js after uploading videos to Vimeo

require("dotenv").config();
const admin = require("firebase-admin");
const { readFileSync } = require("fs");
const { join } = require("path");
const readline = require("readline");

const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_ADMIN_PROJECT_ID,
  private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_ADMIN_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_CERT_URL,
};

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${process.env.FIREBASE_ADMIN_PROJECT_ID}.firebaseio.com`,
});

const db = admin.firestore();

// Either upload a CSV file with mappings or manually enter them
const askForMappingMethod = async () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      "Do you want to use a CSV file for ID mappings? (y/n): ",
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === "y");
      }
    );
  });
};

// Parse CSV file with video mappings (Firebase ID, Vimeo ID)
const parseCsvMappings = (filePath) => {
  try {
    const content = readFileSync(filePath, "utf8");
    const lines = content.split("\n");
    const mappings = {};

    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const [firebaseId, vimeoId] = line.split(",");
      if (firebaseId && vimeoId) {
        mappings[firebaseId] = vimeoId;
      }
    }

    return mappings;
  } catch (error) {
    console.error("Error parsing CSV file:", error);
    process.exit(1);
  }
};

// Manually enter mappings for each video
const manuallyEnterMappings = async (videos) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const mappings = {};

  for (const video of videos) {
    const vimeoId = await new Promise((resolve) => {
      rl.question(
        `Enter Vimeo ID for "${video.title}" (Firebase ID: ${video.id}): `,
        (answer) => {
          resolve(answer.trim());
        }
      );
    });

    if (vimeoId) {
      mappings[video.id] = vimeoId;
    }
  }

  rl.close();
  return mappings;
};

// Update Firestore documents with Vimeo IDs
const updateFirestoreVideos = async (mappings) => {
  const batch = db.batch();
  let count = 0;

  // Get all videos that need updating
  const videosSnapshot = await db.collection("videos").get();

  for (const doc of videosSnapshot.docs) {
    const videoId = doc.id;
    if (mappings[videoId]) {
      batch.update(doc.ref, {
        vimeo_id: mappings[videoId],
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      });
      count++;

      // Firebase has a limit of 500 operations per batch
      if (count % 450 === 0) {
        await batch.commit();
        console.log(`Processed ${count} videos...`);
      }
    }
  }

  // Commit any remaining updates
  if (count % 450 !== 0) {
    await batch.commit();
  }

  return count;
};

// Main migration function
const migrateVideosToVimeo = async () => {
  try {
    console.log("Starting video migration to Vimeo...");

    // Get all videos from Firestore
    const videosSnapshot = await db.collection("videos").get();
    const videos = videosSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`Found ${videos.length} videos in the database`);

    // Determine how to get mappings
    const useCSV = await askForMappingMethod();
    let mappings = {};

    if (useCSV) {
      const filePath = join(__dirname, "vimeo_mappings.csv");
      mappings = parseCsvMappings(filePath);
    } else {
      mappings = await manuallyEnterMappings(videos);
    }

    console.log(`Prepared mappings for ${Object.keys(mappings).length} videos`);

    // Update Firestore documents
    const updatedCount = await updateFirestoreVideos(mappings);

    console.log(`Successfully updated ${updatedCount} videos with Vimeo IDs`);
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    process.exit(0);
  }
};

// Run the migration
migrateVideosToVimeo();
