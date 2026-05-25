function MatchPlantSection() {

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
          Describe your room, lifestyle,
          sunlight conditions and preferences.
        </p>

        <textarea
          placeholder="Example: I need a small plant for a dark bedroom that requires little watering..."
        />

        <button className="primary-button">
          Generate Recommendations
        </button>

      </div>

    </div>
  );
}

export default MatchPlantSection;