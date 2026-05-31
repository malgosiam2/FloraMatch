const { getRecommendations, getChatRecommendation } = require("../services/recommendations.service");

async function handleRecommendationRoutes(req, res) {
  res.set('Access-Control-Allow-Origin', '*'); 
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  if (req.method === "GET" && req.url === "/") {
    return res.status(200).send("Recommendation service works!");
  }

  if (req.method === "POST" && req.url === "/recommendations") {
    try {
      if (req.body.filters) {
        const data = await getRecommendations(req.body.filters);
        return res.status(200).json(data);
      }

      if (req.body.prompt) {

        const history = req.body.history || [];
        const aiData = await getChatRecommendation(req.body.prompt, history);
        return res.status(200).json({
          source: "ai_chat",
          aiMessage: aiData.aiMessage,
          recommendations: aiData.plants || []
        });
      }

      return res.status(400).json({
        error: "Bad Request: Missing either 'filters' or 'prompt' in request body."
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