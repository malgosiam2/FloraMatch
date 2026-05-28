const admin = require("firebase-admin");
const cors = require("cors");

admin.initializeApp();

const corsHandler = cors({
  origin: true
});

const { handleGardenRoutes } = require("./routes/garden.routes");

exports.gardenService = async (req, res) => {
  corsHandler(req, res, async () => {
    try {
      await handleGardenRoutes(req, res);
    } catch (e) {
      console.error(e);

      res.status(500).json({
        error: e.message
      });
    }
  });
};