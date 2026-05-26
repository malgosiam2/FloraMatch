const { handleRecommendationRoutes } =
  require("./recommendation.routes");

exports.plantRecommendationService =
  async (req, res) => {

    try {

      await handleRecommendationRoutes(req, res);

    } catch (e) {

      console.error(e);

      res.status(500).json({
        error: e.message
      });

    }

  };