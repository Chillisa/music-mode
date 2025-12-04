// src/components/TopBar.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TopBar.css";

function TopBar({ username = "User", searchValue, onSearchChange }) {
  const navigate = useNavigate();
  const [internalSearch, setInternalSearch] = useState("");

  const value = searchValue !== undefined ? searchValue : internalSearch;

  const handleChange = (e) => {
    const v = e.target.value;

    if (onSearchChange) {
      onSearchChange(v);
    } else {
      setInternalSearch(v);
    }
  };

  return (
    <div className="topbar">
      <h1 className="welcome-text">
        Welcome <span className="username">{username}</span>
      </h1>

      <div className="search-area">
        <input
          type="text"
          className="search-input"
          placeholder="What are you looking for?"
          value={value}
          onChange={handleChange}
        />

        <button className="explore-btn" onClick={() => navigate("/explore")}>
          <span className="explore-icon">🎧</span>
          Explore
        </button>
      </div>
    </div>
  );
}

export default TopBar;
