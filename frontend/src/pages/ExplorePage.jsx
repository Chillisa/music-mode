// src/pages/ExplorePage.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import PlayerBar from "../components/PlayerBar";
import axios from "axios";

import { searchAll, searchByGenre } from "../api/searchApi";
import "./ExplorePage.css";
import { useNavigate } from "react-router-dom";

export default function ExplorePage() {
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
  const [customGenre, setCustomGenre] = useState("");

  const [displayAlbums, setDisplayAlbums] = useState([]);
  const [displaySongs, setDisplaySongs] = useState([]);

  // 🔹 Load all albums initially (Trending)
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/albums");
        setDisplayAlbums(res.data || []);
      } catch (err) {
        console.error("Failed to fetch albums:", err);
      }
    };
    fetchAlbums();
  }, []);

  // ===============================
  // SEARCH (songs + albums)
  // ===============================
  const handleSearchChange = async (value) => {
    setSearchQuery(value);
    setSelectedGenre("");
    setCustomGenre("");

    if (!value.trim()) {
      // reset to trending albums, no songs
      try {
        const res = await axios.get("http://localhost:5000/api/albums");
        setDisplayAlbums(res.data || []);
        setDisplaySongs([]);
      } catch (err) {
        console.error("Failed to reset albums:", err);
      }
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

  // ===============================
  // GENRE CLICK
  // ===============================
  const handleGenreClick = async (genre) => {
    const toggle = selectedGenre === genre ? "" : genre;
    setSelectedGenre(toggle);
    setSearchQuery("");
    setCustomGenre("");

    if (!toggle) {
      // reset to trending albums
      try {
        const res = await axios.get("http://localhost:5000/api/albums");
        setDisplayAlbums(res.data || []);
        setDisplaySongs([]);
      } catch (err) {
        console.error("Failed to reset albums:", err);
      }
      return;
    }

    try {
      const res = await searchByGenre(toggle);
      setDisplayAlbums(res.albums || []);
      setDisplaySongs(res.songs || []);
    } catch (err) {
      console.error("Genre filter error:", err);
    }
  };

  // ===============================
  // CUSTOM GENRE
  // ===============================
  const handleCustomGenre = async (value) => {
    setCustomGenre(value);
    setSelectedGenre("");
    setSearchQuery("");

    if (!value.trim()) {
      try {
        const res = await axios.get("http://localhost:5000/api/albums");
        setDisplayAlbums(res.data || []);
        setDisplaySongs([]);
      } catch (err) {
        console.error("Failed to reset albums:", err);
      }
      return;
    }

    try {
      const res = await searchByGenre(value);
      setDisplayAlbums(res.albums || []);
      setDisplaySongs(res.songs || []);
    } catch (err) {
      console.error("Custom genre filter error:", err);
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

        {/* GENRES */}
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

        {/* CUSTOM GENRE */}
        <div className="custom-genre-box">
          <input
            type="text"
            className="custom-genre-input"
            placeholder="Type any genre…"
            value={customGenre}
            onChange={(e) => handleCustomGenre(e.target.value)}
          />
        </div>

        {/* SONG RESULTS */}
        {(searchQuery || selectedGenre || customGenre) && (
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
                  onClick={() => {
                    if (!song.albumId) {
                      alert("This song is not part of an album.");
                      return;
                    }
                    navigate(`/album/${song.albumId}`);
                  }}
                >
                  🎵 {song.title}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ALBUM RESULTS */}
        <h2 className="section-title">
          {searchQuery || selectedGenre || customGenre
            ? "Albums"
            : "Trending Albums"}
        </h2>

        {displayAlbums.length === 0 && (
          <p className="empty-text">No albums found.</p>
        )}

        <div className="album-grid">
          {displayAlbums.map((album) => (
            <div
              key={album._id}
              className="album-card"
              onClick={() => navigate(`/album/${album._id}`)}
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
