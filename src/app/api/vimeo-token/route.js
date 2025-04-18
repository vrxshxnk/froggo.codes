import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import crypto from "crypto";

// Initialize Firebase Admin if not already initialized
const initializeFirebaseAdmin = () => {
  if (!getApps().length) {
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_ADMIN_PROJECT_ID,
      private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
        /\\n/g,
        "\n"
      ),
      client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_ADMIN_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_CERT_URL,
    };

    initializeApp({
      credential: cert(serviceAccount),
      databaseURL: `https://${process.env.FIREBASE_ADMIN_PROJECT_ID}.firebaseio.com`,
    });
  }

  return { auth: getAuth(), db: getFirestore() };
};

// Generate a secure token for Vimeo video access
// This uses HMAC SHA-256 for token generation
const generateSecureToken = (payload, secret) => {
  const data = JSON.stringify(payload);
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(data);
  const signature = hmac.digest("hex");

  return {
    token: Buffer.from(data).toString("base64") + "." + signature,
    expires: payload.exp,
  };
};

export async function POST(request) {
  try {
    const { userId, videoId, courseId } = await request.json();

    if (!userId || !videoId || !courseId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const { auth, db } = initializeFirebaseAdmin();

    // Verify authenticated user
    try {
      const userRecord = await auth.getUser(userId);
      if (!userRecord) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } catch (error) {
      console.error("Error verifying user:", error);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the user has purchased this course
    const userCourseRef = db
      .collection("user_courses")
      .doc(`${userId}_${courseId}`);
    const userCourseDoc = await userCourseRef.get();

    if (!userCourseDoc.exists) {
      return NextResponse.json(
        { error: "User has not purchased this course" },
        { status: 403 }
      );
    }

    // Get video details from the database
    const videoRef = db.collection("videos").doc(videoId);
    const videoDoc = await videoRef.get();

    if (!videoDoc.exists) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const videoData = videoDoc.data();
    if (!videoData.vimeo_id) {
      return NextResponse.json(
        { error: "Vimeo ID not found for this video" },
        { status: 404 }
      );
    }

    // Token expires in 1 hour
    const expiration = Math.floor(Date.now() / 1000) + 60 * 60;

    const payload = {
      sub: userId,
      video: videoData.vimeo_id,
      course: courseId,
      exp: expiration,
      iat: Math.floor(Date.now() / 1000),
    };

    // Use Vimeo private video token secret from env
    const secret = process.env.VIMEO_PRIVATE_TOKEN_SECRET;
    if (!secret) {
      console.error("Vimeo token secret not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const { token, expires } = generateSecureToken(payload, secret);

    // Log token access for auditing
    await db.collection("video_access_logs").add({
      user_id: userId,
      video_id: videoId,
      course_id: courseId,
      timestamp: new Date().toISOString(),
      expires_at: new Date(expires * 1000).toISOString(),
    });

    return NextResponse.json({ token, expires });
  } catch (error) {
    console.error("Error generating video token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
