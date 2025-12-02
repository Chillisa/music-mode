import React, { useState } from "react";
import { signup } from "../api/authApi";
import { useNavigate } from "react-router-dom";
import "./SignupPage.css";

function SignupPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
  username: "",
  email: "",
  password: "",
  role: "user"
});

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // clear error when typing
  };

  /*const handleSubmit = async () => {
    // --- FRONTEND VALIDATION ---
    if (!form.username.trim())
      return setError("Username is required.");

    if (!form.email.includes("@"))
      return setError("Please enter a valid email address.");

    if (form.password.length < 6)
      return setError("Password must be at least 6 characters long.");

    // --- SEND TO BACKEND ---
    try {
      const res = await signup(form);

      // If backend sends custom error
      if (res.error) return setError(res.error);

      navigate("/login");
      
    } catch (err) {
      // Backend sends error message
      const msg = err?.response?.data?.message || "Signup failed. Try again.";
      setError(msg);
    }
  };*/

  const handleSubmit = async () => {
  try {
    const res = await signup(form);
    alert("Account created successfully!");
    navigate("/login");

  } catch (err) {
    console.log("🔴 SIGNUP ERROR:", err);

    // backend error message
    const backendMessage =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      "Unknown server error";

    // http status code
    const status = err?.response?.status;

    setError(`Signup failed (${status}): ${backendMessage}`);
  }
};


  return (
    <main className="auth-page">
      <div className="logo-circle">
        <div className="logo-bars">
          <span></span><span></span><span></span>
        </div>
      </div>

      <h2 className="auth-title">Sign up to get started</h2>

      <div className="auth-form">

        <label>Username:</label>
        <input
          name="username"
          type="text"
          placeholder="Enter your username"
          className="auth-input"
          onChange={handleChange}
        />

        <label>Email address:</label>
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
          placeholder="Enter password"
          className="auth-input"
          onChange={handleChange}
        />

        <label>Role:</label>
<select
  name="role"
  className="auth-input"
  onChange={handleChange}
  defaultValue="user"
>
  <option value="user">User</option>
  <option value="artist">Artist</option>
</select>

      </div>

      {/* Error message */}
      {error && <p className="error-text">{error}</p>}

      <button className="btn btn-primary" onClick={handleSubmit}>
        Sign up
      </button>

      <p className="auth-switch">
        Already have an account?{" "}
        <span onClick={() => navigate("/login")}>Log in</span>
      </p>
    </main>
  );
}

export default SignupPage;
