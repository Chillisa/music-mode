import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import PlayerBar from "../components/PlayerBar";
import { getMyPlaylists, createPlaylist } from "../api/playlistApi";
import { useNavigate } from "react-router-dom";

import "./YourPlaylistsPage.css";

export default function YourPlaylistsPage() {
  const navigate = useNavigate();

  const [playlists, setPlaylists] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [colorTheme, setColorTheme] = useState("#6a00ff");
  const [coverImage, setCoverImage] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const username = user?.username || "User";

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await getMyPlaylists(); // returns array
      setPlaylists(data || []); // safe
    } catch (err) {
      console.error("LOAD PLAYLISTS ERROR:", err);
      setPlaylists([]);
    }
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) return alert("Playlist name is required");

    if (!coverImage && !colorTheme)
      return alert("Please upload a cover image or choose a color");

    const formData = new FormData();
    formData.append("title", newTitle);
    formData.append("colorTheme", colorTheme);

    if (coverImage) formData.append("coverImage", coverImage);

    await createPlaylist(formData);

    setNewTitle("");
    setCoverImage(null);
    loadData();
  };

  return (
    <div className="page-container">
      <Sidebar />

      <div className="playlists-main">
        <TopBar username={username} />

        <h1 className="page-title">Your Playlists</h1>

        {/* CREATE PLAYLIST BOX */}
        <div className="create-box">
          <input
            type="text"
            placeholder="Playlist name"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />

          <input
            type="color"
            value={colorTheme}
            onChange={(e) => setColorTheme(e.target.value)}
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverImage(e.target.files[0])}
          />

          <button onClick={handleCreate}>Create</button>
        </div>

        {/* PLAYLIST GRID */}
        <div className="playlist-grid">
          {playlists.map((p) => (
            <div
              key={p._id}
              className="playlist-card"
              onClick={() => navigate(`/playlist/${p._id}`)}
            >
              {/* COVER */}
              <div className="playlist-card-cover">
                {p.coverImage ? (
                  <img
                    src={`http://localhost:5000${p.coverImage}`}
                    className="playlist-card-img"
                    alt="playlist"
                  />
                ) : (
                  <div
                    className="playlist-card-color"
                    style={{ backgroundColor: p.colorTheme }}
                  >
                    <span className="playlist-music-icon">🎵</span>
                  </div>
                )}
              </div>

              {/* TITLE */}
              <div className="playlist-card-info">
                <div className="playlist-card-title">{p.title}</div>
                <div className="playlist-card-count">
                  {p.songs.length} songs
                </div>
              </div>
            </div>
          ))}
        </div>

        <PlayerBar />
      </div>
    </div>
  );
}
