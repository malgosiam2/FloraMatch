const placeholderImages = [
  "/plants/plant1.png",
  "/plants/plant2.png",
  "/plants/plant3.png",
  "/plants/plant4.png",
  "/plants/plant5.png",
  "/plants/plant6.png",
];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function PlantCard({ plant, onEdit, onDelete }) {

  const index = hashString(plant.nickname || plant.plantId || "plant") % placeholderImages.length;
  const image = placeholderImages[index];

  return (
    <div className="plant-card">
      <div className="plant-image-wrapper">
        <img
          src={image}
          alt={plant.nickname}
          className="plant-image"
        />

        <div className="plant-badge">
          {plant.locationType || "Indoor"}
        </div>
      </div>

      <div className="plant-card-content">
        <div>
          <h3 className="plant-name">
            {plant.nickname || "Unnamed Plant"}
          </h3>

          <p className="plant-species">
            {plant.plantId || "Unknown Species"}
          </p>
        </div>

        <div className="plant-info-grid">
          {plant.sunlight && (
            <div className="info-chip">
              ☀️ {plant.sunlight}
            </div>
          )}

          {plant.watering && (
            <div className="info-chip">
              💧 {plant.watering}
            </div>
          )}

          {plant.plantSize && (
            <div className="info-chip">
              🌱 {plant.plantSize}
            </div>
          )}

          {plant.flowering && (
            <div className="info-chip">
              🌸 {plant.flowering === "yes" ? "Flowering" : "Non-Flowering"}
            </div>
          )}
        </div>

        {plant.location && (
          <p className="plant-location">
            📍 {plant.location}
          </p>
        )}

          {plant.purchaseDate && (
          <p className="plant-location">
            📅 {plant.purchaseDate}
          </p>
        )}

        {plant.notes && plant.notes.trim() !== "" && (
          <div className="plant-notes">
            <span>Notes</span>
            <p>{plant.notes}</p>
          </div>
        )}

        <div className="plant-card-actions">
          <button
            className="secondary-button"
            onClick={() => onEdit(plant)}
          >
            Edit
          </button>

          <button
            className="danger-button"
            onClick={() => onDelete(plant.plantInstanceId)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default PlantCard;