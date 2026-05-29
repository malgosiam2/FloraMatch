function PlantCard({ plant, onEdit, onDelete }) {
  return (
    <div className="plant-card" style={{ 
      display: "flex", 
      flexDirection: "column", 
      justifyContent: "space-between",
      padding: "20px",
      marginBottom: "10px" 
    }}>
      <div>
        <div className="plant-image" style={{ fontSize: "32px", marginBottom: "10px" }}>
          {plant.locationType === "garden" ? "🏡" : plant.locationType === "balcony" ? "🪴" : "🪴"}
        </div>

        {}
        <h3 style={{ 
          margin: "5px 0 8px 0", 
          fontSize: "22px", 
          color: "#2e7d32", 
          fontWeight: "bold" 
        }}>
          {plant.nickname || "Unnamed Plant"}
        </h3>
        
        <p style={{ color: "gray", fontSize: "14px", fontStyle: "italic", marginBottom: "12px" }}>
          {plant.plantId || "Generic Plant"}
        </p>

        <div className="plant-info" style={{ fontSize: "14px", lineHeight: "1.6" }}>
          {plant.locationType && (
            <p><strong>Environment:</strong> {plant.locationType}</p>
          )}
          {plant.location && (
            <p><strong>Location:</strong> {plant.location}</p>
          )}
          {plant.sunlight && (
            <p><strong>Sunlight:</strong> {plant.sunlight} light</p>
          )}
          {plant.watering && (
            <p><strong>Watering:</strong> {plant.watering} frequency</p>
          )}
          {plant.plantSize && (
            <p><strong>Size:</strong> {plant.plantSize}</p>
          )}
          {plant.flowering && (
            <p><strong>Flowering:</strong> {plant.flowering === "yes" ? "Yes" : "No"}</p>
          )}
          {plant.purchaseDate && (
            <p><strong>📅 Date Added:</strong> {plant.purchaseDate}</p>
          )}
        </div>

        {}
        {plant.notes && plant.notes.trim() !== "" && (
          <div className="plant-notes" style={{
            marginTop: "12px",
            padding: "10px 12px",
            backgroundColor: "#f8fdf6",
            border: "1px solid #e0e0e0",
            borderLeft: "4px solid #2e7d32",
            borderRadius: "6px",
            fontSize: "14px",
            color: "#444",
            lineHeight: "1.5"
          }}>
            <strong style={{ display: "block", marginBottom: "4px", color: "#2e7d32" }}>
              📝 Notes:
            </strong> 
            {plant.notes}
          </div>
        )}
      </div>

      <div className="plant-card-actions" style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
        <button 
          className="secondary-button" 
          onClick={() => onEdit(plant)}
          style={{ padding: "5px 10px", fontSize: "14px" }}
        >
          Edit
        </button>
        <button 
          className="delete-button" 
          onClick={() => onDelete(plant.plantInstanceId)}
          style={{ padding: "5px 10px", fontSize: "14px", backgroundColor: "#d32f2f", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default PlantCard;