import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [customAlert, setCustomAlert] = useState({ show: false, message: "", isSuccess: true });

  const login = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      localStorage.setItem("token", token);

      setCustomAlert({
        show: true,
        message: "Welcome back! Successfully logged in.",
        isSuccess: true
      });
    } catch (err) {

      setCustomAlert({
        show: true,
        message: err.message,
        isSuccess: false
      });
    }
  };


  function handleAlertOk() {
    if (customAlert.isSuccess) {
      window.location.href = "/dashboard"; 
    } else {
      setCustomAlert({ show: false, message: "", isSuccess: true }); 
    }
  }

  return (
    <div className="app">
      <Navbar />

      <div className="auth-page">
        <div className="auth-card">
          <h1>Sign In</h1>

          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={login}>
            Login
          </button>
        </div>
      </div>

      <Footer />

      { }
      {customAlert.show && (
        <div className="custom-alert-overlay" style={overlayStyle}>
          <div className="custom-alert-box" style={boxStyle}>
            <div style={{ fontSize: "40px", marginBottom: "10px" }}>
              {customAlert.isSuccess ? "🔓" : "❌"}
            </div>
            <h3>{customAlert.isSuccess ? "Success!" : "Authentication Error"}</h3>
            <p style={{ color: "#555", marginTop: "10px", fontSize: "14px" }}>{customAlert.message}</p>
            <button 
              className="primary-btn" 
              onClick={handleAlertOk} 
              style={{ marginTop: "20px", width: "100%", padding: "10px", border: "none", borderRadius: "4px", backgroundColor: "#2e7d32", color: "white", cursor: "pointer" }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const overlayStyle = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 };
const boxStyle = { backgroundColor: "white", padding: "30px", borderRadius: "12px", textAlign: "center", boxShadow: "0px 4px 20px rgba(0,0,0,0.2)", maxWidth: "350px", width: "90%" };

export default Login;
