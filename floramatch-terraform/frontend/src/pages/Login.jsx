import { useState } from "react";

import {
  signInWithEmailAndPassword
} from "firebase/auth";

import { auth } from "../services/firebase";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Login() {

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const login = async () => {

    try {

      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

      const token =
        await userCredential.user.getIdToken();

      localStorage.setItem(
        "token",
        token
      );

      alert("Logged in!");
      
      window.location.href = "/dashboard";

    } catch (err) {

      alert(err.message);

    }
  };

  return (
    <div className="app">

      <Navbar />

      <div className="auth-page">

        <div className="auth-card">

          <h1>Sign In</h1>

          <input
            type="email"
            placeholder="Email"
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <input
            type="password"
            placeholder="Password"
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <button onClick={login}>
            Login
          </button>

        </div>

      </div>

      <Footer />

    </div>
  );
}

export default Login;