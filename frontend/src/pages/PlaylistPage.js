// src/pages/PlaylistPage.js
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import PlayerBar from "../components/PlayerBar";

import {
  getPlaylistById,
  removeSongFromPlaylist,
  addSongToPlaylist,
  updatePlaylist,
  deletePlaylist,
} from "../api/playlistApi";

import { getAllSongs } from "../api/songApi";
import { PlayerContext } from "../context/PlayerContext";

import "./PlaylistPage.css";

// Build playable audio URL
function buildSongUrl(song) {
  if (!song || !song.filePath) return "";

  const fp = song.filePath;

  if (fp.startsWith("http://") || fp.startsWith("https://")) return fp;
  if (fp.startsWith("/uploads/")) return `http://localhost:5000${fp}`;
  if (fp.startsWith("uploads/")) return `http://localhost:5000/${fp}`;

  return `http://localhost:5000/uploads/songs/${fp}`;
}

// Format seconds → mm:ss
function formatTime(seconds) {
  if (!seconds) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function PlaylistPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState(null);
  const [allSongs, setAllSongs] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  // EDIT playlist fields
  const [showEdit, setShowEdit] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editColor, setEditColor] = useState("#6a00ff");
  const [editCover, setEditCover] = useState(null);
  const [removeCover, setRemoveCover] = useState(false);

  // Duration state
  const [durations, setDurations] = useState({});

  const { playFromQueue, setQueue } = useContext(PlayerContext);

  const user = JSON.parse(localStorage.getItem("user"));
  const username = user?.username || "User";

  useEffect(() => {
    loadPlaylist();
  }, [id]);

  const loadPlaylist = async () => {
    const data = await getPlaylistById(id);
    setPlaylist(data);
  };

  const loadAllSongs = async () => {
    const data = await getAllSongs();
    setAllSongs(data);
  };

  const openModal = async () => {
    await loadAllSongs();
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const playSong = (song, index) => {
    setQueue(playlist.songs);
    playFromQueue(index);
  };

  const deleteSong = async (songId) => {
    await removeSongFromPlaylist(id, songId);
    loadPlaylist();
  };

  const addSong = async (songId) => {
    await addSongToPlaylist(id, songId);
    loadPlaylist();
  };

  const filteredSongs = allSongs.filter((song) =>
    song.title.toLowerCase().includes(search.toLowerCase())
  );

  
  // SAVE EDIT
  const savePlaylistChanges = async () => {
    const formData = new FormData();

    formData.append("title", editTitle);
    formData.append("colorTheme", editColor);
    if (editCover) formData.append("coverImage", editCover);
    if (removeCover) formData.append("removeCover", "true");

    await updatePlaylist(id, formData);

    setShowEdit(false);
    loadPlaylist();
  };

  // DELETE PLAYLIST
  const handleDeletePlaylist = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this playlist?"
    );
    if (!confirmDelete) return;

    await deletePlaylist(id);
    alert("Playlist deleted!");

    navigate("/your-playlists");
  };

  // Preload durations
  useEffect(() => {
    if (!playlist || !playlist.songs) return;

    playlist.songs.forEach((song) => {
      const url = buildSongUrl(song);
      if (!url) return;

      const audio = new Audio(url);
      audio.preload = "metadata";

      audio.addEventListener("loadedmetadata", () => {
        if (!Number.isNaN(audio.duration) && audio.duration > 0) {
          setDurations((prev) => ({
            ...prev,
            [song._id]: audio.duration,
          }));
        }
      });
    });
  }, [playlist]);

  if (!playlist) return null;

  return (
    <div className="page-container">
      <Sidebar />

      <div className="playlist-main">
        <TopBar username={username} />

        <div className="playlist-header">
          {playlist.coverImage ? (
            <img
              src={`http://localhost:5000${playlist.coverImage}`}
              className="playlist-cover"
              alt="Playlist Cover"
            />
          ) : (
            <div
              className="playlist-cover"
              style={{ backgroundColor: playlist.colorTheme }}
            />
          )}

          <div className="playlist-info">
            <h1 className="playlist-title">{playlist.title}</h1>
            <p className="playlist-count">{playlist.songs.length} songs</p>

            <button className="add-btn" onClick={openModal}>
              + Add Songs
            </button>

            <button
              className="edit-btn"
              onClick={() => {
                setEditTitle(playlist.title);
                setEditColor(playlist.colorTheme || "#6a00ff");
                setRemoveCover(false);
                setShowEdit(true);
              }}
            >
              Edit Playlist
            </button>
          </div>
        </div>

        {/* SONG LIST */}
        <div className="playlist-songs">
          {playlist.songs.map((song, index) => (
            <div key={song._id} className="playlist-track">
              <div className="track-left">
                <span className="track-number">{index + 1}</span>
                <span className="track-title">{song.title}</span>
              </div>

              <div className="track-actions">
                <span className="track-duration">
                  {durations[song._id]
                    ? formatTime(durations[song._id])
                    : "0:00"}
                </span>

                <button
                  onClick={() => playSong(song, index)}
                  className="track-btn play"
                >
                  ▶
                </button>

                <button
                  onClick={() => deleteSong(song._id)}
                  className="track-btn delete"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}

          {playlist.songs.length === 0 && (
            <p className="empty-text">No songs yet.</p>
          )}
        </div>

        {/* ADD SONGS MODAL */}
        {showModal && (
  <div className="modal-overlay">
    <div className="modal-container">
      <h2>Add Songs to Playlist</h2>

      <input
        type="text"
        placeholder="Search songs..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />

      <div className="modal-song-list">
        {filteredSongs.length === 0 && (
          <p className="empty-text">No songs found.</p>
        )}

        {filteredSongs.map((song) => (
          <div key={song._id} className="modal-song-item">
            <span>{song.title}</span>

            <button
              className="add-song-btn"
              onClick={() => addSong(song._id)}
            >
              Add
            </button>
          </div>
        ))}
      </div>

      <button className="close-btn" onClick={closeModal}>
        Close
      </button>
    </div>
  </div>
)}


        {/* EDIT MODAL */}
        {showEdit && (
          <div className="modal-overlay">
            <div className="modal-container">
              <h2>Edit Playlist</h2>

              <label>Playlist Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />

              <label>Color Theme</label>
              <input
                type="color"
                value={editColor}
                onChange={(e) => setEditColor(e.target.value)}
              />

              <label>Cover Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setEditCover(e.target.files[0])}
              />

              <label className="remove-cover">
                <input
                  type="checkbox"
                  checked={removeCover}
                  onChange={(e) => setRemoveCover(e.target.checked)}
                />
                Remove Cover Image
              </label>

              <button className="save-btn" onClick={savePlaylistChanges}>
                Save Changes
              </button>

              <button
                className="delete-playlist-btn"
                onClick={handleDeletePlaylist}
              >
                Delete Playlist
              </button>

              <button className="close-btn" onClick={() => setShowEdit(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        <PlayerBar />
      </div>
    </div>
  );
}
