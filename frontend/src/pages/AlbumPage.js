// src/pages/AlbumPage.js
import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import PlayerBar from "../components/PlayerBar";

import { PlayerContext } from "../context/PlayerContext";
import { getAlbumById } from "../api/albumApi";
import { getFavoriteSongs } from "../api/songApi";
import { toggleLike } from "../api/likeApi";   // ✅ NEW LIKE SYSTEM
import { createPlaylistFromAlbum } from "../api/playlistApi";

import "./AlbumPage.css";

// Format seconds → mm:ss
function formatTime(seconds) {
  if (!seconds || Number.isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// Turn filePath into full URL
function buildSongUrl(song) {
  if (!song || !song.filePath) return "";
  const fp = song.filePath;

  if (fp.startsWith("http://") || fp.startsWith("https://")) return fp;
  if (fp.startsWith("/uploads/")) return `http://localhost:5000${fp}`;
  if (fp.startsWith("uploads/")) return `http://localhost:5000/${fp}`;

  return `http://localhost:5000/uploads/songs/${fp}`;
}

function AlbumPage() {
  const { id } = useParams();

  const [album, setAlbum] = useState(null);
  const [songs, setSongs] = useState([]);
  const [durations, setDurations] = useState({});
  const [likedSongs, setLikedSongs] = useState([]);
  const [albumLiked, setAlbumLiked] = useState(false);
  const [savingPlaylist, setSavingPlaylist] = useState(false);

  const { setQueue, playFromQueue } = useContext(PlayerContext);

  // Username
  const storedUser = localStorage.getItem("user");
  let username = storedUser ? JSON.parse(storedUser).username || "User" : "User";

  // Load album + songs
  useEffect(() => {
    async function loadAlbum() {
      try {
        const data = await getAlbumById(id);
        if (!data) return;

        const enrichedSongs = (data.songs || []).map((s) => ({
          ...s,
          artist: data.album.artist,
          coverImage: data.album.coverImage,
        }));

        setAlbum(data.album);
        setSongs(enrichedSongs);
        setQueue(enrichedSongs);
      } catch (err) {
        console.error("Album fetch error:", err);
      }
    }
    loadAlbum();
  }, [id, setQueue]);

  // Preload durations
  useEffect(() => {
    if (!songs.length) return;

    songs.forEach((song) => {
      const url = buildSongUrl(song);
      if (!url) return;

      const audio = new Audio(url);
      audio.preload = "metadata";

      audio.addEventListener("loadedmetadata", () => {
        if (audio.duration > 0) {
          setDurations((prev) => ({
            ...prev,
            [song._id]: audio.duration,
          }));
        }
      });
    });
  }, [songs]);

  // Load liked songs
  useEffect(() => {
    async function loadLikes() {
      try {
        const list = await getFavoriteSongs();
        setLikedSongs(list.map((s) => s._id));
      } catch (err) {
        console.error("Favorite songs error:", err);
        setLikedSongs([]);
      }
    }
    loadLikes();
  }, []);

  // ⭐ SONG LIKE
  const handleToggleLike = async (songId) => {
    try {
      const res = await toggleLike(songId, "song");

      if (res.liked) {
        setLikedSongs((prev) => [...prev, songId]);
      } else {
        setLikedSongs((prev) => prev.filter((id) => id !== songId));
      }
    } catch (err) {
      console.error("Song like error:", err);
    }
  };

  // ⭐ SAVE ALBUM AS PLAYLIST (your original function — restored)
const handleSaveAsPlaylist = async () => {
  if (!album) return;

  try {
    setSavingPlaylist(true);
    await createPlaylistFromAlbum(id); 
    alert("Playlist created from this album!");
  } catch (err) {
    console.error("Create playlist from album error:", err);
    alert("Could not create playlist from album.");
  } finally {
    setSavingPlaylist(false);
  }
};


  // ⭐ ALBUM LIKE
  const handleToggleAlbumLike = async () => {
    try {
      const res = await toggleLike(album._id, "album");

      setAlbumLiked(res.liked);

      if (res.liked) {
        alert("Album added to your library 💜");
      } else {
        alert("Album removed from your library 🤍");
      }
    } catch (err) {
      console.error("Album like error:", err);
    }
  };

  // Play entire album
  const playAlbum = () => {
    if (!songs.length) return;
    playFromQueue(0);
  };

  return (
    <div className="album-container">
      <Sidebar />

      <div className="album-main">
        <TopBar username={username} />

        <div className="album-content">
          {!album ? (
            <p style={{ opacity: 0.6 }}>Loading album…</p>
          ) : (
            <>
              {/* HEADER */}
              <div className="album-header">
                <img
                  src={`http://localhost:5000${album.coverImage}`}
                  className="album-cover-img"
                  alt="cover"
                />

                <div className="album-info">
                  <h1 className="album-title">{album.title}</h1>

                  <p className="album-meta">
                    {album.artist} · {new Date(album.createdAt).getFullYear()} ·{" "}
                    {songs.length} {songs.length === 1 ? "song" : "songs"}
                  </p>

                  <div className="album-buttons">
                    {/* PLAY */}
                    <button className="circle-btn play-btn" onClick={playAlbum}>
                      ▶
                    </button>

                  
                    {/* SAVE AS PLAYLIST */}
                    <button
                      className="circle-btn"
                      onClick={handleSaveAsPlaylist}
                      disabled={savingPlaylist}
                      title="Save this album as playlist"
                    >
                      {savingPlaylist ? "…" : "💾"}
                    </button>

                    <button className="circle-btn">⬇</button>
                  </div>
                </div>
              </div>

              {/* TRACK LIST */}
              <div className="track-list">
                {songs.map((song, index) => (
                  <div className="track-row" key={song._id}>
                    <span className="track-number-title">
                      {index + 1}. {song.title}
                    </span>

                    <div className="track-right">
                      <span className="track-duration">
                        {durations[song._id]
                          ? formatTime(durations[song._id])
                          : "0:00"}
                      </span>

                      {/* SONG LIKE ⭐ */}
                      <button
                        className="like-btn"
                        onClick={() => handleToggleLike(song._id)}
                      >
                        {likedSongs.includes(song._id) ? "❤️" : "🤍"}
                      </button>

                      <button
                        className="track-play-btn"
                        onClick={() => playFromQueue(index)}
                      >
                        ▶
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <PlayerBar />
      </div>
    </div>
  );
}

export default AlbumPage;
