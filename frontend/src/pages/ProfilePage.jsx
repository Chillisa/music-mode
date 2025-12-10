import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfilePage.css";

function ProfilePage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [username, setUsername] = useState(user?.username || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

const [usernameError, setUsernameError] = useState("");
const [usernameSuccess, setUsernameSuccess] = useState("");

const [passwordError, setPasswordError] = useState("");
const [passwordSuccess, setPasswordSuccess] = useState("");

const [email, setEmail] = useState(user?.email || "");
const [emailPassword, setEmailPassword] = useState("");

const [emailError, setEmailError] = useState("");
const [emailSuccess, setEmailSuccess] = useState("");

const [notifications, setNotifications] = useState(false);

// Load user settings from backend
useEffect(() => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    setNotifications(user.email_notifications === 1);
  }
}, []);

const toggleNotifications = async () => {
  const newValue = !notifications;
  setNotifications(newValue);

  const res = await fetch("http://localhost:5000/api/auth/update-notifications", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ enabled: newValue }),
  });

  const data = await res.json();

  // Update localStorage user
  const updatedUser = JSON.parse(localStorage.getItem("user"));
  updatedUser.email_notifications = newValue ? 1 : 0;
  localStorage.setItem("user", JSON.stringify(updatedUser));
};


  // UPDATE USERNAME
  const handleUsernameUpdate = async () => {
  setUsernameError("");
  setUsernameSuccess("");

  try {
    const res = await fetch("http://localhost:5000/api/auth/update-username", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ username }),
    });

    const data = await res.json();

    if (!res.ok) {
      setUsernameError(data.message || "Failed to update username");
      return;
    }

    localStorage.setItem("user", JSON.stringify(data.user));
    setUsernameSuccess("Username updated successfully!");
  } catch (err) {
    setUsernameError("Something went wrong.");
  }
};

const handleEmailUpdate = async () => {
  setEmailError("");
  setEmailSuccess("");

  try {
    const res = await fetch("http://localhost:5000/api/auth/update-email", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ newEmail: email, password: emailPassword }),
    });

    const data = await res.json();

    if (!res.ok) {
      return setEmailError(data.message || "Failed to update email");
    }

    // Update localStorage
    const updatedUser = JSON.parse(localStorage.getItem("user"));
    updatedUser.email = email;
    localStorage.setItem("user", JSON.stringify(updatedUser));

    setEmailSuccess("Email updated successfully!");
    setEmailPassword("");

  } catch (err) {
    setEmailError("Something went wrong.");
  }
};

  // UPDATE PASSWORD
  const handlePasswordUpdate = async () => {
  setPasswordError("");
  setPasswordSuccess("");

  if (newPassword !== confirmPassword) {
    return setPasswordError("New passwords do not match.");
  }

  try {
    const res = await fetch("http://localhost:5000/api/auth/update-password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await res.json();

    if (!res.ok) {
      setPasswordError(data.message || "Failed to update password");
      return;
    }

    setPasswordSuccess("Password updated successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  } catch (err) {
    setPasswordError("Something went wrong.");
  }
};

  const handleLogout = () => {
    if (!window.confirm("Are you sure you want to logout?")) return;

    localStorage.clear();
    navigate("/login");
  };

  return (
  <div className="profile-page">

    <h1 className="profile-title">Profile Settings</h1>


    {/* USERNAME CARD */}
    <div className="profile-card">
      <h2 className="section-title">Change Username</h2>
{usernameError && <p className="error-msg">{usernameError}</p>}
{usernameSuccess && <p className="success-msg">{usernameSuccess}</p>}

      <input
        className="profile-input"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <button className="profile-btn" onClick={handleUsernameUpdate}>
        Update Username
      </button>
    </div>

{/* EMAIL CARD */}
<div className="profile-card">
  <h2 className="section-title">Change Email</h2>

  {emailError && <p className="error-msg">{emailError}</p>}
  {emailSuccess && <p className="success-msg">{emailSuccess}</p>}

  <input
    className="profile-input"
    type="email"
    placeholder="New email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />

  <input
    className="profile-input"
    type="password"
    placeholder="Enter password to confirm"
    value={emailPassword}
    onChange={(e) => setEmailPassword(e.target.value)}
  />

  <button className="profile-btn" onClick={handleEmailUpdate}>
    Update Email
  </button>
</div>

    {/* PASSWORD CARD */}
    <div className="profile-card">
      <h2 className="section-title">Change Password</h2>
{passwordError && <p className="error-msg">{passwordError}</p>}
{passwordSuccess && <p className="success-msg">{passwordSuccess}</p>}

      <input
        className="profile-input"
        type="password"
        placeholder="Current password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
      />

      <input
        className="profile-input"
        type="password"
        placeholder="New password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />

      <input
        className="profile-input"
        type="password"
        placeholder="Confirm new password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <button className="profile-btn" onClick={handlePasswordUpdate}>
        Update Password
      </button>
    </div>

    {/* SETTINGS CARD */}
    <div className="profile-card">
  <h2 className="section-title">Settings</h2>

  <label className="setting-option">
    <input type="checkbox" disabled /> Dark mode (coming soon)
  </label>

  <label className="setting-option">
    <input 
      type="checkbox"
      checked={notifications}
      onChange={toggleNotifications}
    /> 
    Email notifications
  </label>
</div>


    {/* LOGOUT */}
    <button className="logout-btn" onClick={handleLogout}>
      Logout
    </button>

  </div>
);
}
export default ProfilePage;
