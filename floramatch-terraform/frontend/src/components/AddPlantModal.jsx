import { useState } from "react";
import { addPlant } from "../services/gardenApi";

function AddPlantModal({ onClose, onPlantAdded }) {

  const [form, setForm] = useState({
    plantId: "",
    nickname: "",
    location: "",
    notes: ""
  });

  async function handleSubmit(e) {
    e.preventDefault();

    await addPlant(form);

    onPlantAdded();
    onClose();
  }

  return (
    <div className="modal-overlay">

      <div className="modal">

        <h2>Add Plant</h2>

        <form onSubmit={handleSubmit}>

          <input
            placeholder="Plant ID"
            value={form.plantId}
            onChange={(e) =>
              setForm({
                ...form,
                plantId: e.target.value
              })
            }
          />

          <input
            placeholder="Nickname"
            value={form.nickname}
            onChange={(e) =>
              setForm({
                ...form,
                nickname: e.target.value
              })
            }
          />

          <input
            placeholder="Location"
            value={form.location}
            onChange={(e) =>
              setForm({
                ...form,
                location: e.target.value
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

          <button type="submit">
            Save Plant
          </button>

        </form>

      </div>

    </div>
  );
}

export default AddPlantModal;