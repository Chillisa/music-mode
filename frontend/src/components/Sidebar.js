import React from "react";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();
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

      {/* TITLE */}
      <h2 className="sidebar-title">Your library</h2>

      {/* CREATE BUTTON */}
      <button className="side-btn" onClick={() => navigate("/create")}>
        + Create
      </button>

      {/* ARTIST BUTTONS */}
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

      {/* PLAYLISTS */}
      <div className="playlist-section">
        <div className="playlist-card">
          <h3>Favorite songs</h3>
          <p>Playlist · 24 songs</p>
        </div>
      </div>

    </div>
  );
}
