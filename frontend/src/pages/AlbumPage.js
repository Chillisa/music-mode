// src/pages/AlbumPage.js
import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import PlayerBar from "../components/PlayerBar";

import { PlayerContext } from "../context/PlayerContext";
import { getAlbumById } from "../api/albumApi";

import "./AlbumPage.css";

function formatTime(seconds) {
  if (!seconds || Number.isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

function AlbumPage() {
  const { id } = useParams();

  const [album, setAlbum] = useState(null);
  const [songs, setSongs] = useState([]);

  // durations per song ID
  const [durations, setDurations] = useState({});

  const { setQueue, playFromQueue } = useContext(PlayerContext);

  // username for top bar
  const storedUser = localStorage.getItem("user");
  let username = "User";
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      if (parsed.username) username = parsed.username;
    } catch (e) {}
  }

  // -------- FETCH ALBUM + SONGS --------
  useEffect(() => {
    getAlbumById(id).then((data) => {
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
    });
  }, [id, setQueue]);

  // -------- PRELOAD DURATIONS --------
  useEffect(() => {
    if (!songs || songs.length === 0) return;

    songs.forEach((song) => {
      const audio = new Audio(
        `http://localhost:5000/api/songs/stream/${song._id}`
      );
      audio.preload = "metadata";

      const onLoaded = () => {
        setDurations((prev) => ({
          ...prev,
          [song._id]: audio.duration || 0,
        }));
        audio.removeEventListener("loadedmetadata", onLoaded);
      };

      audio.addEventListener("loadedmetadata", onLoaded);
    });
  }, [songs]);

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
