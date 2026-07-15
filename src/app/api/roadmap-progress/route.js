import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, verifyAuthToken } from "@/libs/firebaseAdmin";

const allowedRoadmaps = new Set(["dsa", "development"]);

function isValidRoadmapId(roadmapId) {
  return typeof roadmapId === "string" && allowedRoadmaps.has(roadmapId);
}

function progressDocId(userId, roadmapId) {
  return `${userId}_${roadmapId}`;
}

function sanitizeCompleted(completed) {
  if (!completed || typeof completed !== "object" || Array.isArray(completed)) {
    return null;
  }

  return Object.fromEntries(
    Object.entries(completed)
      .filter(
        ([key, value]) =>
          typeof key === "string" &&
          key.length > 0 &&
          key.length <= 120 &&
          typeof value === "boolean"
      )
      .slice(0, 500)
  );
}

async function requireUser(request) {
  const authResult = await verifyAuthToken(request);
  if (!authResult) {
    return {
      error: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  return { user: authResult };
}

export async function GET(request) {
  const { user, error } = await requireUser(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const roadmapId = searchParams.get("roadmapId");

  if (!isValidRoadmapId(roadmapId)) {
    return NextResponse.json({ error: "Invalid roadmap" }, { status: 400 });
  }

  try {
    const snapshot = await adminDb
      .collection("roadmap_progress")
      .doc(progressDocId(user.userId, roadmapId))
      .get();

    return NextResponse.json({
      completed: snapshot.exists ? snapshot.data()?.completed || {} : {},
    });
  } catch (routeError) {
    console.error("Roadmap progress read failed:", routeError);
    return NextResponse.json(
      { error: "Failed to load roadmap progress" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const { user, error } = await requireUser(request);
  if (error) return error;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const completed = sanitizeCompleted(body?.completed);
  if (!isValidRoadmapId(body?.roadmapId) || !completed) {
    return NextResponse.json({ error: "Invalid progress data" }, { status: 400 });
  }

  try {
    await adminDb
      .collection("roadmap_progress")
      .doc(progressDocId(user.userId, body.roadmapId))
      .set(
        {
          user_id: user.userId,
          roadmap_id: body.roadmapId,
          completed,
          updated_at: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

    return NextResponse.json({ success: true });
  } catch (routeError) {
    console.error("Roadmap progress save failed:", routeError);
    return NextResponse.json(
      { error: "Failed to save roadmap progress" },
      { status: 500 }
    );
  }
}
