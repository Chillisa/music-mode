import React from "react";
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


function App() {
  return (
    <Router>
      <Routes>

        {/* Landing */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth screens */}
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Music pages */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/album/:id" element={<AlbumPage />} />

        <Route path="/upload" element={<UploadPage />} />

        <Route path="/artist-library" element={<ArtistLibraryPage />} />
        <Route path="/album/:id/edit" element={<EditAlbumPage />} />

        <Route path="/explore" element={<ExplorePage />} />

      </Routes>
    </Router>
  );
}

export default App;
