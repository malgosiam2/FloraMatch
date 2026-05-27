const { getRecommendations } =
  require("../services/recommendations.service");

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

  // POST /// recommendations
 if (
   req.method === "POST" &&
   req.url === "/recommendations"
 ) {

   const { prompt } = req.body;

   console.log("Prompt:", prompt);

   const recommendations =
     await getRecommendations();

   return res.status(200).json({
     recommendations
   });

 }

 return res.status(404).json({
   error: "Route not found"
 });

}

module.exports = {
 handleRecommendationRoutes
};