import React, { useEffect, useState, useContext } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import PlayerBar from "../components/PlayerBar";
import { PlayerContext } from "../context/PlayerContext";
import { getFavoriteSongs, toggleLike } from "../api/songApi";
import "./FavoritesPage.css";

function formatTime(seconds) {
  if (!seconds || Number.isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ------------------------------
// UNIVERSAL SONG URL BUILDER
// ------------------------------
function buildSongUrl(song) {
  if (!song) return "";

  // NEW SONGS: stored with full path `/uploads/songs/filename.mp3`
  if (song.filePath?.startsWith("/uploads/")) {
    return `http://localhost:5000${song.filePath}`;
  }

  // OLD SONGS: need stream endpoint
  return `http://localhost:5000/api/songs/stream/${song._id}`;
}

export default function FavoritesPage() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedSongs, setLikedSongs] = useState([]);

  const { setQueue, playFromQueue } = useContext(PlayerContext);

  // LOAD FAVORITES
  useEffect(() => {
    async function loadFavorites() {
      try {
        const data = await getFavoriteSongs();
        setSongs(data || []);
        setLikedSongs((data || []).map((s) => s._id));
      } catch (err) {
        console.error("Favorites error:", err);
        setSongs([]);
      } finally {
        setLoading(false);
      }
    }

    loadFavorites();
  }, []);

  // ------------------------------
  // PRELOAD DURATION (FIXED)
  // ------------------------------
  useEffect(() => {
    songs.forEach((song, index) => {
      const audio = new Audio(buildSongUrl(song));
      audio.preload = "metadata";

      audio.onloadedmetadata = () => {
        const duration = audio.duration;

        setSongs((prev) => {
          const updated = [...prev];
          updated[index] = { ...updated[index], duration };
          return updated;
        });
      };
    });
  }, [songs.length]);

  // LIKE / UNLIKE
  const handleToggleLike = async (songId) => {
    const res = await toggleLike(songId);

    if (res.liked) {
      setLikedSongs((prev) => [...prev, songId]);
    } else {
      setLikedSongs((prev) => prev.filter((id) => id !== songId));
    }
  };

  // PLAY SONG
  const playSong = (song) => {
    setQueue(songs);
    const index = songs.findIndex((s) => s._id === song._id);
    playFromQueue(index);
  };

  return (
    <div className="favorites-container">
      <Sidebar />

      <div className="favorites-main">
        <TopBar />

        <h1 className="fav-title">❤️ Favorite Songs</h1>

        {loading && <p className="loading-text">Loading your favorites...</p>}

        {!loading && songs.length === 0 && (
          <p className="empty-text">You haven't liked any songs yet.</p>
        )}

        <div className="track-list">
          {songs.map((song, index) => (
            <div className="track-row" key={song._id}>
              <span className="track-number-title">
                {index + 1}. {song.title}
              </span>

              <div className="track-right">
                <span className="track-duration">
                  {formatTime(song.duration)}
                </span>

                <button
                  className="like-btn"
                  onClick={() => handleToggleLike(song._id)}
                >
                  {likedSongs.includes(song._id) ? "❤️" : "🤍"}
                </button>

                <button
                  className="track-play-btn"
                  onClick={() => playSong(song)}
                >
                  ▶
                </button>
              </div>
            </div>
          ))}
        </div>

        <PlayerBar />
      </div>
    </div>
  );
}
