// scripts/authorize-domain.js
// Adds domains to Firebase Auth's authorized-domains list (the fix for
// the "auth/unauthorized-domain" sign-in error on a new custom domain).
//
//   node scripts/authorize-domain.js froggo.codes www.froggo.codes
//
// Uses the same service-account env vars as the app. If the service
// account lacks permission, do it in the console instead:
// Firebase Console -> Authentication -> Settings -> Authorized domains.
require("dotenv").config({ path: [".env.local", ".env"] });

const { initializeApp, cert } = require("firebase-admin/app");

const domains = process.argv.slice(2);

if (domains.length === 0) {
  console.error("Usage: node scripts/authorize-domain.js <domain> [domain...]");
  process.exit(1);
}

const projectId = process.env.FIREBASE_PROJECT_ID?.trim();

const app = initializeApp({
  credential: cert({
    projectId,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL?.trim(),
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.trim().replace(/\\n/g, "\n"),
  }),
});

(async () => {
  try {
    const { access_token: token } = await app.options.credential.getAccessToken();
    const url = `https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config`;

    const getResponse = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!getResponse.ok) {
      throw new Error(`GET config failed (${getResponse.status}): ${await getResponse.text()}`);
    }
    const config = await getResponse.json();
    const current = config.authorizedDomains || [];
    console.log("Currently authorized:", current.join(", "));

    const updated = [...new Set([...current, ...domains])];
    if (updated.length === current.length) {
      console.log("All requested domains already authorized. Nothing to do.");
      process.exit(0);
    }

    const patchResponse = await fetch(`${url}?updateMask=authorizedDomains`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ authorizedDomains: updated }),
    });
    if (!patchResponse.ok) {
      throw new Error(`PATCH failed (${patchResponse.status}): ${await patchResponse.text()}`);
    }

    const result = await patchResponse.json();
    console.log("Now authorized:", (result.authorizedDomains || updated).join(", "));
    process.exit(0);
  } catch (error) {
    console.error("Failed:", error.message);
    console.error(
      "\nFallback: Firebase Console -> Authentication -> Settings -> " +
        "Authorized domains -> Add domain."
    );
    process.exit(1);
  }
})();
