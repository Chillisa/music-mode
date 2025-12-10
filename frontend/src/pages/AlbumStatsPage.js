// src/pages/AlbumStatsPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import PlayerBar from "../components/PlayerBar";
import LineChart from "../components/LineChart";

import "./AlbumStatsPage.css";

export default function AlbumStatsPage() {
  const { id } = useParams();

  const [album, setAlbum] = useState(null);
  const [songs, setSongs] = useState([]);
  const [stats, setStats] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const username = user?.username || "User";
  const token = localStorage.getItem("token");

  // Load everything (album info + stats + songs) from /stats endpoint
  useEffect(() => {
    async function loadStats() {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/albums/${id}/stats`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setAlbum(res.data.album);          // { title, coverImage, createdAt }
        setStats(res.data.stats);          // { totalPlays, totalSongLikes, totalAlbumSaves, totalSongs, dailySeries }
        setSongs(res.data.songs);          // songs with totalLikes & totalPlays
      } catch (err) {
        console.error("Album Stats Error:", err);
      }
    }

    if (id && token) {
      loadStats();
    }
  }, [id, token]);

  if (!album || !stats) {
    return <div className="loading">Loading album…</div>;
  }

  return (
    <div className="album-stats-container">
      <Sidebar />
      <div className="stats-main">
        <TopBar username={username} />

        {/* HEADER */}
        <div className="stats-header">
          <img
            src={`http://localhost:5000${album.coverImage}`}
            className="stats-cover"
            alt="album cover"
          />

          <div>
            <h1 className="stats-title">{album.title}</h1>
            <p className="stats-subtitle">
              {songs.length} {songs.length === 1 ? "Song" : "Songs"} •&nbsp;
              Released {new Date(album.createdAt).getFullYear()}
            </p>
          </div>
        </div>

        {/* OVERVIEW CARDS */}
        <div className="stats-cards">
          <div className="stat-card">
            <h2>{stats.totalPlays || 0}</h2>
            <p>Total Streams (All Songs)</p>
          </div>

          <div className="stat-card">
            <h2>{stats.totalSongLikes || 0}</h2>
            <p>Total Song Likes</p>
          </div>

          <div className="stat-card">
            <h2>{stats.totalAlbumSaves || 0}</h2>
            <p>Total Album Saves</p>
          </div>

          <div className="stat-card">
            <h2>{stats.totalSongs || songs.length}</h2>
            <p>Total Songs Uploaded</p>
          </div>
        </div>

        {/* LISTENING TREND */}
        <h2 className="section-title">Listening Trend</h2>
        <LineChart dataPoints={stats.dailySeries || []} />

        {/* SONG BREAKDOWN */}
        <h2 className="section-title">Song Performance</h2>

        <div className="song-list-stats">
          {songs.map((song) => (
            <div key={song._id} className="song-row-stats">
              <span className="song-title">{song.title}</span>

              <span className="song-meta">
                Genre: {song.genre || "Unknown"}
              </span>

              <span className="song-meta">
                Duration:{" "}
                {song.duration
                  ? `${Math.floor(song.duration / 60)}:${(song.duration % 60)
                      .toString()
                      .padStart(2, "0")}`
                  : "0:00"}
              </span>

              <span className="song-meta stats">
                ❤️ {song.totalLikes || 0} Likes
              </span>

              <span className="song-meta stats">
                ▶ {song.totalPlays || 0} Streams
              </span>
            </div>
          ))}
        </div>

        <PlayerBar />
      </div>
    </div>
  );
}
