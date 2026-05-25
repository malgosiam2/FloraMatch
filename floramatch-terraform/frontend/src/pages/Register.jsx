import { useState } from "react";

import {
  createUserWithEmailAndPassword
} from "firebase/auth";

import { auth } from "../services/firebase";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Register() {

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const register = async () => {

    try {

      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      alert("Account created!");

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

          <h1>Create account</h1>

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

          <button onClick={register}>
            Register
          </button>

        </div>

      </div>

      <Footer />

    </div>
  );
}

export default Register;