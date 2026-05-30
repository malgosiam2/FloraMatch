import { useState } from "react";
import { getRecommendations } from "../services/recommendationAPI";
import { addPlant, getPlants, updatePlant } from "../services/gardenApi";
import "../styles/MatchPlant.css";

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

  function handleRestartChat() {
  setStep(0);
  setAnswers({});
  setFinished(false);
  setRecommendations([]);
  setLoading(false);
  setError("");
}

  return (
    <div className="match-wrapper">
      <div className="match-card">
        <div className="match-badge">AI POWERED</div>
        <div className="garden-topbar">
          <h2>Find Your Perfect Plant</h2>
            <button
              className="secondary-button"
              onClick={handleRestartChat}
          >
            Start Again
          </button>
        </div>

        <div className="chat-window">

          <div className="chat-scroll">

              <>
                <div className="chat-block">
                  <div className="chat-bubble bot">
                    Welcome to FloraMatch — your plant matchmaker 🌷<br /><br />
                    I’ll help you find the perfect plant based on your lifestyle and preferences.
                  </div>
                </div>
                  
                {QUESTIONS.slice(0, step + 1).map((q, idx) => {

                  const savedValue = answers[q.key];
                  const isCurrent = idx === step;

                  return (
                    <div key={q.key} className="chat-block">

                      <div className="chat-bubble bot">
                        {q.question}
                      </div>

                      {isCurrent && typeof savedValue === "undefined" && (
                      <div className="chat-options">
                        {q.options.map((option) => (
                          <button
                            key={option}
                            className={`primary-button ${
                              savedValue === option ? "selected" : ""
                            }`}
                            onClick={() => handleOptionSelect(option)}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                      )}
                      {savedValue && (
                        <div className="chat-bubble user">
                          {String(savedValue)}
                        </div>
                      )}

                    </div>
                  );
                })}

                {loading && (
                  <div className="chat-bubble bot typing">
                    Generating recommendations...
                  </div>
                )}
              </>

            {recommendations.length > 0 && (
              <div className="chat-block">
                <div className="chat-bubble bot">
                  I found these plants for you 🌿🌿🌿
                </div>

                <div className="recommendation-grid">
                  {recommendations.map((plant) => (
                    <div key={plant.id} className="rec-card">
                      <h3>{plant.name}</h3>
                      <p>{plant.description}</p>

                      <div className="rec-meta">
                        ☀️ {plant.sunlight} · 💧 {plant.watering}
                      </div>

                      <button
                        className="primary-button"
                        onClick={() => openAddtoGardenModal(plant)}
                      >
                        Add to Garden
                      </button>
                    </div>
                  ))}
                </div>

              </div>
            )}

          </div>

          <div className="chat-input-bar">
            <input
              type="text"
              placeholder="Type a message..."
              disabled
            />
            <button className="primary-button" disabled>
              Send
            </button>
          </div>

        </div>
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
              <button className="primary-button" onClick={handleConfirmSaveToGarden}>Save to Garden</button>
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


export default MatchPlantSection;