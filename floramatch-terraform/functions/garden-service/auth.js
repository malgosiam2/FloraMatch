const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp();
}

async function getUserId(req) {
//  const authHeader = req.headers.authorization;
  const authHeader =
    req.headers["x-forwarded-authorization"] ||
    req.headers.authorization;

  console.log("TOKEN RAW:", authHeader);

  if (!authHeader) {
    throw new Error("Missing Authorization header");
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    console.log("DECODED:", decoded);
    return decoded.uid;
  } catch (e) {
    console.error("VERIFY ERROR:", e.code, e.message);
    throw e;
  }
}

//async function getUserId(req) {
//  const authHeader = req.headers.authorization;
//
//  if (!authHeader) {
//    throw new Error("Missing Authorization header");
//  }
//
//  const token = authHeader.replace("Bearer ", "");
//
//  const decoded = await admin.auth().verifyIdToken(token);
//
//  return decoded.uid;
//}

module.exports = { getUserId };