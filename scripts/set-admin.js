// scripts/set-admin.js
// Grants (or revokes) the Firebase "admin" custom claim used by /admin and
// the Firestore rules. Uses the same service-account env vars as the app.
//
//   node scripts/set-admin.js you@example.com          # grant admin
//   node scripts/set-admin.js you@example.com --remove # revoke admin
//
// After running, the user must sign out and back in (or wait up to an hour)
// for the refreshed token to carry the claim.
require("dotenv").config({ path: [".env.local", ".env"] });

const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

const email = process.argv[2];
const remove = process.argv.includes("--remove");

if (!email || !email.includes("@")) {
  console.error("Usage: node scripts/set-admin.js <email> [--remove]");
  process.exit(1);
}

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID?.trim(),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL?.trim(),
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.trim().replace(/\\n/g, "\n"),
  }),
});

(async () => {
  try {
    const user = await getAuth().getUserByEmail(email);
    await getAuth().setCustomUserClaims(user.uid, {
      ...(user.customClaims || {}),
      admin: !remove,
    });
    console.log(
      `${remove ? "Revoked" : "Granted"} admin claim for ${email} (uid: ${user.uid}).`
    );
    console.log("They must sign out and back in for it to take effect.");
    process.exit(0);
  } catch (error) {
    console.error("Failed:", error.message);
    process.exit(1);
  }
})();
