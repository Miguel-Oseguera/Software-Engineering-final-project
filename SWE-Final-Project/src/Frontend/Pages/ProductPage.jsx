import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../Css/ProductPage.css";

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImg, setSelectedImg] = useState(0);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => setProduct(data));
  }, [id]);

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    for (let i = 0; i < quantity; i++) cart.push(product);
    localStorage.setItem("cart", JSON.stringify(cart));
    setAdded(true);
  };

  if (!product) return (
    <div className="pd-loading">
      <div className="pd-spinner" />
      <p>Loading product...</p>
    </div>
  );

  const images = JSON.parse(product.images || "[]");
  const hasMultipleImages = images.length > 1;

  return (
    <div className="pd-container">

      {/* HEADER */}
      <header className="pd-header">
        <div className="pd-logo-wrap" onClick={() => navigate("/")}>
          <span className="pd-logo-fake">fake</span>
          <span className="pd-logo-amazon">amazon</span>
          <p className="pd-tagline">NOT THE REAL ONE</p>
        </div>
        <div className="pd-search-wrap">
          <input className="pd-search" placeholder="Search..." />
        </div>
        <div className="pd-icons">
          <span className="pd-icon" onClick={() => navigate("/cart")}>🛒</span>
          <span className="pd-icon" onClick={() => navigate("/profile")}>👤</span>
        </div>
      </header>

      {/* NAV */}
      <nav className="pd-nav">
        {[["Home","/"],["Orders","/orders"],["Deals","/deals"],["Selling","/selling"],["Listings","/listings"],["Sold","/sold"]].map(([label, path]) => (
          <button key={label} className="pd-nav-btn" onClick={() => navigate(path)}>{label}</button>
        ))}
      </nav>

      {/* BREADCRUMB */}
      <div className="pd-breadcrumb">
        <span onClick={() => navigate("/")} className="pd-crumb-link">Home</span>
        <span className="pd-crumb-sep">›</span>
        <span className="pd-crumb-current">{product.name}</span>
      </div>

      {/* BACK */}
      <button className="pd-back-btn" onClick={() => navigate(-1)}>← Back to results</button>

      {/* PRODUCT BODY */}
      <div className="pd-body">

        {/* IMAGE COLUMN */}
        <div className="pd-images-col">
          {hasMultipleImages && (
            <div className="pd-thumbs">
              {images.map((src, i) => (
                <div
                  key={i}
                  className={`pd-thumb${selectedImg === i ? " active" : ""}`}
                  onClick={() => setSelectedImg(i)}
                >
                  <img src={src} alt={`view ${i + 1}`} />
                </div>
              ))}
            </div>
          )}
          <div className="pd-main-img-wrap">
            <img src={images[selectedImg] || images[0]} alt={product.name} className="pd-main-img" />
          </div>
        </div>

        {/* DETAILS COLUMN */}
        <div className="pd-details-col">
          <h1 className="pd-title">{product.name}</h1>

          <div className="pd-rating-row">
            <span className="pd-stars">★★★★☆</span>
            <span className="pd-rating-count">142 ratings</span>
          </div>

          <div className="pd-divider" />

          <div className="pd-price-block">
            <span className="pd-price-label">Price:</span>
            <span className="pd-price">${Number(product.price).toFixed(2)}</span>
          </div>

          <div className="pd-divider" />

          <div className="pd-description-block">
            <p className="pd-description-label">About this item</p>
            <p className="pd-description">{product.description}</p>
          </div>

          <div className="pd-divider" />

          {/* QUANTITY */}
          <div className="pd-quantity-row">
            <span className="pd-qty-label">Quantity:</span>
            <div className="pd-qty-control">
              <button className="pd-qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
              <span className="pd-qty-value">{quantity}</span>
              <button className="pd-qty-btn" onClick={() => setQuantity(q => q + 1)}>+</button>
            </div>
          </div>

          {/* ADD TO CART */}
          <div className="pd-actions">
            <button
              className={`pd-add-btn${added ? " added" : ""}`}
              onClick={handleAddToCart}
              disabled={added}
            >
              {added ? `✓ Added ${quantity} to Cart` : "Add to Cart"}
            </button>

            {added && (
              <button className="pd-go-cart-btn" onClick={() => navigate("/cart")}>
                Go to Cart →
              </button>
            )}
          </div>

          {/* DELIVERY */}
          <div className="pd-delivery-box">
            <p className="pd-delivery-title">📦 Delivery</p>
            <p className="pd-delivery-text">FREE delivery on orders over $25</p>
            <p className="pd-delivery-text">Estimated 3–5 business days</p>
          </div>

          <div className="pd-stock-row">
            <span className="pd-in-stock">✔ In Stock</span>
          </div>
        </div>

      </div>
    </div>
  );
}