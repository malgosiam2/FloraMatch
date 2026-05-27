import { useState } from "react";
import {
  getRecommendations
} from "../services/recommendationAPI";

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

  const [recommendations, setRecommendations] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const currentQuestion =
    QUESTIONS[step];

  function handleOptionSelect(option) {

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
      handleGenerate(updatedAnswers);
    }
  }

  async function handleGenerate(finalAnswers) {

    try {

      setLoading(true);

      setError("");

      const data =
        await getRecommendations(finalAnswers);

      setRecommendations(
        data.recommendations || []
      );

    } catch (e) {

      setError(e.message);

    } finally {

      setLoading(false);

    }

  }

  return (

    <div className="match-wrapper">

      <div className="match-card">

        <div className="match-badge">
          AI POWERED
        </div>

        <h2>
          Find Your Perfect Plant
        </h2>

        {!loading && recommendations.length === 0 && (
          <>
            <div
              style={{
                background: "#f6f8f4",
                padding: "24px",
                borderRadius: "18px"
              }}
            >

              <p
                style={{
                  fontWeight: "bold",
                  marginBottom: "20px"
                }}
              >
                {currentQuestion.question}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap"
                }}
              >

                {currentQuestion.options.map(
                  (option) => (
                    <button
                      key={option}
                      className="primary-button"
                      onClick={() =>
                        handleOptionSelect(option)
                      }
                    >
                      {option}
                    </button>
                  )
                )}

              </div>

            </div>
          </>
        )}

        {loading && (
          <p>
            Generating recommendations...
          </p>
        )}

        {error && (
          <p style={{ color: "red" }}>
            {error}
          </p>
        )}

        {recommendations.length > 0 && (

          <div
            style={{
              marginTop: "30px",
              display: "flex",
              flexDirection: "column",
              gap: "20px"
            }}
          >

            {recommendations.map((plant) => (

              <div
                key={plant.id}
                style={{
                  padding: "20px",
                  borderRadius: "16px",
                  background: "#f6f8f4",
                  border:
                    "1px solid #d8e7d3"
                }}
              >

                <h3>
                  {plant.name}
                </h3>

                <p>
                  {plant.description}
                </p>

                <p>
                  ☀️ Sunlight: {plant.sunlight}
                </p>

                <p>
                  💧 Watering: {plant.watering}
                </p>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>

  );

}

export default MatchPlantSection;