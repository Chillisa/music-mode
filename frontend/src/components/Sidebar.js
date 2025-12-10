import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));
  const isArtist = user?.role === "artist";

  return (
    <div className="sidebar">

      {/* TOP ICON BUTTONS */}
      <div className="sidebar-icons">
        <div className="icon-btn" onClick={() => navigate("/home")}>🏠</div>
        <div className="icon-btn" onClick={() => navigate("/profile")}>👤</div>
        <div className="icon-btn" onClick={() => navigate("/player")}>▶</div>
      </div>

      <h2 className="sidebar-title">Your library</h2>

      {/* YOUR PLAYLISTS  (FIXED ROUTE) */}
      <div
        className={`sidebar-item ${location.pathname === "/your-playlists" ? "active" : ""}`}
        onClick={() => navigate("/your-playlists")}
      >
        🎧 Your Playlists
      </div>

      {/* ARTIST ONLY BUTTONS */}
      {isArtist && (
        <>
          <button
            className="side-btn"
            onClick={() => navigate("/upload")}
          >
            🎵 Upload Album
          </button>

          <button
            className="side-btn"
            onClick={() => navigate("/artist-library")}
          >
            📚 Your Albums
          </button>
        </>
      )}

      {/* FAVORITES */}
      <div
        className={`playlist-card ${location.pathname === "/favorites" ? "active" : ""}`}
        onClick={() => navigate("/favorites")}
      >
        <h3>Favorite songs</h3>
        <p>Playlist</p>
      </div>

    </div>
  );
}
