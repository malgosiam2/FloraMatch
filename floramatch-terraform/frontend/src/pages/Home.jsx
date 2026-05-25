import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/App.css";


function Home() {
  return (
    <div className="app">

      <Navbar />

      <main className="hero">

        <div className="hero-content">

          <h1>
            Find the Perfect Plant for Your Space
          </h1>

          <p>
            FloraMatch helps you discover plants that fit your
            lifestyle, lighting conditions, and experience level
            using intelligent AI-powered recommendations.
          </p>

          <div className="hero-buttons">

            <button className="primary-btn">
              Start Growing
            </button>

            <button className="secondary-btn">
              Learn More
            </button>

          </div>

                    <div className="cards">
          <div className="card">
            <h2>Plant Matching 🌿</h2>

            <p style={{ marginTop: "15px" }}>
              Tell us about your room, light conditions,
              and experience level to receive personalized
              plant recommendations.
            </p>
          </div>

            <div className="card">
            <h2>Your Garden in the Cloud 🌷</h2>

            <p style={{ marginTop: "15px" }}>
              Organize and manage all your plants in one place.
              Track your growing collection with ease.
            </p>
          </div>
          </div>

        </div>

      </main>

      <Footer />

    </div>
  );
}

export default Home;