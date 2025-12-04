import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import PlayerBar from "../components/PlayerBar";

import { getAllAlbums } from "../api/albumApi";
import { searchAll } from "../api/searchApi";   // ⭐ NEW

import "./HomePage.css";

function HomePage() {
  const navigate = useNavigate();

  const [recommended, setRecommended] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);

  // ⭐ SEARCH STATES
  const [searchQuery, setSearchQuery] = useState("");
  const [displayAlbums, setDisplayAlbums] = useState([]);
  const [displaySongs, setDisplaySongs] = useState([]);

  // Load user
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const username = storedUser?.username || "User";
  const userEmail = storedUser?.email;

  // Load albums initially
  useEffect(() => {
    getAllAlbums().then((data) => {
      if (!data || data.length === 0) return;

      // Recommended (not your albums)
      let rec = data.filter((album) => album.artist !== userEmail);
      if (rec.length < 6) rec = data;
      setRecommended(rec.slice(0, 6));

      // Recently added / played
      const recent = [...data].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setRecentlyPlayed(recent.slice(0, 6));

      // ⭐ For search: default display all albums
      setDisplayAlbums(data);
    });
  }, []);

  const openAlbum = (id) => navigate(`/album/${id}`);

  // ⭐ SEARCH HANDLER (same logic as ExplorePage)
  const handleSearchChange = async (value) => {
    setSearchQuery(value);

    if (!value.trim()) {
      // Reset page back to normal HomePage mode
      getAllAlbums().then((data) => setDisplayAlbums(data));
      setDisplaySongs([]);
      return;
    }

    try {
      const res = await searchAll(value);
      setDisplayAlbums(res.albums || []);
      setDisplaySongs(res.songs || []);
    } catch (err) {
      console.error("Home search error:", err);
    }
  };

  return (
    <div className="home-container">
      <Sidebar />

      <div className="main-content">
        {/* ⭐ MAKE TopBar PASS SEARCH PROPS */}
        <TopBar
          username={username}
          searchValue={searchQuery}
          onSearchChange={handleSearchChange}
        />

        <div className="content-scroll">
          {/* If searching → hide home sections, show results */}
          {searchQuery.trim() ? (
            <>
              {/* SONG RESULTS */}
              <h2 className="section-title">Songs</h2>
              <div className="song-results">
                {displaySongs.length === 0 && (
                  <p className="empty-text">No songs found.</p>
                )}

                {displaySongs.map((song) => (
  <div
    key={song._id}
    className="song-result-item"
    onClick={() => openAlbum(song.albumId)}  // ⭐ FIXED
  >
    🎵 {song.title}
  </div>
))}

              </div>

              {/* ALBUM RESULTS */}
              <h2 className="section-title">Albums</h2>
              <div className="album-grid">
                {displayAlbums.length === 0 && (
                  <p className="empty-text">No albums found.</p>
                )}

                {displayAlbums.map((album) => (
                  <div
                    key={album._id}
                    className="album-card"
                    onClick={() => openAlbum(album._id)}
                  >
                    <img
                      src={`http://localhost:5000${album.coverImage}`}
                      className="album-cover-img"
                      alt="cover"
                    />
                    <div className="album-title">{album.title}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* NORMAL HOMEPAGE (no search) */}

              {/* RECOMMENDED */}
              <h2 className="section-title">Recommend for you</h2>
              <div className="album-grid">
                {recommended.map((album) => (
                  <div
                    className="album-card"
                    key={album._id}
                    onClick={() => openAlbum(album._id)}
                  >
                    <img
                      src={`http://localhost:5000${album.coverImage}`}
                      className="album-cover-img"
                      alt="cover"
                    />
                    <div className="album-title">{album.title}</div>
                  </div>
                ))}
              </div>

              {/* RECENTLY PLAYED */}
              <h2 className="section-title">Recently played</h2>
              <div className="album-grid">
                {recentlyPlayed.map((album) => (
                  <div
                    className="album-card"
                    key={album._id}
                    onClick={() => openAlbum(album._id)}
                  >
                    <img
                      src={`http://localhost:5000${album.coverImage}`}
                      className="album-cover-img"
                      alt="cover"
                    />
                    <div className="album-title">{album.title}</div>
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

export default HomePage;
