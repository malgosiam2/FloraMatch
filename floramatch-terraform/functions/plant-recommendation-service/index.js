const cors = require("cors");

const corsHandler = cors({
  origin: true
});

const {
  handleRecommendationRoutes
} = require("./routes/recommendation.routes");

exports.plantRecommendationService =
  async (req, res) => {

    corsHandler(req, res, async () => {

      try {

        await handleRecommendationRoutes(
          req,
          res
        );

      } catch (e) {

        console.error(e);

        res.status(500).json({
          error: e.message
        });

      }

    });

  };