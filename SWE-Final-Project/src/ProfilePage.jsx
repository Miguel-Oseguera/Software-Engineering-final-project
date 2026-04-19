import React from "react";
import { useNavigate } from "react-router-dom";
import "./ProfilePage.css";

export default function ProfilePage() {
  const navigate = useNavigate();

  // Safely load user info
  let username = "Unknown User";
  let email = "No email provided";

  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      username = user.username || username;
      email = user.email || email;
    }
  } catch (err) {
    console.error("Error reading user data:", err);
  }

  return (
    <div className="profile-container">

      {/* HEADER */}
      <header className="header">

        {/* LEFT LOGO */}
        <div className="left-logo">
          <div className="logo">
            fake<span className="amazon">amazon</span>
          </div>
          <p className="tagline">NOT THE REAL ONE</p>
        </div>

        {/* CENTER SEARCH */}
        <div className="center-search">
          <input className="search-bar" placeholder="Search..." />
        </div>

        {/* RIGHT ICONS */}
        <div className="right-icons">
          <div className="icon" onClick={() => navigate("/cart")}>🛒</div>
          <div className="icon" onClick={() => navigate("/profile")}>👤</div>
        </div>

      </header>

      {/* NAV BUTTONS */}
      <nav className="nav-buttons">
        <button onClick={() => navigate("/")}>Home</button>
        <button onClick={() => navigate("/orders")}>Orders</button>
        <button>Deals</button>
        <button onClick={() => navigate("/selling")}>Selling</button>
        <button onClick={() => navigate("/listings")}>Listings</button>
        <button>Sold</button>
      </nav>

      {/* PROFILE CONTENT */}
      <div className="profile-content">

        {/* LEFT USER ICON */}
        <div className="profile-icon">
          <div className="circle">
            {username.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* RIGHT DETAILS BOX */}
        <div className="details-box">
          <h2><strong>Account Information</strong></h2>

          <p>
            <strong>Username:</strong> {username}
          </p>

          <p>
            <strong>Email:</strong> {email}
          </p>
        </div>

      </div>

    </div>
  );
}