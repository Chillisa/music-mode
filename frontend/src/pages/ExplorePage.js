import React from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import PlayerBar from "../components/PlayerBar";
import "./ExplorePage.css";

export default function ExplorePage({ allAlbums = [] }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const username = user?.username || "User";

  const genres = [
    { name: "Rock", class: "genre-rock" },
    { name: "Chill", class: "genre-chill" },
    { name: "Jazz", class: "genre-jazz" },
    { name: "Arabic", class: "genre-arabic" },
    { name: "K-pop", class: "genre-kpop" },
    { name: "Sad", class: "genre-sad" },
    { name: "Energetic", class: "genre-energetic" },
    { name: "Good vibes", class: "genre-goodvibes" },
    { name: "Dark R&B", class: "genre-darkrnb" },
    { name: "Lo-fi", class: "genre-lofi" },
  ];

  return (
    <div className="page-container">
      {/* SIDEBAR FIX */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <div className="explore-container">

        {/* FIXED TOPBAR — NOW SHOWS USERNAME */}
        <TopBar username={username} />

        <h1 className="page-title">Explore</h1>

        {/* GENRES */}
        <div className="genre-container">
          {genres.map((g) => (
            <div key={g.name} className={`genre-pill ${g.class}`}>
              {g.name}
            </div>
          ))}
        </div>

        {/* TRENDING */}
        <h2 className="section-title">Trending Albums</h2>

        <div className="album-grid">
          {allAlbums.map((album) => (
            <div key={album._id} className="album-card">
              <img
                className="album-img"
                src={`http://localhost:5000${album.coverImage}`}
                alt={album.title}
              />
              <div className="album-title">{album.title}</div>
              <div className="album-artist">{album.artist}</div>
            </div>
          ))}
        </div>

        <PlayerBar />
      </div>
    </div>
  );
}
