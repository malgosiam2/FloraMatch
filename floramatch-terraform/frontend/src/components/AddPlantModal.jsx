import { useState } from "react";
import { addPlant } from "../services/gardenApi";

function AddPlantModal({ onClose, onPlantAdded }) {

  const [form, setForm] = useState({
    nickname: "",
    location: "",
    purchaseDate: "",
    notes: ""
  });

  async function handleSubmit(e) {

    e.preventDefault();

    try {

      await addPlant(form);

      await onPlantAdded();

      onClose();

    } catch (e) {

      console.error(e);

      alert("Cannot save plant");

    }
  }

  return (

    <div className="modal-overlay">

      <div className="modal">

        <h2>Add Plant</h2>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            placeholder="Plant nickname"
            value={form.nickname}
            onChange={(e) =>
              setForm({
                ...form,
                nickname: e.target.value
              })
            }
          />

          <input
            type="text"
            placeholder="Location"
            value={form.location}
            onChange={(e) =>
              setForm({
                ...form,
                location: e.target.value
              })
            }
          />

          <input
            type="date"
            value={form.purchaseDate}
            onChange={(e) =>
              setForm({
                ...form,
                purchaseDate: e.target.value
              })
            }
          />

          <textarea
            placeholder="Notes"
            value={form.notes}
            onChange={(e) =>
              setForm({
                ...form,
                notes: e.target.value
              })
            }
          />

          <div className="modal-actions">

            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
            >
              Save Plant
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default AddPlantModal;