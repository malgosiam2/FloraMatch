function PlantCard({ plant }) {

  return (
    <div className="plant-card">

      <div className="plant-image">
        🌱
      </div>

      <h3>
        {plant.nickname || "Unnamed Plant"}
      </h3>

      <div className="plant-info">

        <p>
          <strong>Type:</strong>
          {" "}
          {plant.plantId}
        </p>

        <p>
          <strong>Location:</strong>
          {" "}
          {plant.location}
        </p>

      </div>

      <div className="plant-notes">
        {plant.notes}
      </div>

    </div>
  );
}

export default PlantCard;