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
  deleteSongFromAlbum
} from "../api/albumApi";

import { renameSong } from "../api/songApi";

import "./EditAlbumPage.css";

export default function EditAlbumPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [album, setAlbum] = useState(null);
  const [songs, setSongs] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [newCover, setNewCover] = useState(null);

  // ❗ This will hold new song files
  const [newSongs, setNewSongs] = useState([]);

  // Load album data on mount
  useEffect(() => {
    getAlbumById(id).then((data) => {
      setAlbum(data.album);
      setSongs(
        data.songs.map((s) => ({
          ...s,
          newTitle: s.title, // for renaming
        }))
      );
      setTitle(data.album.title);
      setDescription(data.album.description);
    });
  }, [id]);

  if (!album) return <div className="loading-text">Loading...</div>;

  // ------------------------------
  // Change album cover
  // ------------------------------
  const handleCoverChange = (e) => {
    if (e.target.files[0]) {
      setNewCover(e.target.files[0]);
    }
  };

  // ------------------------------
  // Add new songs (instant UI update)
  // ------------------------------
  const handleNewSongs = (e) => {
    const files = [...e.target.files];

    // Add to upload list
    setNewSongs((prev) => [...prev, ...files]);

    // Show in UI immediately
    const tempSongs = files.map((file) => ({
      _id: "temp-" + Math.random(),
      title: file.name,
      newTitle: file.name,
      isNew: true,
      file,
    }));

    setSongs((prev) => [...prev, ...tempSongs]);
  };

  // ------------------------------
  // Delete song
  // ------------------------------
  const handleDeleteSong = async (songId) => {
    if (!window.confirm("Delete this song?")) return;

    // If temp new song (not uploaded yet)
    if (songId.startsWith("temp-")) {
      setSongs((prev) => prev.filter((s) => s._id !== songId));
      setNewSongs((prev) => prev.filter((file) => file.name !== songId));
      return;
    }

    // If real song
    await deleteSongFromAlbum(songId);
    setSongs((prev) => prev.filter((s) => s._id !== songId));
  };

  // ------------------------------
  // MASTER SAVE BUTTON
  // ------------------------------
  const handleSaveChanges = async () => {
    // 1️⃣ Update album metadata
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (newCover) formData.append("cover", newCover);

    await updateAlbum(id, formData);

    // 2️⃣ Rename edited songs
    for (let s of songs) {
      if (!s.isNew && s.title !== s.newTitle) {
        await renameSong(s._id, s.newTitle);
      }
    }

    // 3️⃣ Upload NEW songs
    if (newSongs.length > 0) {
      const uploadForm = new FormData();
      newSongs.forEach((file) => uploadForm.append("songs", file));
      await addSongsToAlbum(id, uploadForm);
    }

    alert("Album updated!");

    // 4️⃣ Reload fully updated album
    const updated = await getAlbumById(id);
    setAlbum(updated.album);
    setSongs(updated.songs.map((s) => ({ ...s, newTitle: s.title })));
    setNewSongs([]);
  };

  // ------------------------------
  // Delete album
  // ------------------------------
  const handleDeleteAlbum = async () => {
    if (!window.confirm("Delete the whole album?")) return;

    await deleteAlbum(id);
    alert("Album deleted");
    navigate("/artist-library");
  };

  // ------------------------------
  // Render UI
  // ------------------------------
  return (
    <div className="edit-album-container">
      <Sidebar />

      <div className="main-content">
        <TopBar username={album.artist} />

        <h1 className="page-title">Edit Album</h1>

        <div className="edit-section">
          {/* LEFT — Cover & Meta */}
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

            <button className="save-btn" onClick={handleSaveChanges}>
              Save Changes
            </button>

            <button className="delete-btn" onClick={handleDeleteAlbum}>
              Delete Album
            </button>
          </div>

          {/* RIGHT — Songs */}
          <div className="edit-right">
            <h2>Songs</h2>

            <div className="song-list">
              {songs.map((song) => (
                <div className="song-item" key={song._id}>
                  <input
                    className="song-title-input"
                    defaultValue={song.title}
                    onChange={(e) => (song.newTitle = e.target.value)}
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

            {/* Add new songs */}
            <label className="file-btn">
              Add New Songs
              <input
                type="file"
                accept="audio/*"
                multiple
                onChange={handleNewSongs}
              />
            </label>
          </div>
        </div>

        <PlayerBar />
      </div>
    </div>
  );
}
