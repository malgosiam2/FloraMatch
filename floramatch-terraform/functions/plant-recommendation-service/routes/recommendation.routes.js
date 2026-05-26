const { getRecommendations } =
  require("./services/recommendation.service");

async function handleRecommendationRoutes(req, res) {

  // GET /
  if (
    req.method === "GET" &&
    req.url === "/"
  ) {

    return res.status(200).send(
      "Recommendation service works!"
    );

  }

  // POST /recommendations
  if (
      req.method === "POST" &&
      req.url === "/recommendations"
    ) {

      const data = await getRecommendations();

      return res.status(200).json({
        recommendations: data
      });

    }

    return res.status(404).json({
      error: "Route not found"
    });
  }

  module.exports = { handleRecommendationRoutes };