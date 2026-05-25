import { useState } from "react";

import NavbarDashboard from "../components/NavbarDashboard";
import GardenSection from "../components/GardenSection";
import MatchPlantSection from "../components/MatchPlantSection";
import "../styles/Dashboard.css";

function Dashboard() {

  const [activeTab, setActiveTab] =
    useState("match");

  return (
    <div className="dashboard-page">

      <NavbarDashboard
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="dashboard-main">

        <section className="dashboard-hero">

          <h1>
            Welcome back to FloraMatch
          </h1>

          <p>
            Your AI-powered plant companion.
          </p>

        </section>

        <section className="dashboard-content">

          {activeTab === "match" && (
            <MatchPlantSection />
          )}

          {activeTab === "garden" && (
            <GardenSection />
          )}

        </section>

      </main>

    </div>
  );
}

export default Dashboard;