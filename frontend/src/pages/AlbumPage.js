// src/pages/AlbumPage.js
import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import PlayerBar from "../components/PlayerBar";

import { PlayerContext } from "../context/PlayerContext";
import { getAlbumById } from "../api/albumApi";
import { toggleLike, getFavoriteSongs } from "../api/songApi";

import "./AlbumPage.css";

function formatTime(seconds) {
  if (!seconds || Number.isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

// Build a usable URL from whatever is in song.filePath
function buildSongUrl(song) {
  if (!song || !song.filePath) return "";

  const fp = song.filePath;

  // already full URL (just in case)
  if (fp.startsWith("http://") || fp.startsWith("https://")) {
    return fp;
  }

  // stored like "/uploads/songs/xyz.mp3"
  if (fp.startsWith("/uploads/")) {
    return `http://localhost:5000${fp}`;
  }

  // stored like "uploads/songs/xyz.mp3"
  if (fp.startsWith("uploads/")) {
    return `http://localhost:5000/${fp}`;
  }

  // old style: just filename
  return `http://localhost:5000/uploads/songs/${fp}`;
}

function AlbumPage() {
  const { id } = useParams();

  const [album, setAlbum] = useState(null);
  const [songs, setSongs] = useState([]);
  const [durations, setDurations] = useState({}); // songId → seconds
  const [likedSongs, setLikedSongs] = useState([]);

  const { setQueue, playFromQueue } = useContext(PlayerContext);

  // username for top bar
  const storedUser = localStorage.getItem("user");
  let username = "User";
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      if (parsed.username) username = parsed.username;
    } catch (e) {
      // ignore parse error
    }
  }

  // -------- FETCH ALBUM + SONGS --------
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

        // set queue for player (so next/prev works)
        setQueue(enrichedSongs);
      } catch (err) {
        console.error("Album fetch error:", err);
      }
    }

    loadAlbum();
  }, [id, setQueue]);

  // -------- PRELOAD DURATIONS (like Favorites page) --------
  useEffect(() => {
    if (!songs || songs.length === 0) return;

    songs.forEach((song) => {
      const url = buildSongUrl(song);
      if (!url) return;

      const audio = new Audio(url);
      audio.preload = "metadata";

      const handleLoaded = () => {
        if (!Number.isNaN(audio.duration) && audio.duration > 0) {
          setDurations((prev) => ({
            ...prev,
            [song._id]: audio.duration,
          }));
        }
      };

      audio.addEventListener("loadedmetadata", handleLoaded);
    });
  }, [songs]);

  // -------- LOAD LIKED SONGS --------
  useEffect(() => {
    async function loadLikes() {
      try {
        const list = await getFavoriteSongs(); // returns array of song docs
        setLikedSongs((list || []).map((s) => s._id));
      } catch (err) {
        console.error("Favorite songs error:", err);
        setLikedSongs([]);
      }
    }

    loadLikes();
  }, []);

  const handleToggleLike = async (songId) => {
    try {
      const res = await toggleLike(songId);

      if (res.liked) {
        setLikedSongs((prev) => [...prev, songId]);
      } else {
        setLikedSongs((prev) => prev.filter((id) => id !== songId));
      }
    } catch (err) {
      console.error("Toggle like error:", err);
    }
  };

  // Play entire album from first track
  const playAlbum = () => {
    if (!songs || songs.length === 0) return;
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
                    {album.artist} ·{" "}
                    {new Date(album.createdAt).getFullYear()} ·{" "}
                    {songs.length} {songs.length === 1 ? "song" : "songs"}
                  </p>

                  <div className="album-buttons">
                    {/* BIG PLAY BUTTON */}
                    <button
                      className="circle-btn play-btn"
                      onClick={playAlbum}
                    >
                      ▶
                    </button>
                    <button className="circle-btn">＋</button>
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

                      {/* ❤️ LIKE BUTTON */}
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
