// src/context/PlayerContext.js
import { createContext, useState, useRef, useEffect } from "react";

export const PlayerContext = createContext();

export function PlayerProvider({ children }) {
  const audioRef = useRef(new Audio());

  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [progress, setProgress] = useState(0);   // seconds
  const [duration, setDuration] = useState(0);   // seconds
  const [volume, setVolumeState] = useState(1);  // 0 → 1

  const [queue, setQueueState] = useState([]);   // list of songs (for prev/next)
  const [currentIndex, setCurrentIndex] = useState(-1);

  const [isMuted, setIsMuted] = useState(false);
  const [lastVolume, setLastVolume] = useState(1);

  // Small helper: format an audio URL from a song
 // Small helper: format an audio URL from a song
const getStreamUrl = (song) =>
  `http://localhost:5000/api/songs/stream/${song._id}`;   // ✅ backend port


  // -------------------------------
  // MAIN PLAY FUNCTION (internal)
  // -------------------------------
  const _playSongObject = (song) => {
    if (!song) return;

    const url = getStreamUrl(song);

    audioRef.current.src = url;
    audioRef.current.volume = volume;
    audioRef.current.play();

    setCurrentSong(song);
    setIsPlaying(true);
  };

  // Public: play a single song (outside of queue)
  const playSong = (song) => {
    setQueueState([]);          // clear queue so prev/next don’t do weird stuff
    setCurrentIndex(-1);
    _playSongObject(song);
  };

  // Public: set the whole queue at once
  const setQueue = (songs) => {
    setQueueState(songs || []);
    // don’t auto-play, AlbumPage will explicitly call playFromQueue
  };

  // Public: play a song from the queue by index
  const playFromQueue = (index) => {
    if (!queue || queue.length === 0) return;
    if (index < 0 || index >= queue.length) return;

    const song = queue[index];
    setCurrentIndex(index);
    _playSongObject(song);
  };

  // ---- PLAY / PAUSE TOGGLE ----
  const togglePlay = () => {
    if (!currentSong) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // ---- NEXT / PREVIOUS ----
  const nextSong = () => {
    if (!queue || queue.length === 0) return;
    const hasNext = currentIndex + 1 < queue.length;
    if (!hasNext) return;
    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);
    _playSongObject(queue[newIndex]);
  };

  const prevSong = () => {
    if (!queue || queue.length === 0) return;
    const hasPrev = currentIndex - 1 >= 0;
    if (!hasPrev) return;
    const newIndex = currentIndex - 1;
    setCurrentIndex(newIndex);
    _playSongObject(queue[newIndex]);
  };

  // ---- SEEK (TIMELINE DRAG) ----
  const setSeek = (value) => {
    const sec = Number(value);
    audioRef.current.currentTime = sec;
    setProgress(sec);
  };

  // ---- VOLUME SLIDER ----
  const setVolume = (value) => {
    const v = parseFloat(value);
    audioRef.current.volume = v;
    setVolumeState(v);

    if (v > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  // ---- MUTE / UNMUTE ----
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

  // ---- LISTEN TO AUDIO EVENTS ----
  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setProgress(audio.currentTime || 0);
    };

    const handleLoaded = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      // optional: auto-next
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
  }, [queue, currentIndex]); // eslint will complain if you don’t add deps

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
