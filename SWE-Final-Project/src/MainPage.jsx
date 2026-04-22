import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MiniProduct from "./MiniProduct";
import "./MainPage.css";

export default function MainPage() {
  const navigate = useNavigate();

  const [trending, setTrending] = useState([]);
  const [newest, setNewest] = useState([]);
  const [cartCount, setCartCount] = useState(
    () => (JSON.parse(localStorage.getItem("cart")) || []).length
  );

  // Fetch trending + newest products
  useEffect(() => {
    fetch("/api/products/trending")
      .then(res => res.json())
      .then(data => setTrending(data))
      .catch(err => console.error("Trending fetch error:", err));

    fetch("/api/products/newest")
      .then(res => res.json())
      .then(data => setNewest(data))
      .catch(err => console.error("Newest fetch error:", err));
  }, []);

  return (
    <div className="home-container">

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
          <div className="icon cart-icon" onClick={() => navigate("/cart")}>
            🛒
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </div>
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
        <button onClick={() => navigate("/sold")}>Sold</button>
      </nav>

      {/* FEATURED / TRENDING */}
      <div className="product-section">
        <h2>Featured Products</h2>

        <div className="product-grid">
          {trending.length === 0 ? (
            <p>Loading trending products...</p>
          ) : (
            trending.map(product => (
              <MiniProduct key={product.id} product={product} onCartChange={setCartCount} />
            ))
          )}
        </div>
      </div>

      {/* NEWEST */}
      <div className="product-section">
        <h2>More Products</h2>

        <div className="product-grid">
          {newest.length === 0 ? (
            <p>Loading newest products...</p>
          ) : (
            newest.map(product => (
              <MiniProduct key={product.id} product={product} onCartChange={setCartCount} />
            ))
          )}
        </div>
      </div>

    </div>
  );
}