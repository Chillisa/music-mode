import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import PlayerBar from "../components/PlayerBar";
import { useNavigate } from "react-router-dom";

import { getMyAlbums, deleteAlbum } from "../api/albumApi";

import "./ArtistLibraryPage.css";

export default function ArtistLibraryPage() {
  const [albums, setAlbums] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));
  const username = user?.username || "User";
const navigate = useNavigate();

  // ---- ALWAYS RUN HOOKS FIRST ----
  useEffect(() => {
    if (user?.role === "artist") {
      getMyAlbums().then((data) => setAlbums(data));
    }
  }, [user]);

  // ---- ACCESS CHECK (AFTER HOOKS) ----
  if (user?.role !== "artist") {
    return (
      <div className="restricted-container">
        <h1>❌ Only artists can access this page.</h1>
      </div>
    );
  }

  const handleDelete = async (albumId) => {
    if (!window.confirm("Are you sure you want to delete this album? This cannot be undone.")) {
      return;
    }

    await deleteAlbum(albumId);
    setAlbums((prev) => prev.filter((a) => a._id !== albumId));
  };

  return (
    <div className="artistlibrary-container">
      <Sidebar />

      <div className="main-content">
        <TopBar username={username} />

        <h2 className="section-title">Your Albums</h2>

        <div className="artist-album-grid">
          {albums.map((album) => (
            <div key={album._id} className="artist-album-card">
              <img
                src={`http://localhost:5000${album.coverImage}`}
                className="artist-album-cover"
              />

              <div className="artist-album-info">
                <h3>{album.title}</h3>

                <div className="artist-actions">
                  <button 
  onClick={() => navigate(`/album/${album._id}/edit`)} 
  className="artist-btn edit-btn"
>
  ✏ Edit Album
</button>


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
