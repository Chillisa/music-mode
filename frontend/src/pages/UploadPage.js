import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import PlayerBar from "../components/PlayerBar";

import { createAlbum } from "../api/albumApi";
import { uploadSong } from "../api/songApi";

import "./UploadPage.css";

export default function UploadPage() {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const username = storedUser?.username || "User";

  // -----------------------------
  // ALL HOOKS MUST COME FIRST
  // -----------------------------
  const [albumTitle, setAlbumTitle] = useState("");
  const [albumDesc, setAlbumDesc] = useState("");
  const [cover, setCover] = useState(null);

  const [tracks, setTracks] = useState([
    { title: "", file: null },
  ]);

  const [loading, setLoading] = useState(false);

  // -----------------------------
  // AFTER hooks → check access
  // -----------------------------
  if (storedUser?.role !== "artist") {
    return (
      <div className="upload-container">
        <Sidebar />
        <div className="upload-main">
          <TopBar username={username} />
          <div className="upload-content">
            <h2>You must be an Artist to upload albums.</h2>
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------
  // Track functions
  // -----------------------------
  const addTrack = () => {
    if (tracks.length >= 25) return alert("Maximum 25 songs allowed");
    setTracks([...tracks, { title: "", file: null }]);
  };

  const removeTrack = (index) => {
    const updated = [...tracks];
    updated.splice(index, 1);
    setTracks(updated);
  };

  const updateTrackTitle = (index, value) => {
    const updated = [...tracks];
    updated[index].title = value;
    setTracks(updated);
  };

  const updateTrackFile = (index, file) => {
    const updated = [...tracks];
    updated[index].file = file;
    setTracks(updated);
  };

  // -----------------------------
  // Upload handler
  // -----------------------------
  const handleUpload = async () => {
    if (!albumTitle) return alert("Album title is required");
    if (!cover) return alert("Album cover is required");

    if (tracks.some(t => !t.file))
      return alert("One or more songs have no file");
    if (tracks.some(t => !t.title.trim()))
      return alert("One or more songs have no title");

    setLoading(true);

    try {
      // 1) Create album
      const albumForm = new FormData();
      albumForm.append("title", albumTitle);
      albumForm.append("description", albumDesc);
      albumForm.append("cover", cover);

      const res = await createAlbum(albumForm);
      const albumId = res.album._id;

      // 2) Upload songs
      for (let t of tracks) {
        const songForm = new FormData();
        songForm.append("audio", t.file);
        songForm.append("title", t.title);
        /*songForm.append("artist", username);*/
        songForm.append("albumId", albumId);

        await uploadSong(songForm);
      }

      alert("Album uploaded successfully!");
      setAlbumTitle("");
      setAlbumDesc("");
      setCover(null);
      setTracks([{ title: "", file: null }]);

    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    }

    setLoading(false);
  };

  // -----------------------------
  // Render UI
  // -----------------------------
  return (
    <div className="upload-container">
      <Sidebar />

      <div className="upload-main">
        <TopBar username={username} />

        <div className="upload-content">

          <h1 className="upload-title">Upload a New Album</h1>

          {/* Album Title */}
          <label className="upload-label">Album Title</label>
          <input
            type="text"
            className="upload-input"
            value={albumTitle}
            onChange={(e) => setAlbumTitle(e.target.value)}
          />

          {/* Description */}
          <label className="upload-label">Description</label>
          <textarea
            className="upload-input"
            value={albumDesc}
            onChange={(e) => setAlbumDesc(e.target.value)}
          ></textarea>

          {/* Cover */}
          <label className="upload-label">Album Cover</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCover(e.target.files[0])}
          />

          {/* SONG LIST */}
          <h2 className="songs-title">Songs</h2>

          {tracks.map((track, index) => (
            <div key={index} className="track-row">
              <div className="track-left">
                <input
                  type="text"
                  placeholder="Song title"
                  className="track-title-input"
                  value={track.title}
                  onChange={(e) => updateTrackTitle(index, e.target.value)}
                />

                <input
                  type="file"
                  name="audio"  
                  accept="audio/mpeg"
                  onChange={(e) => updateTrackFile(index, e.target.files[0])}
                />
              </div>

              {tracks.length > 1 && (
                <button
                  className="remove-track-btn"
                  onClick={() => removeTrack(index)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <button className="add-track-btn" onClick={addTrack}>
            + Add Song
          </button>

          <button
            className="upload-btn"
            onClick={handleUpload}
            disabled={loading}
          >
            {loading ? "Uploading..." : "Create Album"}
          </button>

        </div>

        <PlayerBar />
      </div>
    </div>
  );
}
