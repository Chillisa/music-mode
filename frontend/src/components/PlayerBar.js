// src/components/PlayerBar.js
import React, { useContext } from "react";
import { PlayerContext } from "../context/PlayerContext";
import "./PlayerBar.css";

function formatTime(seconds) {
  if (!seconds || Number.isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

function PlayerBar() {
  const {
    currentSong,
    isPlaying,
    togglePlay,
    nextSong,
    prevSong,
    progress,
    duration,
    setSeek,
    volume,
    setVolume,
    isMuted,
    toggleMute,
  } = useContext(PlayerContext);

  const currentProgress = Math.min(progress, duration || 0);

  return (
    <div className="playerbar-container">
      {/* LEFT — COVER + TITLE */}
      <div className="player-left">
        {currentSong ? (
          <>
            <img
              src={
                currentSong.coverImage
                  ? `http://localhost:5000${currentSong.coverImage}`
                  : "https://via.placeholder.com/60x60?text=♪"
              }
              alt="cover"
              className="player-cover"
            />
            <div className="player-song-info">
              <div className="player-song-title">{currentSong.title}</div>
              <div className="player-song-artist">{currentSong.artist}</div>
            </div>
          </>
        ) : (
          <div className="player-placeholder">No song selected</div>
        )}
      </div>

      {/* CENTER — CONTROLS + TIMELINE */}
      <div className="player-center">
        <div className="player-controls">
          <button
            className={`player-btn small-btn ${
              !currentSong ? "disabled" : ""
            }`}
            onClick={prevSong}
            disabled={!currentSong}
          >
            ⏮
          </button>

          <button
            className={`player-btn play-btn ${isPlaying ? "playing" : ""} ${
              !currentSong ? "disabled" : ""
            }`}
            onClick={togglePlay}
            disabled={!currentSong}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>

          <button
            className={`player-btn small-btn ${
              !currentSong ? "disabled" : ""
            }`}
            onClick={nextSong}
            disabled={!currentSong}
          >
            ⏭
          </button>
        </div>

        <div className="timeline">
          <span className="time">{formatTime(currentProgress)}</span>

          <input
            type="range"
            className="player-seek"
            min="0"
            max={duration || 0}
            value={currentProgress}
            onChange={(e) => setSeek(e.target.value)}
          />

          <span className="time">{formatTime(duration)}</span>
        </div>
      </div>

      {/* RIGHT — VOLUME + MUTE */}
      <div className="player-right">
        <span className="volume-icon" onClick={toggleMute}>
          {isMuted || volume === 0 ? "🔇" : "🔊"}
        </span>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          className="volume-slider"
          onChange={(e) => setVolume(e.target.value)}
        />
      </div>
    </div>
  );
}

export default PlayerBar;
