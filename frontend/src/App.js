import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";

import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";

import AlbumPage from "./pages/AlbumPage";
import EditAlbumPage from "./pages/EditAlbumPage";
import UploadPage from "./pages/UploadPage";
import ArtistLibraryPage from "./pages/ArtistLibraryPage";
import ExplorePage from "./pages/ExplorePage";
import FavoriteSongsPage from "./pages/FavoriteSongsPage";
import YourPlaylistsPage from "./pages/YourPlaylistsPage";
import PlaylistPage from "./pages/PlaylistPage";

import AlbumStatsPage from "./pages/AlbumStatsPage";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* PROTECTED */}
        <Route path="/home" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />

        <Route
  path="/profile"
  element={
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  }
/>

        <Route path="/album/:id" element={
          <ProtectedRoute>
            <AlbumPage />
          </ProtectedRoute>
        } />

        <Route path="/album/:id/edit" element={
          <ProtectedRoute>
            <EditAlbumPage />
          </ProtectedRoute>
        } />

        <Route path="/album-stats/:id" element={
          <ProtectedRoute>
            <AlbumStatsPage />
          </ProtectedRoute>
        } />

        <Route path="/upload" element={
          <ProtectedRoute>
            <UploadPage />
          </ProtectedRoute>
        } />

        <Route path="/artist-library" element={
          <ProtectedRoute>
            <ArtistLibraryPage />
          </ProtectedRoute>
        } />

        <Route path="/your-playlists" element={
          <ProtectedRoute>
            <YourPlaylistsPage />
          </ProtectedRoute>
        } />

        <Route path="/playlist/:id" element={
          <ProtectedRoute>
            <PlaylistPage />
          </ProtectedRoute>
        } />

        <Route path="/explore" element={
          <ProtectedRoute>
            <ExplorePage />
          </ProtectedRoute>
        } />

        <Route path="/favorites" element={
          <ProtectedRoute>
            <FavoriteSongsPage />
          </ProtectedRoute>
        } />

      </Routes>
    </Router>
  );
}

export default App;
