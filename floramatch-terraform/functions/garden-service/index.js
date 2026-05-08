exports.gardenService = (req, res) => {

    res.status(200).json({
        message: "Garden service works!",
        service: "garden-service"
    });

};