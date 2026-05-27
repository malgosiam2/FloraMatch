const {getRecommendations} = require("../services/recommendations.service");

async function handleRecommendationRoutes(req, res) {

  if (req.method === "GET" && req.url === "/") {

    return res.status(200).send("Recommendation service works!");

  }

  if (req.method === "POST" && req.url === "/recommendations") {

    try {

      const filters = req.body;

      const data =
        await getRecommendations(filters);

      return res.status(200).json({
        recommendations: data
      });

    } catch (e) {

      console.error(e);

      return res.status(500).json({
        error: e.message
      });

    }

  }

  return res.status(404).json({
    error: "Route not found"
  });

}

module.exports = {
  handleRecommendationRoutes
};