// src/pages/ExplorePage.js
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import PlayerBar from "../components/PlayerBar";
import { searchAll } from "../api/searchApi";
import "./ExplorePage.css";
import { useNavigate } from "react-router-dom";

export default function ExplorePage({ allAlbums = [] }) {
  const navigate = useNavigate();

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

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [displayAlbums, setDisplayAlbums] = useState(allAlbums);
  const [displaySongs, setDisplaySongs] = useState([]);

  // Update album list when passed from parent
  useEffect(() => {
    setDisplayAlbums(allAlbums);
  }, [allAlbums]);

  // 🔍 SEARCH FUNCTION
  const handleSearchChange = async (value) => {
    setSearchQuery(value);
    setSelectedGenre("");

    if (!value.trim()) {
      setDisplayAlbums(allAlbums);
      setDisplaySongs([]);
      return;
    }

    try {
      const res = await searchAll(value);
      setDisplayAlbums(res.albums || []);
      setDisplaySongs(res.songs || []);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  // 🎚 GENRE FILTER
  const handleGenreClick = (genre) => {
    const newGenre = selectedGenre === genre ? "" : genre;
    setSelectedGenre(newGenre);
    setSearchQuery("");

    if (!newGenre) {
      setDisplayAlbums(allAlbums);
    } else {
      setDisplayAlbums(allAlbums.filter((album) => album.genre === newGenre));
    }
  };

  return (
    <div className="page-container">
      <Sidebar />

      <div className="explore-container">
        <TopBar
          username={username}
          searchValue={searchQuery}
          onSearchChange={handleSearchChange}
        />

        <h1 className="page-title">Explore</h1>

        {/* GENRE FILTER BUTTONS */}
        <div className="genre-container">
          {genres.map((g) => (
            <div
              key={g.name}
              className={`genre-pill ${g.class} ${
                selectedGenre === g.name ? "genre-active" : ""
              }`}
              onClick={() => handleGenreClick(g.name)}
            >
              {g.name}
            </div>
          ))}
        </div>

        {/* SEARCH SONG RESULTS */}
        {searchQuery.trim() && (
          <>
            <h2 className="section-title">Songs</h2>
            {displaySongs.length === 0 && (
              <p className="empty-text">No songs found.</p>
            )}

            <div className="song-results">
  {displaySongs.map((song) => (
    <div
      key={song._id}
      className="song-result-item"
      onClick={() => navigate(`/album/${song.albumId}`)}
      style={{ cursor: "pointer" }}
    >
      🎵 {song.title}
    </div>
  ))}
</div>

          </>
        )}

        {/* ALBUM SECTION TITLE */}
        <h2 className="section-title">
          {searchQuery
            ? "Albums"
            : selectedGenre
            ? `${selectedGenre} Albums`
            : "Trending Albums"}
        </h2>

        {displayAlbums.length === 0 && (
          <p className="empty-text">No albums found.</p>
        )}

        {/* 🎉 ALBUM GRID — NOW CLICKABLE */}
        <div className="album-grid">
          {displayAlbums.map((album) => (
            <div
              key={album._id}
              className="album-card"
              onClick={() => navigate(`/album/${album._id}`)}
              style={{ cursor: "pointer" }}
            >
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
