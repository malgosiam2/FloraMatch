import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";

function NavbarDashboard({
  activeTab,
  setActiveTab
}) {

  async function handleLogout() {

    await signOut(auth);

    window.location.href = "/";
  }

  return (
    <header className="dashboard-navbar">

      <div className="dashboard-logo">
        🌿 FloraMatch
      </div>

      <nav className="dashboard-nav">

        <button
          className={
            activeTab === "match"
              ? "nav-button active"
              : "nav-button"
          }
          onClick={() => setActiveTab("match")}
        >
          Match Plant
        </button>

        <button
          className={
            activeTab === "garden"
              ? "nav-button active"
              : "nav-button"
          }
          onClick={() => setActiveTab("garden")}
        >
          My Garden
        </button>

      </nav>

      <button
        className="logout-button"
        onClick={handleLogout}
      >
        Logout
      </button>

    </header>
  );
}

export default NavbarDashboard;