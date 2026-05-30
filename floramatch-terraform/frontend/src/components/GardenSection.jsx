import { useEffect, useState } from "react";
import { getPlants, deletePlant } from "../services/gardenApi";
import PlantCard from "./PlantCard";
import AddPlantModal from "./AddPlantModal";
import "../styles/Garden.css";

function GardenSection() {
  const [plants, setPlants] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [plantToEdit, setPlantToEdit] = useState(null);

  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, id: null });
  const [successNotice, setSuccessNotice] = useState({ show: false, message: "" });

  const [loading, setLoading] = useState(true);

async function loadPlants() {
  try {
    setLoading(true);

    const data = await getPlants();

    if (Array.isArray(data)) {
      setPlants(data);
    }
  } catch (e) {
    console.error(e);
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    loadPlants();
  }, []);

  function askToDelete(plantInstanceId) {
    setDeleteConfirmation({ show: true, id: plantInstanceId });
  }

  async function confirmDelete() {
    const id = deleteConfirmation.id;
    setDeleteConfirmation({ show: false, id: null });
    try {
      await deletePlant(id);
      setSuccessNotice({ show: true, message: "The plant has been deleted from your garden." });
      await loadPlants();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="garden-wrapper">
      <div className="garden-topbar">
        <div>
          <h2 className="garden-title">My Garden</h2>
          <p className="garden-subtitle">
            Organize and manage your personal plant collection
          </p>
        </div>

        {plants.length > 0 && (
          <button
            className="primary-button"
            onClick={() => setShowModal(true)}
          >
            + Add Plant
          </button>
        )}
      </div>

      {}
    <div className="plants-grid">
        {loading ? (
            <div className="empty-state">
              <p>Loading your garden...</p>
            </div>

          ) : plants.length === 0 ? (
        <div className="empty-state">

          <h3>Your garden is empty</h3>

          <p>
            Start building your digital plant collection by adding your first
            plant.
          </p>

          <button
            className="primary-button"
            onClick={() => setShowModal(true)}
          >
            Add Your First Plant
          </button>
        </div>
        ) : (
          plants.map((plant) => (
            <PlantCard
              key={plant.plantInstanceId}
              plant={plant}
              onEdit={(p) => { setPlantToEdit(p); setShowModal(true); }}
              onDelete={askToDelete}
            />
          ))
        )}
      </div>

      {showModal && (
        <AddPlantModal
          onClose={() => { setShowModal(false); setPlantToEdit(null); }}
          onPlantAdded={loadPlants}
          plantToEdit={plantToEdit}
          existingPlants={plants}
        />
      )}

      {deleteConfirmation.show && (
        <div className="custom-alert-overlay" style={overlayStyle}>
          <div className="custom-alert-box" style={boxStyle}>
            <div style={{ fontSize: "40px", marginBottom: "10px" }}>🗑️</div>
            <h3>Remove Plant</h3>
            <p>Are you sure you want to remove this plant from your garden?</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "20px" }}>
              <button className="secondary-button" onClick={() => setDeleteConfirmation({ show: false, id: null })}>Cancel</button>
              <button className="primary-button" style={{ backgroundColor: "#d32f2f" }} onClick={confirmDelete}>Yes, remove</button>
            </div>
          </div>
        </div>
      )}

      {successNotice.show && (
        <div className="custom-alert-overlay" style={overlayStyle}>
          <div className="custom-alert-box" style={boxStyle}>
            <div style={{ fontSize: "40px", marginBottom: "10px" }}>✨</div>
            <h3>Deleted!</h3>
            <p>{successNotice.message}</p>
            <button className="primary-button" onClick={() => setSuccessNotice({ show: false, message: "" })} style={{ marginTop: "15px" }}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}

const overlayStyle = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 };
const boxStyle = { backgroundColor: "white", padding: "30px", borderRadius: "12px", textAlign: "center", boxShadow: "0px 4px 20px rgba(0,0,0,0.2)", maxWidth: "350px", width: "90%" };

export default GardenSection;