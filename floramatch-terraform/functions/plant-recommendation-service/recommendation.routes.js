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

    return res.status(200).json({
      recommendations: [
        {
          id: "1",
          name: "Snake Plant",
          description:
            "Easy indoor plant"
        },
        {
          id: "2",
          name: "ZZ Plant",
          description:
            "Low maintenance"
        }
      ]
    });

  }

  // fallback
  return res.status(404).json({
    error: "Route not found"
  });

}

module.exports = {
  handleRecommendationRoutes
};