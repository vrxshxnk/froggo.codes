import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, verifyAuthToken } from "@/libs/firebaseAdmin";
import { defaultRoadmaps } from "@/data/roadmaps";

const allowedRoadmaps = new Set(["dsa", "development"]);

function isValidRoadmapId(roadmapId) {
  return typeof roadmapId === "string" && allowedRoadmaps.has(roadmapId);
}

function progressDocId(userId, roadmapId) {
  return `${userId}_${roadmapId}`;
}

function addItemKeys(keys, roadmap) {
  const modules = [
    ...(roadmap?.modules || []),
    ...(roadmap?.bonus?.modules || []),
  ];
  modules.forEach((module) => {
    (module?.items || []).forEach((item) => {
      if (module?.id && item?.id) keys.add(`${module.id}:${item.id}`);
    });
  });
}

// Progress keys are "moduleId:itemId". Only keys for items that exist — in
// the code roadmap or an admin Firestore override — are stored, so progress
// can later back streaks and certificates without trusting the client.
async function getValidKeys(roadmapId) {
  const keys = new Set();
  addItemKeys(keys, defaultRoadmaps[roadmapId]);

  try {
    const override = await adminDb.collection("roadmaps").doc(roadmapId).get();
    if (override.exists) addItemKeys(keys, override.data());
  } catch (overrideError) {
    console.error("Roadmap override read failed:", overrideError);
  }

  return keys;
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
    const validKeys = await getValidKeys(body.roadmapId);
    const filtered = Object.fromEntries(
      Object.entries(completed).filter(([key]) => validKeys.has(key))
    );

    const docRef = adminDb
      .collection("roadmap_progress")
      .doc(progressDocId(user.userId, body.roadmapId));
    const existing = await docRef.get();
    const existingCompletedAt = existing.exists
      ? existing.data()?.completed_at || {}
      : {};

    // Server-side completion times: set when an item is first ticked,
    // cleared when it's unticked. Clients can't backdate a streak.
    const now = new Date().toISOString();
    const completedAt = {};
    Object.entries(filtered).forEach(([key, done]) => {
      if (done && !existingCompletedAt[key]) completedAt[key] = now;
      if (!done && existingCompletedAt[key]) completedAt[key] = FieldValue.delete();
    });

    await docRef.set(
      {
        user_id: user.userId,
        roadmap_id: body.roadmapId,
        completed: filtered,
        ...(Object.keys(completedAt).length ? { completed_at: completedAt } : {}),
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
