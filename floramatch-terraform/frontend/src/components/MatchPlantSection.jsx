import { useState } from "react";

import {
  getRecommendations
} from "../services/recommendationAPI";

function MatchPlantSection() {

  const [prompt, setPrompt] =
    useState("");

  const [recommendations,
    setRecommendations] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleGenerate() {

    try {

      setLoading(true);

      setError("");

      const data =
        await getRecommendations(prompt);

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

        <p>
          Describe your room,
          lifestyle,
          sunlight conditions
          and preferences.
        </p>

        <textarea

          value={prompt}

          onChange={(e) =>
            setPrompt(e.target.value)
          }

          placeholder="Example: I need a small plant for a dark bedroom that requires little watering..."

        />

        <button
          className="primary-button"
          onClick={handleGenerate}
        >

          {loading
            ? "Loading..."
            : "Generate Recommendations"}

        </button>

        {error && (
          <p style={{ color: "red" }}>
            {error}
          </p>
        )}

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

            </div>

          ))}

        </div>

      </div>

    </div>

  );

}

export default MatchPlantSection;