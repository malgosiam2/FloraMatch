const { Firestore } = require("@google-cloud/firestore");

const db = new Firestore();

function plantsCollection(userId) {
  return db.collection("users").doc(userId).collection("plants");
}

module.exports = { db, plantsCollection };