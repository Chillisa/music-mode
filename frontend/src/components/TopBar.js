import React from "react";
import { useNavigate } from "react-router-dom";
import "./TopBar.css";

function TopBar({ username = "Name of the user" }) {
  const navigate = useNavigate();

  return (
    <div className="topbar">

      {/* Welcome Text */}
      <h1 className="welcome-text">
        Welcome <span className="username">{username}</span>
      </h1>

      {/* Search + Explore */}
      <div className="search-area">
        <input
          type="text"
          className="search-input"
          placeholder="What are you looking for?"
        />

        <button
          className="explore-btn"
          onClick={() => navigate("/explore")}
        >
          <span className="explore-icon">🎧</span>
          Explore
        </button>
      </div>

    </div>
  );
}

export default TopBar;
