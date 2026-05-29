import { useState } from "react";
import { getRecommendations } from "../services/recommendationAPI";
import { addPlant, getPlants, updatePlant } from "../services/gardenApi";

const QUESTIONS = [
  {
    key: "location",
    question: "Where will your plant live?",
    options: ["indoor", "balcony", "garden"]
  },
  {
    key: "sunlight",
    question: "How much sunlight is available?",
    options: ["low", "medium", "high"]
  },
  {
    key: "watering",
    question: "How often do you want to water the plant?",
    options: ["low", "medium", "high"]
  },
  {
    key: "plantSize",
    question: "Preferred plant size?",
    options: ["small", "medium", "large"]
  },
  {
    key: "flowering",
    question: "Do you want flowering plants?",
    options: ["yes", "no"]
  }
];

function MatchPlantSection() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedPlantToSave, setSelectedPlantToSave] = useState(null);
  const [nicknameInput, setNicknameInput] = useState("");
  const [customAlert, setCustomAlert] = useState({ show: false, message: "", isSuccess: true });

  function handleOptionSelect(option) {
    const currentQuestion = QUESTIONS[step];
    const updatedAnswers = {
      ...answers,
      [currentQuestion.key]:
        currentQuestion.key === "flowering"
          ? option === "yes"
          : option
    };

    setAnswers(updatedAnswers);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setFinished(true);
      handleGenerate(updatedAnswers);
    }
  }

  async function handleGenerate(finalAnswers) {
    try {
      setLoading(true);
      setError("");
      const data = await getRecommendations(finalAnswers);
      setRecommendations(data.recommendations || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function openAddtoGardenModal(plant) {
    setSelectedPlantToSave(plant);
    setNicknameInput(""); 
  }

  const extractKeyword = (val) => {
    if (!val) return "";
    const str = String(val).toLowerCase();
    if (str.includes("low")) return "low";
    if (str.includes("medium")) return "medium";
    if (str.includes("high")) return "high";
    if (str.includes("small")) return "small";
    if (str.includes("large")) return "large";
    if (str.includes("indoor")) return "indoor";
    if (str.includes("balcony")) return "balcony";
    if (str.includes("garden")) return "garden";
    return str.trim();
  };

  async function handleConfirmSaveToGarden() {
    if (!nicknameInput.trim()) {
      setCustomAlert({ show: true, message: "Please enter a unique nickname for your plant!", isSuccess: false });
      return;
    }

    try {
      const currentPlants = await getPlants();
      
      const isDuplicate = Array.isArray(currentPlants) && currentPlants.some(
        (p) => p.nickname?.toLowerCase().trim() === nicknameInput.toLowerCase().trim()
      );

      if (isDuplicate) {
        setCustomAlert({
          show: true,
          message: `The nickname "${nicknameInput.trim()}" is already taken in your garden! Please choose another name.`,
          isSuccess: false
        });
        return;
      }

      const plantData = {
        plantId: selectedPlantToSave.name ? selectedPlantToSave.name.trim() : "Generic Plant", 
        nickname: nicknameInput.trim(),
        locationType: extractKeyword(answers.location),
        sunlight: extractKeyword(selectedPlantToSave.sunlight || answers.sunlight),
        watering: extractKeyword(selectedPlantToSave.watering || answers.watering),
        plantSize: extractKeyword(answers.plantSize),
        flowering: answers.flowering === true || String(answers.flowering).toLowerCase() === "yes" ? "yes" : "no",
        notes: selectedPlantToSave.description ? selectedPlantToSave.description.trim() : "" 
      };

      await addPlant(plantData);
      
      const updatedPlants = await getPlants();
      const justAdded = updatedPlants.find(
        (p) => p.nickname?.toLowerCase().trim() === nicknameInput.toLowerCase().trim()
      );
      if (justAdded && justAdded.plantInstanceId) {
        await updatePlant(justAdded.plantInstanceId, plantData);
      }

      setSelectedPlantToSave(null); 
      setCustomAlert({ show: true, message: `"${plantData.nickname}" has been added to My Garden! 🌱`, isSuccess: true });
    } catch (err) {
      console.error(err);
      setCustomAlert({ show: true, message: "Could not add plant: " + err.message, isSuccess: false });
    }
  }

  return (
    <div className="match-wrapper">
      <div className="match-card">
        <div className="match-badge">AI POWERED</div>
        <h2>Find Your Perfect Plant</h2>

        {!finished && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "20px" }}>
            {QUESTIONS.map((q, idx) => {
              if (idx > step) return null;

              const isPastQuestion = idx < step;
              const savedValue = answers[q.key];
              
              return (
                <div
                  key={q.key}
                  style={{
                    background: "#f6f8f4",
                    padding: "24px",
                    borderRadius: "18px",
                    border: isPastQuestion ? "1px dashed #ccc" : "1px solid #d8e7d3",
                    opacity: isPastQuestion ? 0.45 : 1, 
                    pointerEvents: isPastQuestion ? "none" : "auto", 
                    transition: "all 0.4s ease"
                  }}
                >
                  <p style={{ fontWeight: "bold", marginBottom: "16px" }}>
                    {q.question} {isPastQuestion && "✓"}
                  </p>

                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    {q.options.map((option) => {
                      const isOptionSelected = q.key === "flowering"
                        ? (savedValue === true && option === "yes") || (savedValue === false && option === "no")
                        : savedValue === option;

                      return (
                        <button
                          key={option}
                          className="primary-button"
                          style={{
                            backgroundColor: isPastQuestion && !isOptionSelected ? "#e0e0e0" : undefined,
                            color: isPastQuestion && !isOptionSelected ? "#777" : undefined,
                          }}
                          onClick={() => handleOptionSelect(option)}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {loading && <p style={{ marginTop: "20px" }}>Generating recommendations...</p>}
        {error && <p style={{ color: "red", marginTop: "20px" }}>{error}</p>}

        {recommendations.length > 0 && (
          <div style={{ marginTop: "30px", display: "flex", flexDirection: "column", gap: "20px" }}>
            {recommendations.map((plant) => (
              <div
                key={plant.id}
                style={{
                  padding: "20px",
                  borderRadius: "16px",
                  background: "#f6f8f4",
                  border: "1px solid #d8e7d3",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <h3>{plant.name}</h3>
                  <p style={{ margin: "8px 0", color: "#444" }}>{plant.description}</p>
                  <p style={{ fontSize: "14px" }}>☀️ Sunlight: <strong>{plant.sunlight}</strong></p>
                  <p style={{ fontSize: "14px" }}>💧 Watering: <strong>{plant.watering}</strong></p>
                </div>

                <button
                  className="primary-button"
                  style={{ marginTop: "15px", backgroundColor: "#2e7d32", alignSelf: "flex-start", padding: "8px 16px" }}
                  onClick={() => openAddtoGardenModal(plant)}
                >
                  ➕ Add to My Garden
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedPlantToSave && (
        <div className="custom-alert-overlay" style={overlayStyle}>
          <div className="custom-alert-box" style={boxStyle}>
            <div style={{ fontSize: "40px" }}>🪴</div>
            <h3 style={{ marginTop: "10px" }}>Name Your New Plant</h3>
            <p style={{ fontSize: "13px", color: "gray", marginBottom: "15px" }}>
              Adding <strong>{selectedPlantToSave.name}</strong> to your digital garden.
            </p>
            
            <input
              type="text"
              placeholder="Give it a nickname (e.g. Felix)..."
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box", marginBottom: "15px" }}
              required
            />

            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button className="secondary-button" onClick={() => setSelectedPlantToSave(null)}>Cancel</button>
              <button className="primary-button" style={{ backgroundColor: "#2e7d32" }} onClick={handleConfirmSaveToGarden}>Save to Garden</button>
            </div>
          </div>
        </div>
      )}

      {customAlert.show && (
        <div className="custom-alert-overlay" style={overlayStyle}>
          <div className="custom-alert-box" style={boxStyle}>
            <div style={{ fontSize: "40px", marginBottom: "10px" }}>{customAlert.isSuccess ? "" : ""}</div>
            <h3>{customAlert.isSuccess ? "Success!" : "Notice"}</h3>
            <p style={{ fontSize: "14px", color: "#555" }}>{customAlert.message}</p>
            <button className="primary-button" onClick={() => setCustomAlert({ show: false, message: "", isSuccess: true })} style={{ marginTop: "20px", width: "100px" }}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}

const overlayStyle = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 };
const boxStyle = { backgroundColor: "white", padding: "30px", borderRadius: "12px", textAlign: "center", boxShadow: "0px 4px 20px rgba(0,0,0,0.2)", maxWidth: "360px", width: "90%" };

export default MatchPlantSection;