import { useState, useEffect, useRef } from "react";
import { getRecommendations, getChatRecommendation } from "../services/recommendationAPI";
import { addPlant, getPlants } from "../services/gardenApi";
import "../styles/MatchPlant.css";

const QUESTIONS = [
  { key: "location", question: "Where will your plant live?", options: ["indoor", "balcony", "garden"] },
  { key: "sunlight", question: "How much sunlight is available?", options: ["low", "medium", "high"] },
  { key: "watering", question: "How often do you want to water the plant?", options: ["low", "medium", "high"] },
  { key: "plantSize", question: "Preferred plant size?", options: ["small", "medium", "large"] },
  { key: "flowering", question: "Do you want flowering plants?", options: ["yes", "no"] }
];

function MatchPlantSection() {

  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem("floramatch_sessions");
    return saved ? JSON.parse(saved) : [];
  });
  const [currentSessionId, setCurrentSessionId] = useState(null);

  const [messages, setMessages] = useState([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);

  const [customPrompt, setCustomPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedPlantToSave, setSelectedPlantToSave] = useState(null);
  const [nicknameInput, setNicknameInput] = useState("");
  const [customAlert, setCustomAlert] = useState({ show: false, message: "", isSuccess: true });

  const [sessionToDelete, setSessionToDelete] = useState(null);

  const [showHistory, setShowHistory] = useState(false);

  const lastCreatedRef = useRef(0);

  const saveSessions = (updated) => {
    setSessions(updated);
    localStorage.setItem("floramatch_sessions", JSON.stringify(updated));
  };

  const triggerDeleteSession = (session, e) => {
    e.stopPropagation();
    setSessionToDelete(session);
  };

  const handleConfirmDelete = () => {
    if (!sessionToDelete) return;

    const id = sessionToDelete.id;
    const updated = sessions.filter(s => s.id !== id);
    saveSessions(updated);

    if (currentSessionId === id) {
      setCurrentSessionId(null);
      setMessages([]);
      setFinished(false);
      setStep(0);
      setAnswers({});
      setError("");
    }

    setSessionToDelete(null);
  };

  const startNewForm = () => {
    const now = Date.now();
    if (now - lastCreatedRef.current < 800) return;
    lastCreatedRef.current = now;

    const newSession = {
      id: "session_" + now,
      title: "📋 Form Match " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: "form",
      messages: [],
      finished: false,
      step: 0,
      answers: {}
    };
    const updated = [newSession, ...sessions];
    saveSessions(updated);
    setCurrentSessionId(newSession.id);
    setMessages([]);
    setFinished(false);
    setStep(0);
    setAnswers({});
    setError("");
  };

  const startNewChat = () => {
    const now = Date.now();
    if (now - lastCreatedRef.current < 800) return;
    lastCreatedRef.current = now;

    const newSession = {
      id: "session_" + now,
      title: "💬 Chat " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: "chat",
      messages: [{ role: "bot", text: "Welcome to FloraMatch Chat! Ask me anything about plants. 🌷" }],
      finished: true,
      step: 0,
      answers: {}
    };
    const updated = [newSession, ...sessions];
    saveSessions(updated);
    setCurrentSessionId(newSession.id);
    setMessages(newSession.messages);
    setFinished(true);
    setError("");
  };

  const loadSession = (id) => {
    const s = sessions.find(item => item.id === id);
    if (!s) return;
    setCurrentSessionId(id);
    setMessages(s.messages || []);
    setFinished(s.finished);
    setStep(s.step || 0);
    setAnswers(s.answers || {});
    setError("");
  };

  const updateActiveSession = (updatedMessages, extraFields = {}) => {
    setMessages(updatedMessages);
    const updatedSessions = sessions.map(s => {
      if (s.id === currentSessionId) {
        let title = s.title;
        if (s.type === "chat" && s.title.includes("Chat ")) {
          const firstUser = updatedMessages.find(m => m.role === "user");
          if (firstUser) title = "💬 " + (firstUser.text.slice(0, 18) + "...");
        }
        return { ...s, messages: updatedMessages, ...extraFields, title };
      }
      return s;
    });
    saveSessions(updatedSessions);
  };

  function handleOptionSelect(option) {
    const currentQuestion = QUESTIONS[step];
    const updatedAnswers = {
      ...answers,
      [currentQuestion.key]: currentQuestion.key === "flowering" ? option === "yes" : option
    };
    setAnswers(updatedAnswers);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
      updateActiveSession(messages, { step: step + 1, answers: updatedAnswers });
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
      
      const botReply = {
        role: "bot",
        text: data.aiMessage || "Here are the plants matching your criteria from our inventory database: 🌿🌿🌿",
        recommendations: data.recommendations || []
      };

      const historyMessages = [];
      QUESTIONS.forEach(q => {
        historyMessages.push({ role: "bot", text: q.question });
        historyMessages.push({ role: "user", text: String(finalAnswers[q.key]) });
      });
      historyMessages.push(botReply);

      updateActiveSession(historyMessages, { finished: true, answers: finalAnswers });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCustomPromptSubmit(e) {
    if (e) e.preventDefault();
    if (!customPrompt.trim()) return;

    const userMsg = { role: "user", text: customPrompt };
    const updatedWithUser = [...messages, userMsg];
    
    setMessages(updatedWithUser);
    setCustomPrompt("");
    setLoading(true);
    setError("");

    try {
      const cleanHistory = updatedWithUser
        .filter(m => m.text)
        .map(m => ({
          role: m.role === "user" ? "user" : "model",
          text: m.text
        }));
      
      cleanHistory.pop();

      const data = await getChatRecommendation(customPrompt, cleanHistory);
      
      const botMsg = {
        role: "bot",
        text: data.aiMessage || "",
        recommendations: data.recommendations || []
      };

      updateActiveSession([...updatedWithUser, botMsg]);
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
          message: `The nickname "${nicknameInput.trim()}" is already taken!`,
          isSuccess: false
        });
        return;
      }

      // POPRAWIONY OBIEKT PLANTDATA W MatchPlantSection.jsx[cite: 2]
      const plantData = {
        plantId: selectedPlantToSave.name ? selectedPlantToSave.name.trim() : "Generic Plant", 
        nickname: nicknameInput.trim(),
        notes: selectedPlantToSave.description ? selectedPlantToSave.description.trim() : "",
        
        // Rozdzielamy typ lokalizacji od opisu tekstowego, aby odznaka (badge) na karcie działała poprawnie[cite: 1, 2]
        location: selectedPlantToSave.location || answers.location || "",
        locationType: extractKeyword(selectedPlantToSave.location || answers.location),
        
        // Przekazywanie sunlight i watering[cite: 2]
        sunlight: extractKeyword(selectedPlantToSave.sunlight || answers.sunlight),
        watering: extractKeyword(selectedPlantToSave.watering || answers.watering),
        
        // Przekazujemy plantSize zgodnie z camelCase używanym w komponencie PlantCard[cite: 1, 2]
        plant_size: extractKeyword(selectedPlantToSave.plant_size || answers.plantSize),
        plantSize: extractKeyword(selectedPlantToSave.plant_size || answers.plantSize),
        
        // Zmieniamy Boolean (true/false) na string ("yes"/"no"), którego szuka PlantCard w warunku plant.flowering === "yes"[cite: 1, 2]
        flowering: (selectedPlantToSave.flowering === true || answers.flowering === true || selectedPlantToSave.flowering === "yes" || answers.flowering === "yes") ? "yes" : "no",
        
        pet_friendly: selectedPlantToSave.pet_friendly ?? false
      };

      await addPlant(plantData);
      setSelectedPlantToSave(null); 
      setCustomAlert({ show: true, message: `"${plantData.nickname}" added! 🌱`, isSuccess: true });
    } catch (err) {
      setCustomAlert({ show: true, message: "Could not add plant: " + err.message, isSuccess: false });
    }
  }

  return (
    <div className="match-layout-container" style={{ display: "flex", gap: "20px", maxWidth: "1200px", margin: "0 auto", width: "100%", alignItems: "flex-start" }}>
      
      {}
      <div className="match-wrapper" style={{ flex: 1, minWidth: 0 }}>
        <div className="match-card">
          <div className="match-badge">AI POWERED</div>
          <div className="garden-topbar">
            <h2>FloraMatch Assistant</h2>

          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
              flexWrap: "wrap"
            }}
          >
            <button
              className="secondary-button"
              onClick={() => setShowHistory(true)}
            >
              🕘 History
            </button>

            <button
              className="primary-button"
              style={{ fontSize: "14px" }}
              onClick={() => {
                setShowHistory(false);
                startNewForm();
              }}
            >
              🌱 New Form Match
            </button>

            <button
              className="secondary-button"
              onClick={() => {
                setShowHistory(false);
                startNewChat();
              }}
            >
              💬 New Direct Chat
            </button>
          </div>

          </div>

          <div className="chat-window">
            <div className="chat-scroll">
              
              {!currentSessionId && (
                <div style={{ textAlign: "center", padding: "40px 10px", color: "gray" }}>
                  <div style={{ fontSize: "40px", padding: "20px"}}>💐🌷🌹🌸🌺</div>
                  <p>Please select an option to start matching plants.</p>
                </div>
              )}

              {currentSessionId && !finished && (
                <>
                  <div className="chat-block">
                    <div className="chat-bubble bot">
                      Welcome to FloraMatch — your plant matchmaker 🌷<br /><br />
                      I’ll help you find the perfect plant based on your lifestyle.
                    </div>
                  </div>
                    
                  {QUESTIONS.slice(0, step + 1).map((q, idx) => {
                    const savedValue = answers[q.key];
                    const isCurrent = idx === step;
                    return (
                      <div key={q.key} className="chat-block">
                        <div className="chat-bubble bot">{q.question}</div>
                        {isCurrent && typeof savedValue === "undefined" && (
                          <div className="chat-options">
                            {q.options.map((option) => (
                              <button key={option} className="primary-button" onClick={() => handleOptionSelect(option)}>{option}</button>
                            ))}
                          </div>
                        )}
                        {savedValue && <div className="chat-bubble user">{String(savedValue)}</div>}
                      </div>
                    );
                  })}
                </>
              )}

              {currentSessionId && finished && messages.map((msg, idx) => (
                <div key={idx} className="chat-block" style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: "15px" }}>
                  {msg.text && (
                    <div className={`chat-bubble ${msg.role}`}>
                      {msg.role === "bot" && <strong>FloraMatch AI Assistant:<br/></strong>}
                      {msg.text}
                    </div>
                  )}
                  
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="recommendation-grid" style={{ width: "100%", marginTop: "10px" }}>
                      {msg.recommendations.map((plant, index) => (
                        <div key={index} className="rec-card">
                          {}
                          <h3 style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", margin: "0 0 10px 0" }}>
                            <span>{plant.name}</span>
                            {plant.ai_generated && (
                              <span style={{ 
                                fontSize: "11px", 
                                backgroundColor: "#e3f2fd", 
                                color: "#0d47a1", 
                                padding: "3px 8px", 
                                borderRadius: "20px", 
                                border: "1px solid #bbdefb",
                                fontWeight: "600",
                                whiteSpace: "nowrap"
                              }}>
                                ✨ AI Generated
                              </span>
                            )}
                          </h3>
                          <p>{plant.description}</p>
                          <div className="rec-meta">☀️ {plant.sunlight} · 💧 {plant.watering}</div>
                          <button className="primary-button" onClick={() => openAddtoGardenModal(plant)}>Add to Garden</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {loading && <div className="chat-bubble bot typing">Generating response...</div>}
              {error && <div className="chat-bubble bot" style={{ backgroundColor: "#ffdddd", color: "red" }}>Error: {error}</div>}
            </div>

            {currentSessionId && finished && (
              <form onSubmit={handleCustomPromptSubmit} className="chat-input-bar">
                <input
                  type="text"
                  placeholder="Ask for changes or details (e.g. Give me something else, make it pet friendly)..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  disabled={loading}
                />
                <button type="submit" className="primary-button" disabled={loading || !customPrompt.trim()}>Send</button>
              </form>
            )}

          </div>
        </div>
      </div>


      {}
      {sessionToDelete && (
        <div className="custom-alert-overlay" style={overlayStyle}>
          <div className="custom-alert-box" style={boxStyle}>
            <div style={{ fontSize: "40px" }}>🗑️</div>
            <h3 style={{ marginTop: "10px" }}>Delete Conversation?</h3>
            <p style={{ fontSize: "14px", color: "#555", marginBottom: "20px" }}>
              Are you sure you want to permanently delete <strong>{sessionToDelete.title}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button className="secondary-button" onClick={() => setSessionToDelete(null)}>Cancel</button>
              <button className="primary-button" style={{ backgroundColor: "#cc0000", borderColor: "#cc0000" }} onClick={handleConfirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {}
      {selectedPlantToSave && (
        <div className="custom-alert-overlay" style={overlayStyle}>
          <div className="custom-alert-box" style={boxStyle}>
            <div style={{ fontSize: "40px" }}>🪴</div>
            <h3 style={{ marginTop: "10px" }}>Name Your New Plant</h3>
            <input
              type="text" placeholder="Give it a nickname..." value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", marginBottom: "15px" }} required
            />
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button className="secondary-button" onClick={() => setSelectedPlantToSave(null)}>Cancel</button>
              <button className="primary-button" onClick={handleConfirmSaveToGarden}>Save</button>
            </div>
          </div>
        </div>
      )}

      {customAlert.show && (
        <div className="custom-alert-overlay" style={overlayStyle}>
          <div className="custom-alert-box" style={boxStyle}>
            <h3>{customAlert.isSuccess ? "Success!" : "Notice"}</h3>
            <p>{customAlert.message}</p>
            <button className="primary-button" onClick={() => setCustomAlert({ show: false, message: "", isSuccess: true })}>OK</button>
          </div>
        </div>
      )}

      {showHistory && (
      <div className="history-drawer-overlay" onClick={() => setShowHistory(false)}>
        <div className="history-drawer" onClick={(e) => e.stopPropagation()}>
          
          <div className="history-header">
            <h3>Your Conversations</h3>
            <button onClick={() => setShowHistory(false)}>✕</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
            <button
              className="primary-button"
              style={{ width: "100%", fontSize: "13px" }}
              onClick={() => {
                setShowHistory(false);
                startNewForm();
              }}
            >
              🌱 New Form Match
            </button>

            <button
              className="secondary-button"
              style={{ width: "100%", fontSize: "13px" }}
              onClick={() => {
                setShowHistory(false);
                startNewChat();
              }}
            >
              💬 New Direct Chat
            </button>
          </div>

          <div
            style={{
              overflowY: "auto",
              maxHeight: "450px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              marginTop: "15px",
              paddingTop: "5px"
            }}
          >
            {sessions.map(s => (
              <div
                key={s.id}
                onClick={() => {
                  loadSession(s.id);
                  setShowHistory(false);
                }}
                style={{
                  padding: "10px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                  backgroundColor: currentSessionId === s.id ? "#e8f5e9" : "#f8f9fa",
                  border: currentSessionId === s.id ? "1px solid #4CAF50" : "1px solid transparent",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "10px"
                }}
              >
                {/* TITLE */}
                <span
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    flex: 1
                  }}
                  title={s.title}
                >
                  {s.title}
                </span>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    triggerDeleteSession(s, e);
                    setShowHistory(false);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#cc0000",
                    cursor: "pointer",
                    fontWeight: "bold",
                    padding: "0 5px",
                    fontSize: "16px",
                    lineHeight: "1"
                  }}
                  title="Delete this conversation"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}

    </div>

    
  );
}



const overlayStyle = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 };
const boxStyle = { backgroundColor: "white", padding: "30px", borderRadius: "12px", textAlign: "center", maxWidth: "350px", width: "90%" };

export default MatchPlantSection;