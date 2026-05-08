exports.recommendationService = (req, res) => {

    res.status(200).json({
        message: "Recommendation service works!",
        service: "plant-recommendation-service"
    });

};