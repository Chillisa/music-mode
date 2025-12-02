import React from "react";
import "./LandingPage.css";
import Logo from "../components/Logo";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="landing-container">
      <div className="landing-grid">

        {/* LEFT SIDE (Logo) */}
        <div className="landing-left">
          <Logo />
        </div>

        {/* RIGHT SIDE (Text + Buttons) */}
        <div className="landing-right">
          <h1 className="landing-title">
            Want to find <br /> your music?
          </h1>

          <div className="landing-buttons">
            <Link to="/signup">
              <button className="btn btn-primary">Sign up</button>
            </Link>

            <Link to="/login">
              <button className="btn btn-secondary">Log in</button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
