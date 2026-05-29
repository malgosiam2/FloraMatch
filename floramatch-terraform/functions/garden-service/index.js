const admin = require("firebase-admin");

admin.initializeApp();

const { handleGardenRoutes } = require("./garden.routes");

exports.gardenService = async (req, res) => {

  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return; 
  }

  try {
    await handleGardenRoutes(req, res);
  } catch (e) {
    res.status(401).json({ error: e.message });
  }
};