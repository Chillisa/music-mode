// src/pages/EditAlbumPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import PlayerBar from "../components/PlayerBar";

import {
  getAlbumById,
  updateAlbum,
  deleteAlbum,
  addSongsToAlbum,
  deleteSongFromAlbum,
} from "../api/albumApi";

import { renameSong } from "../api/songApi";

import "./EditAlbumPage.css";

// Default preset genres
const GENRES = [
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

export default function EditAlbumPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [album, setAlbum] = useState(null);
  const [songs, setSongs] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [albumGenre, setAlbumGenre] = useState(""); // dropdown
  const [customAlbumGenre, setCustomAlbumGenre] = useState(""); // custom input

  const [newCover, setNewCover] = useState(null);

  // ================================
  // LOAD ALBUM DATA
  // ================================
  useEffect(() => {
    (async () => {
      const data = await getAlbumById(id);

      setAlbum(data.album);
      setTitle(data.album.title || "");
      setDescription(data.album.description || "");

      // Load album genre (dropdown or custom)
      if (GENRES.includes(data.album.genre)) {
        setAlbumGenre(data.album.genre);
      } else {
        setCustomAlbumGenre(data.album.genre || "");
      }

      setSongs(
        data.songs.map((s) => ({
          ...s,
          newTitle: s.title,
          newGenre: GENRES.includes(s.genre) ? s.genre : "",
          newCustomGenre: GENRES.includes(s.genre) ? "" : s.genre || "",
          isNew: false,
          file: null,
        }))
      );
    })();
  }, [id]);

  if (!album) return <div className="loading-text">Loading...</div>;

  // ================================
  // COVER CHANGE
  // ================================
  const handleCoverChange = (e) => {
    if (e.target.files[0]) setNewCover(e.target.files[0]);
  };

  // ================================
  // ADD NEW SONGS
  // ================================
  const handleNewSongs = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const toAdd = files.map((file) => ({
      _id: "temp-" + Math.random().toString(36).slice(2),
      title: file.name,
      newTitle: file.name,
      newGenre: albumGenre || "",
      newCustomGenre: customAlbumGenre || "",
      isNew: true,
      file,
    }));

    setSongs((prev) => [...prev, ...toAdd]);
  };

  // ================================
  // DELETE SONG
  // ================================
  const handleDeleteSong = async (songId) => {
    if (!window.confirm("Delete this song?")) return;

    if (songId.startsWith("temp-")) {
      setSongs((prev) => prev.filter((s) => s._id !== songId));
      return;
    }

    await deleteSongFromAlbum(songId);
    setSongs((prev) => prev.filter((s) => s._id !== songId));
  };

  // ================================
  // SAVE CHANGES
  // ================================
  const handleSaveChanges = async () => {
    const finalAlbumGenre = customAlbumGenre || albumGenre;

    // 1️⃣ Update album info
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("genre", finalAlbumGenre);
    if (newCover) formData.append("cover", newCover);

    await updateAlbum(id, formData);

    // 2️⃣ Update existing songs
    const existingSongs = songs.filter((s) => !s.isNew);

    for (let s of existingSongs) {
      const newGenre = s.newCustomGenre || s.newGenre;
      const oldGenre = s.genre;

      const titleChanged = s.newTitle !== s.title;
      const genreChanged = newGenre !== oldGenre;

      if (titleChanged || genreChanged) {
        await renameSong(s._id, s.newTitle, newGenre);
      }
    }

    // 3️⃣ Upload new songs
    const newSongEntries = songs.filter((s) => s.isNew && s.file);

    if (newSongEntries.length > 0) {
      const uploadForm = new FormData();

      newSongEntries.forEach((s) => {
        uploadForm.append("songs", s.file);
        uploadForm.append("titles", s.newTitle);
        uploadForm.append("genres", s.newCustomGenre || s.newGenre);
      });

      await addSongsToAlbum(id, uploadForm);
    }

    alert("Album updated!");

    // 4️⃣ Reload updated data
    const updated = await getAlbumById(id);

    setAlbum(updated.album);
    setTitle(updated.album.title || "");
    setDescription(updated.album.description || "");

    if (GENRES.includes(updated.album.genre)) {
      setAlbumGenre(updated.album.genre);
      setCustomAlbumGenre("");
    } else {
      setCustomAlbumGenre(updated.album.genre);
      setAlbumGenre("");
    }

    setNewCover(null);

    setSongs(
      updated.songs.map((s) => ({
        ...s,
        newTitle: s.title,
        newGenre: GENRES.includes(s.genre) ? s.genre : "",
        newCustomGenre: GENRES.includes(s.genre) ? "" : s.genre || "",
        isNew: false,
        file: null,
      }))
    );
  };

  // ================================
  // DELETE ALBUM
  // ================================
  const handleDeleteAlbum = async () => {
    if (!window.confirm("Delete the whole album?")) return;

    await deleteAlbum(id);
    alert("Album deleted");
    navigate("/artist-library");
  };

  return (
    <div className="edit-album-container">
      <Sidebar />

      <div className="main-content">
        <TopBar username={album.artist} />

        <h1 className="page-title">Edit Album</h1>

        <div className="edit-section">

          {/* LEFT SIDE */}
          <div className="edit-left">

            <img
              src={
                newCover
                  ? URL.createObjectURL(newCover)
                  : `http://localhost:5000${album.coverImage}`
              }
              className="edit-cover-preview"
              alt="cover"
            />

            <label className="file-btn">
              Change Cover
              <input type="file" accept="image/*" onChange={handleCoverChange} />
            </label>

            <label className="input-label">Album Title</label>
            <input
              className="input-field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <label className="input-label">Description</label>
            <textarea
              className="input-field"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            {/* GENRE CONFIG */}
            <label className="input-label">Album Genre</label>

            <select
              className="input-field"
              value={albumGenre}
              onChange={(e) => {
                setAlbumGenre(e.target.value);
                setCustomAlbumGenre("");
              }}
            >
              <option value="">Select Genre</option>
              {GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>

            <input
              className="input-field"
              placeholder="Or type custom genre"
              value={customAlbumGenre}
              onChange={(e) => {
                setCustomAlbumGenre(e.target.value);
                setAlbumGenre("");
              }}
            />

            <button className="save-btn" onClick={handleSaveChanges}>
              Save Changes
            </button>

            <button className="delete-btn" onClick={handleDeleteAlbum}>
              Delete Album
            </button>
          </div>

          {/* RIGHT SIDE — SONGS */}
          <div className="edit-right">
            <h2>Songs</h2>

            <div className="song-list">
              {songs.map((song) => (
                <div className="song-item" key={song._id}>
                  <input
                    className="song-title-input"
                    value={song.newTitle}
                    onChange={(e) => {
                      const v = e.target.value;
                      setSongs((prev) =>
                        prev.map((s) =>
                          s._id === song._id ? { ...s, newTitle: v } : s
                        )
                      );
                    }}
                  />

                  {/* DROPDOWN GENRE */}
                  <select
                    className="song-genre-select"
                    value={song.newGenre}
                    onChange={(e) => {
                      const v = e.target.value;
                      setSongs((prev) =>
                        prev.map((s) =>
                          s._id === song._id
                            ? { ...s, newGenre: v, newCustomGenre: "" }
                            : s
                        )
                      );
                    }}
                  >
                    <option value="">Select Genre</option>
                    {GENRES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>

                  {/* CUSTOM GENRE */}
                  <input
                    className="song-custom-genre-input"
                    placeholder="Or type custom"
                    value={song.newCustomGenre}
                    onChange={(e) => {
                      const v = e.target.value;
                      setSongs((prev) =>
                        prev.map((s) =>
                          s._id === song._id
                            ? { ...s, newCustomGenre: v, newGenre: "" }
                            : s
                        )
                      );
                    }}
                  />

                  <button
                    className="delete-song-btn"
                    onClick={() => handleDeleteSong(song._id)}
                  >
                    ✖
                  </button>
                </div>
              ))}
            </div>

            {/* ADD NEW SONGS */}
            <label className="file-btn">
              Add New Songs
              <input type="file" accept="audio/*" multiple onChange={handleNewSongs} />
            </label>
          </div>
        </div>

        <PlayerBar />
      </div>
    </div>
  );
}
