import React, { useState } from "react";
import { login } from "../api/authApi";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async () => {
  try {
    const res = await login(form);

    console.log("LOGIN RESPONSE:", res); // just for debugging

    // Save token
    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(res.user));

    // 🟣 NEW: save user object (with username) in localStorage
    if (res.user) {
      localStorage.setItem("user", JSON.stringify(res.user));
    }

    alert("Logged in!");
    navigate("/home");
  } catch (err) {
    console.log("LOGIN ERROR:", err);
    alert("Invalid login.");
  }
};


  return (
    <main className="auth-page">

      <div className="logo-circle">
        <div className="logo-bars">
          <span></span><span></span><span></span>
        </div>
      </div>

      <h2 className="auth-title">Log in to Music Mode</h2>

      <div className="auth-form">

        <label>Email:</label>
        <input
          name="email"
          type="email"
          placeholder="Enter your email"
          className="auth-input"
          onChange={handleChange}
        />

        <label>Password:</label>
        <input
          name="password"
          type="password"
          placeholder="Enter your password"
          className="auth-input"
          onChange={handleChange}
        />

      </div>

      {/* ERROR MESSAGE */}
      {error && <p className="error-text">{error}</p>}

      <button className="btn btn-primary" onClick={handleSubmit}>
        Log in
      </button>

      <p className="auth-switch">
        Don’t have an account?{" "}
        <span onClick={() => navigate("/signup")}>Sign up</span>
      </p>
    </main>
  );
}

export default LoginPage;
