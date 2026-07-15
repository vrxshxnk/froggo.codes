import { auth, db } from "@/libs/firebase";
import {
  buildRoadmapStats,
  defaultRoadmaps,
  getDefaultRoadmap,
} from "@/data/roadmaps";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

async function getAuthHeaders() {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("Authentication required");
  }

  const idToken = await currentUser.getIdToken();
  return {
    Authorization: `Bearer ${idToken}`,
  };
}

export const roadmapService = {
  async getRoadmap(slug) {
    const fallback = getDefaultRoadmap(slug);

    try {
      const roadmapRef = doc(db, "roadmaps", slug);
      const snapshot = await getDoc(roadmapRef);

      if (!snapshot.exists()) {
        return fallback;
      }

      const remote = snapshot.data();
      if (!remote?.modules?.length) {
        return fallback;
      }

      const merged = {
        ...fallback,
        ...remote,
        slug,
        modules: remote.modules,
      };

      // Stats always reflect the modules actually shown, even when a
      // Firestore override carries stale counts.
      return { ...merged, stats: buildRoadmapStats(merged) };
    } catch {
      return fallback;
    }
  },

  async getProgress(userId, roadmapId) {
    if (!userId || !roadmapId) return {};

    try {
      const response = await fetch(
        `/api/roadmap-progress?roadmapId=${encodeURIComponent(roadmapId)}`,
        {
          headers: await getAuthHeaders(),
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load roadmap progress");
      }

      const data = await response.json();
      return data.completed || {};
    } catch {
      return {};
    }
  },

  async setProgress(userId, roadmapId, completed) {
    if (!userId || !roadmapId) {
      throw new Error("User and roadmap are required");
    }

    const response = await fetch("/api/roadmap-progress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(await getAuthHeaders()),
      },
      body: JSON.stringify({
        roadmapId,
        completed,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save roadmap progress");
    }
  },

  async saveRoadmap(slug, roadmap) {
    if (!defaultRoadmaps[slug]) {
      throw new Error("Unknown roadmap");
    }

    const roadmapRef = doc(db, "roadmaps", slug);
    await setDoc(
      roadmapRef,
      {
        ...roadmap,
        slug,
        updated_at: serverTimestamp(),
      },
      { merge: true }
    );
  },
};
