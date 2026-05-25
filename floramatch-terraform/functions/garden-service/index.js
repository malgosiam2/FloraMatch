const admin = require("firebase-admin");

admin.initializeApp();

const { handleGardenRoutes } = require("./routes/garden.routes");

exports.gardenService = async (req, res) => {
  try {
    await handleGardenRoutes(req, res);
  } catch (e) {
    res.status(401).json({ error: e.message });
  }
};