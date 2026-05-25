const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp();
}

async function getUserId(req) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new Error("Missing Authorization header");
  }

  const token = authHeader.replace("Bearer ", "");

  const decoded = await admin.auth().verifyIdToken(token);

  return decoded.uid;
}

module.exports = { getUserId };