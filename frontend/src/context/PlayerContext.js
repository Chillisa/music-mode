// src/context/PlayerContext.js
import { createContext, useState, useRef, useEffect } from "react";
import axios from "axios";

export const PlayerContext = createContext();

export function PlayerProvider({ children }) {
  const audioRef = useRef(new Audio());

  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);

  const [queue, setQueueState] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const [isMuted, setIsMuted] = useState(false);
  const [lastVolume, setLastVolume] = useState(1);

  const token = localStorage.getItem("token");

  // 🔁 Refs so the audio event handler always sees fresh values
  const currentSongRef = useRef(null);
  const hasCountedRef = useRef(false);

  // 🔥 STREAM URL
  const getStreamUrl = (song) =>
    `http://localhost:5000/api/songs/stream/${song._id}`;

  // 🔥 REPORT PLAY COUNT TO BACKEND
  const sendPlayStat = async (songId) => {
    if (!songId) return;
    try {
      await axios.post(
        "http://localhost:5000/api/song-stats/play",
        { songId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("✅ Stream counted in DB for song:", songId);
    } catch (err) {
      console.error("Failed to update play count:", err);
    }
  };

  // -------------------------------
  // MAIN PLAY FUNCTION (internal)
  // -------------------------------
  const _playSongObject = (song) => {
    console.log("▶ PLAYING SONG ID:", song?._id);
    if (!song) return;

    const url = getStreamUrl(song);

    audioRef.current.src = url;
    audioRef.current.volume = volume;
    audioRef.current.play();

    const nowPlaying = {
      ...song,
      coverImage:
        song.coverImage ||
        (song.albumId && song.albumId.coverImage) ||
        song.playlistCover ||
        song.albumCover ||
        null,
    };

    setCurrentSong(nowPlaying);
    currentSongRef.current = nowPlaying;

    // reset 5s stream flag for this play
    hasCountedRef.current = false;

    setIsPlaying(true);
  };

  // Public: play a single song (outside queue)
  const playSong = (song) => {
    setQueueState([]);
    setCurrentIndex(-1);
    _playSongObject(song);
  };

  // Public: set the whole queue
  const setQueue = (songs) => {
    setQueueState(songs || []);
  };

  // Public: play a song from the queue by index
  const playFromQueue = (index) => {
    if (!queue || queue.length === 0) return;
    if (index < 0 || index >= queue.length) return;

    const song = queue[index];
    setCurrentIndex(index);
    _playSongObject(song);
  };

  // PLAY / PAUSE TOGGLE
  const togglePlay = () => {
    if (!currentSongRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // NEXT SONG
  const nextSong = () => {
    if (!queue || queue.length === 0) return;
    const hasNext = currentIndex + 1 < queue.length;
    if (!hasNext) return;

    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);
    _playSongObject(queue[newIndex]);
  };

  // PREVIOUS SONG
  const prevSong = () => {
    if (!queue || queue.length === 0) return;
    const hasPrev = currentIndex - 1 >= 0;
    if (!hasPrev) return;

    const newIndex = currentIndex - 1;
    setCurrentIndex(newIndex);
    _playSongObject(queue[newIndex]);
  };

  // SEEK (timeline drag)
  const setSeek = (value) => {
    const sec = Number(value);
    audioRef.current.currentTime = sec;
    setProgress(sec);
  };

  // VOLUME SLIDER
  const setVolume = (value) => {
    const v = parseFloat(value);
    audioRef.current.volume = v;
    setVolumeState(v);

    if (v > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  // MUTE / UNMUTE
  const toggleMute = () => {
    if (!isMuted) {
      setLastVolume(volume || 1);
      audioRef.current.volume = 0;
      setVolumeState(0);
      setIsMuted(true);
    } else {
      audioRef.current.volume = lastVolume;
      setVolumeState(lastVolume);
      setIsMuted(false);
    }
  };

  // AUDIO EVENT LISTENERS
  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setProgress(audio.currentTime || 0);

      // ⭐ Count stream after 5s of listening
      if (
        !hasCountedRef.current &&
        audio.currentTime >= 5 &&
        currentSongRef.current &&
        currentSongRef.current._id
      ) {
        hasCountedRef.current = true; // prevent double counting
        sendPlayStat(currentSongRef.current._id);
      }
    };

    const handleLoaded = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);

      // When the song fully ends, also make sure we don't count again
      hasCountedRef.current = true;

      // Auto-next
      if (queue.length > 0 && currentIndex + 1 < queue.length) {
        nextSong();
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoaded);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoaded);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [queue, currentIndex]); // queue/index only affect auto-next

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        progress,
        duration,
        volume,
        isMuted,

        playSong,
        setQueue,
        playFromQueue,
        togglePlay,
        nextSong,
        prevSong,
        setSeek,
        setVolume,
        toggleMute,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}
