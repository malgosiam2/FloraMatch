import { useState, useEffect } from "react";
import { addPlant, updatePlant, getPlants } from "../services/gardenApi";

function AddPlantModal({ onClose, onPlantAdded, plantToEdit, existingPlants = [] }) {
  const [form, setForm] = useState({
    plantId: "", 
    nickname: "",
    location: "",
    purchaseDate: "",
    notes: "",
    locationType: "", 
    sunlight: "",     
    watering: "",     
    plantSize: "",    
    flowering: ""     
  });

  const [customAlert, setCustomAlert] = useState({ show: false, message: "", isSuccess: true });

  useEffect(() => {
    if (plantToEdit) {
      setForm({
        plantId: plantToEdit.plantId || "",
        nickname: plantToEdit.nickname || "",
        location: plantToEdit.location || "",
        purchaseDate: plantToEdit.purchaseDate || "",
        notes: plantToEdit.notes || "",
        locationType: plantToEdit.locationType || "",
        sunlight: plantToEdit.sunlight || "",
        watering: plantToEdit.watering || "",
        plantSize: plantToEdit.plantSize || "",
        flowering: plantToEdit.flowering || ""
      });
    }
  }, [plantToEdit]);

  async function handleSubmit(e) {
    e.preventDefault();
    
    const isDuplicate = Array.isArray(existingPlants) && existingPlants.some(
      (p) =>
        p.nickname?.toLowerCase().trim() === form.nickname.toLowerCase().trim() &&
        p.plantInstanceId !== plantToEdit?.plantInstanceId
    );

    if (isDuplicate) {
      setCustomAlert({
        show: true,
        message: `The nickname "${form.nickname}" is already taken! Give this plant a unique name.`,
        isSuccess: false
      });
      return;
    }

    try {
      if (plantToEdit && plantToEdit.plantInstanceId) {
        await updatePlant(plantToEdit.plantInstanceId, form);
        setCustomAlert({ show: true, message: "Your plant has been updated successfully!", isSuccess: true });
      } else {
        await addPlant(form);
        
        const allPlants = await getPlants();
        const justAddedPlant = allPlants.find(
          (p) => p.nickname?.toLowerCase().trim() === form.nickname.toLowerCase().trim()
        );
        
        if (justAddedPlant && justAddedPlant.plantInstanceId) {
          await updatePlant(justAddedPlant.plantInstanceId, form);
        }

        setCustomAlert({ show: true, message: "Your plant has been added to your garden!", isSuccess: true });
      }
    } catch (e) {
      console.error(e);
      setCustomAlert({ show: true, message: "Cannot save plant: " + e.message, isSuccess: false });
    }
  }

  function handleAlertOk() {
    if (customAlert.isSuccess) {
      if (typeof onPlantAdded === "function") onPlantAdded(); 
      onClose();
    } else {
      setCustomAlert({ show: false, message: "", isSuccess: true });
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxHeight: "90vh", overflowY: "auto" }}>
        <h2>{plantToEdit && plantToEdit.plantInstanceId ? "Edit Plant Details" : "Add New Plant"}</h2>

        <form onSubmit={handleSubmit}>
          <label>Plant Type / Species<span className="required-star">*</span></label>
          <input type="text" placeholder="e.g. Monstera Deliciosa" value={form.plantId} onChange={(e) => setForm({ ...form, plantId: e.target.value })} required />

          <label>Plant Nickname (Must be unique)<span className="required-star">*</span></label>
          <input type="text" placeholder="e.g. Greg" value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} required />

          <label>Where will your plant live?</label>
          <select style={selectStyle} value={form.locationType} onChange={(e) => setForm({ ...form, locationType: e.target.value })}>
            <option value="">Select option...</option>
            <option value="indoor">Indoor</option>
            <option value="balcony">Balcony</option>
            <option value="garden">Garden</option>
          </select>

          <label>Specific Location Description</label>
          <input type="text" placeholder="e.g. Bedroom shelf" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />

          <label>How much sunlight is available?</label>
          <select style={selectStyle} value={form.sunlight} onChange={(e) => setForm({ ...form, sunlight: e.target.value })}>
            <option value="">Select level...</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <label>How often do you want to water the plant?</label>
          <select style={selectStyle} value={form.watering} onChange={(e) => setForm({ ...form, watering: e.target.value })}>
            <option value="">Select frequency...</option>
            <option value="low">Low (Rarely)</option>
            <option value="medium">Medium (Regularly)</option>
            <option value="high">High (Frequently)</option>
          </select>

          <label>Plant size?</label>
          <select style={selectStyle} value={form.plantSize} onChange={(e) => setForm({ ...form, plantSize: e.target.value })}>
            <option value="">Select size...</option>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>

          <label>Is it flowering?</label>
          <select style={selectStyle} value={form.flowering} onChange={(e) => setForm({ ...form, flowering: e.target.value })}>
            <option value="">Select...</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>

          <label>Purchase Date</label>
          <input type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} />

          <label>Notes</label>
          <textarea placeholder="Any special care tips?" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />

          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-button">
              {plantToEdit && plantToEdit.plantInstanceId ? "Save Changes" : "Save Plant"}
            </button>
          </div>
        </form>
      </div>

      {customAlert.show && (
        <div className="custom-alert-overlay" style={alertOverlayStyle}>
          <div className="custom-alert-box" style={alertBoxStyle}>
            <div style={{ fontSize: "40px", marginBottom: "10px" }}>{customAlert.isSuccess ? "🌱" : "⚠️"}</div>
            <h3>{customAlert.isSuccess ? "Success!" : "Note"}</h3>
            <p>{customAlert.message}</p>
            <button className="primary-button" onClick={handleAlertOk} style={{ marginTop: "15px", width: "100px" }}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}

const selectStyle = { width: "100%", padding: "10px", margin: "8px 0 16px 0", border: "1px solid #ccc", borderRadius: "4px", backgroundColor: "#fff", fontFamily: "inherit", fontSize: "14px", color: "#333", boxSizing: "border-box" };
const alertOverlayStyle = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 };
const alertBoxStyle = { backgroundColor: "white", padding: "30px", borderRadius: "12px", textAlign: "center", boxShadow: "0px 4px 20px rgba(0,0,0,0.2)", maxWidth: "350px", width: "90%" };

export default AddPlantModal;