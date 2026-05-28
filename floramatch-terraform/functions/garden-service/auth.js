const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp();
}

async function getUserId(req) {
  console.log("🔐 AUTH CHECK START");

  const authHeader = req.headers.authorization;
  console.log("AUTH HEADER:", authHeader);

  if (!authHeader) {
    console.error("❌ Missing Authorization header");
    throw new Error("Missing Authorization header");
  }

  const token = authHeader.replace("Bearer ", "");
  console.log("TOKEN RECEIVED (first 20 chars):", token.slice(0, 20));

  const decoded = await admin.auth().verifyIdToken(token);

  console.log("✅ AUTH SUCCESS UID:", decoded.uid);

  return decoded.uid;
}

module.exports = { getUserId };