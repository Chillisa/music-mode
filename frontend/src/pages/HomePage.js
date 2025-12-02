import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import PlayerBar from "../components/PlayerBar";

import { getAllAlbums } from "../api/albumApi";

import "./HomePage.css";

function HomePage() {
  const navigate = useNavigate();
  const [recommended, setRecommended] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);

  // Load user
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const username = storedUser?.username || "User";
  const userEmail = storedUser?.email;

  useEffect(() => {
    getAllAlbums().then((data) => {
      if (!data || data.length === 0) return;

      // Recommended (not your albums)
      let rec = data.filter((album) => album.artist !== userEmail);
      if (rec.length < 6) rec = data;
      setRecommended(rec.slice(0, 6));

      // Recently Added → Recently Played feel
      const recent = [...data].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setRecentlyPlayed(recent.slice(0, 6));
    });
  }, []);

  const openAlbum = (id) => navigate(`/album/${id}`);

  return (
    <div className="home-container">
      <Sidebar />

      <div className="main-content">
        <TopBar username={username} />

        <div className="content-scroll">

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

        </div>

        <PlayerBar />
      </div>
    </div>
  );
}

export default HomePage;
