import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Css/MainPage.css";

function ProductWidget({ title, products }) {
  const navigate = useNavigate();

  const getThumbnail = (product) => {
    try {
      const imgs = JSON.parse(product.images);
      return imgs[0] || "";
    } catch {
      return "";
    }
  };

  return (
    <div className="widget-card">
      <h3 className="widget-title">{title}</h3>
      <div className="widget-grid">
        {products.slice(0, 4).map((product) => (
          <div
            key={product.id}
            className="widget-item"
            onClick={() => navigate(`/product/${product.id}`)}
          >
            {getThumbnail(product) ? (
              <img src={getThumbnail(product)} alt={product.name} />
            ) : (
              <div className="widget-placeholder">No Image</div>
            )}
            <p className="widget-item-name">{product.name}</p>
          </div>
        ))}
      </div>
      <p className="widget-see-more" onClick={() => navigate("/listings")}>
        See more
      </p>
    </div>
  );
}

export default function MainPage() {
  const navigate = useNavigate();

  const [trending, setTrending] = useState([]);
  const [newest, setNewest] = useState([]);
  const [cartCount, setCartCount] = useState(
    () => (JSON.parse(localStorage.getItem("cart")) || []).length
  );

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

  // Split products into groups of 4 for multiple widgets
  const chunkArray = (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  const trendingChunks = chunkArray(trending, 4);
  const newestChunks = chunkArray(newest, 4);

  return (
    <div className="home-container">

      {/* HEADER */}
      <header className="header">
        <div className="left-logo">
          <div className="logo">fake<span className="amazon">amazon</span></div>
          <p className="tagline">NOT THE REAL ONE</p>
        </div>

        <div className="center-search">
          <input className="search-bar" placeholder="Search..." />
        </div>

        <div className="right-icons">
          <div className="icon cart-icon" onClick={() => navigate("/cart")}>
            🛒
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </div>
          <div className="icon" onClick={() => navigate("/profile")}>👤</div>
        </div>
      </header>

      {/* NAV */}
      <nav className="nav-buttons">
        <button onClick={() => navigate("/")}>Home</button>
        <button onClick={() => navigate("/orders")}>Orders</button>
        <button>Deals</button>
        <button onClick={() => navigate("/selling")}>Selling</button>
        <button onClick={() => navigate("/listings")}>Listings</button>
        <button onClick={() => navigate("/sold")}>Sold</button>
      </nav>

      {/* WIDGET SECTIONS */}
      <div className="widgets-area">

        {/* TRENDING WIDGETS */}
        {trendingChunks.length === 0 ? (
          <div className="widget-card"><p className="loading-text">Loading featured products...</p></div>
        ) : (
          trendingChunks.map((chunk, i) => (
            <ProductWidget key={`trending-${i}`} title={i === 0 ? "Featured Products" : "More Featured"} products={chunk} />
          ))
        )}

        {/* NEWEST WIDGETS */}
        {newestChunks.length === 0 ? (
          <div className="widget-card"><p className="loading-text">Loading new products...</p></div>
        ) : (
          newestChunks.map((chunk, i) => (
            <ProductWidget key={`newest-${i}`} title={i === 0 ? "New Arrivals" : "More New Arrivals"} products={chunk} />
          ))
        )}

      </div>
    </div>
  );
}