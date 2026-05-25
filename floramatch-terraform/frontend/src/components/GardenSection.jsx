import { useEffect, useState } from "react";

import {
  getPlants
} from "../services/gardenApi";

import PlantCard from "./PlantCard";
import AddPlantModal from "./AddPlantModal";

function GardenSection() {

  const [plants, setPlants] =
    useState([]);

  const [showModal, setShowModal] =
    useState(false);

  async function loadPlants() {

    try {

      const data =
        await getPlants();

      setPlants(data);

    } catch (e) {

      console.error(e);

    }
  }

  useEffect(() => {
    loadPlants();
  }, []);

  return (
    <div className="garden-wrapper">

      <div className="garden-topbar">

        <div>

          <h2>My Garden</h2>

          <p>
            Your saved plants collection
          </p>

        </div>

        <button
          className="primary-button"
          onClick={() =>
            setShowModal(true)
          }
        >
          + Add Plant
        </button>

      </div>

      <div className="plants-grid">

        {plants.map((plant) => (
          <PlantCard
            key={plant.plantInstanceId}
            plant={plant}
          />
        ))}

      </div>

      {showModal && (
        <AddPlantModal
          onClose={() =>
            setShowModal(false)
          }
          onPlantAdded={loadPlants}
        />
      )}

    </div>
  );
}

export default GardenSection;