// scripts/deploy-rules.js
// Deploys firestore.rules via the Firebase Rules REST API using the app's
// service-account credentials — no firebase-tools login needed.
//
//   node scripts/deploy-rules.js
require("dotenv").config({ path: [".env.local", ".env"] });

const fs = require("fs");
const path = require("path");
const { initializeApp, cert } = require("firebase-admin/app");

const projectId = process.env.FIREBASE_PROJECT_ID?.trim();

const app = initializeApp({
  credential: cert({
    projectId,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL?.trim(),
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.trim().replace(/\\n/g, "\n"),
  }),
});

const API = "https://firebaserules.googleapis.com/v1";

(async () => {
  try {
    const rulesPath = path.join(process.cwd(), "firestore.rules");
    const content = fs.readFileSync(rulesPath, "utf8");
    const { access_token: token } = await app.options.credential.getAccessToken();
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    // 1. Create a ruleset from the local file (compilation errors surface here)
    const rulesetResponse = await fetch(`${API}/projects/${projectId}/rulesets`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        source: { files: [{ name: "firestore.rules", content }] },
      }),
    });
    if (!rulesetResponse.ok) {
      throw new Error(`Ruleset creation failed (${rulesetResponse.status}): ${await rulesetResponse.text()}`);
    }
    const ruleset = await rulesetResponse.json();
    console.log("Created ruleset:", ruleset.name);

    // 2. Point the cloud.firestore release at the new ruleset
    const releaseName = `projects/${projectId}/releases/cloud.firestore`;
    const releaseResponse = await fetch(`${API}/${releaseName}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        release: { name: releaseName, rulesetName: ruleset.name },
      }),
    });

    if (releaseResponse.status === 404) {
      // First-ever deploy for this project: create the release instead
      const createResponse = await fetch(`${API}/projects/${projectId}/releases`, {
        method: "POST",
        headers,
        body: JSON.stringify({ name: releaseName, rulesetName: ruleset.name }),
      });
      if (!createResponse.ok) {
        throw new Error(`Release creation failed (${createResponse.status}): ${await createResponse.text()}`);
      }
    } else if (!releaseResponse.ok) {
      throw new Error(`Release update failed (${releaseResponse.status}): ${await releaseResponse.text()}`);
    }

    console.log(`Firestore rules deployed to ${projectId}.`);
    process.exit(0);
  } catch (error) {
    console.error("Failed:", error.message);
    process.exit(1);
  }
})();
