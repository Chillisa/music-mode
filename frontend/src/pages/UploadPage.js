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

  // ⭐ GENRE OPTIONS
  const genreOptions = [
    "Rock",
    "Chill",
    "Jazz",
    "Arabic",
    "K-pop",
    "Sad",
    "Energetic",
    "Good vibes",
    "Dark R&B",
    "Lo-fi",
  ];

  // -----------------------------
  // HOOKS
  // -----------------------------
  const [albumTitle, setAlbumTitle] = useState("");
  const [albumDesc, setAlbumDesc] = useState("");
  const [albumGenre, setAlbumGenre] = useState(""); // ⭐ Default empty
  const [cover, setCover] = useState(null);

  const [tracks, setTracks] = useState([
    { title: "", file: null, genre: "" }, // ⭐ Song genre default empty
  ]);

  const [loading, setLoading] = useState(false);

  // -----------------------------
  // ACCESS CHECK
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
  // TRACK HANDLERS
  // -----------------------------
  const addTrack = () => {
    if (tracks.length >= 25) return alert("Maximum 25 songs allowed");
    setTracks([...tracks, { title: "", file: null, genre: "" }]);
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

  const updateTrackGenre = (index, value) => {
    const updated = [...tracks];
    updated[index].genre = value;
    setTracks(updated);
  };

  const updateTrackFile = (index, file) => {
    const updated = [...tracks];
    updated[index].file = file;
    setTracks(updated);
  };

  // -----------------------------
  // HANDLE UPLOAD PROCESS
  // -----------------------------
  const handleUpload = async () => {
    if (!albumTitle.trim()) return alert("Album title is required");
    if (!cover) return alert("Album cover is required");
    if (!albumGenre.trim()) return alert("Album genre is required");

    for (let t of tracks) {
      if (!t.title.trim()) return alert("Every song must have a title");
      if (!t.file) return alert("Every song needs an audio file");
      if (!t.genre.trim()) return alert("Every song must have a genre");
    }

    setLoading(true);

    try {
      // ⭐ CREATE ALBUM
      const albumForm = new FormData();
      albumForm.append("title", albumTitle);
      albumForm.append("description", albumDesc);
      albumForm.append("genre", albumGenre); // ⭐
      albumForm.append("cover", cover);

      const albumResponse = await createAlbum(albumForm);
      const albumId = albumResponse.album._id;

      // ⭐ UPLOAD SONGS
      for (let t of tracks) {
        const songForm = new FormData();
        songForm.append("audio", t.file);
        songForm.append("title", t.title);
        songForm.append("genre", t.genre);
        songForm.append("albumId", albumId);

        await uploadSong(songForm);
      }

      alert("Album uploaded successfully!");

      // RESET
      setAlbumTitle("");
      setAlbumDesc("");
      setAlbumGenre("");
      setCover(null);
      setTracks([{ title: "", file: null, genre: "" }]);

    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    }

    setLoading(false);
  };

  // -----------------------------
  // RENDER UI
  // -----------------------------
  return (
    <div className="upload-container">
      <Sidebar />

      <div className="upload-main">
        <TopBar username={username} />

        <div className="upload-content">

          <h1 className="upload-title">Upload a New Album</h1>

          {/* TITLE */}
          <label className="upload-label">Album Title</label>
          <input
            type="text"
            className="upload-input"
            value={albumTitle}
            onChange={(e) => setAlbumTitle(e.target.value)}
          />

          {/* DESCRIPTION */}
          <label className="upload-label">Description</label>
          <textarea
            className="upload-input"
            value={albumDesc}
            onChange={(e) => setAlbumDesc(e.target.value)}
          ></textarea>

          {/* ALBUM GENRE */}
          <label className="upload-label">Album Genre</label>
          <select
            className="upload-input"
            value={albumGenre}
            onChange={(e) => setAlbumGenre(e.target.value)}
          >
            <option value="">Select Genre</option>
            {genreOptions.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          {/* COVER */}
          <label className="upload-label">Album Cover</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCover(e.target.files[0])}
          />

          {/* SONGS */}
          <h2 className="songs-title">Songs</h2>

          {tracks.map((track, index) => (
            <div key={index} className="track-row">

              <div className="track-left">
                {/* SONG TITLE */}
                <input
                  type="text"
                  placeholder="Song title"
                  className="track-title-input"
                  value={track.title}
                  onChange={(e) => updateTrackTitle(index, e.target.value)}
                />

                {/* SONG GENRE */}
                <select
                  className="track-genre-input"
                  value={track.genre}
                  onChange={(e) => updateTrackGenre(index, e.target.value)}
                >
                  <option value="">Genre</option>
                  {genreOptions.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>

                {/* SONG FILE */}
                <input
                  type="file"
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
