// src/App.js
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import AlbumPage from "./pages/AlbumPage";
import EditAlbumPage from "./pages/EditAlbumPage";
import UploadPage from "./pages/UploadPage";
import ArtistLibraryPage from "./pages/ArtistLibraryPage";
import ExplorePage from "./pages/ExplorePage";
import FavoriteSongsPage from "./pages/FavoriteSongsPage";

function App() {
  const [albums, setAlbums] = useState([]);

  // 🔥 FETCH ALL ALBUMS ONCE
  useEffect(() => {
    fetch("http://localhost:5000/api/albums")
      .then((res) => res.json())
      .then((data) => setAlbums(data))
      .catch((err) => console.error("Failed to fetch albums:", err));
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/home" element={<HomePage />} />

        <Route path="/album/:id" element={<AlbumPage />} />
        <Route path="/album/:id/edit" element={<EditAlbumPage />} />

        <Route path="/upload" element={<UploadPage />} />
        <Route path="/artist-library" element={<ArtistLibraryPage />} />

        {/* 🔥 PASS ALBUMS INTO EXPLORE PAGE */}
        <Route path="/explore" element={<ExplorePage allAlbums={albums} />} />

        <Route path="/favorites" element={<FavoriteSongsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
