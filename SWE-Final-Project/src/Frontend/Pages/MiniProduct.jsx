import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Css/MiniProduct.css";

export default function MiniProduct({ product, onCartChange }) {
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);
  const [rating, setRating] = useState({ average: null, count: 0 });

  let thumbnail = "";
  try {
    const imgs = JSON.parse(product.images);
    thumbnail = imgs[0] || "";
  } catch {
    thumbnail = "";
  }

  useEffect(() => {
    fetch(`/api/ratings/${product.id}/summary`)
      .then(r => r.json())
      .then(data => setRating(data))
      .catch(() => {});
  }, [product.id]);

  const stock = Number(product.quantity_remaining ?? 0);
  const soldOut = stock <= 0;

  const getCartQtyForProduct = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    return cart.filter(i => i.id === product.id).length;
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (soldOut) return;

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const currentQty = cart.filter(i => i.id === product.id).length;
    if (currentQty >= stock) return; // hard block

    cart.push(product);
    localStorage.setItem("cart", JSON.stringify(cart));
    setAdded(true);
    if (onCartChange) onCartChange(cart.length);
    setTimeout(() => setAdded(false), 1500);
  };

  const avg = rating.average ? Number(rating.average) : 0;
  const fullStars = Math.floor(avg);
  const hasHalf = avg - fullStars >= 0.5;

  const renderStars = () =>
    [1, 2, 3, 4, 5].map(s => {
      let cls = "mp-star empty";
      if (s <= fullStars) cls = "mp-star filled";
      else if (s === fullStars + 1 && hasHalf) cls = "mp-star half";
      return <span key={s} className={cls}>★</span>;
    });

  return (
    <div className={`mini-product${soldOut ? " sold-out" : ""}`} onClick={() => navigate(`/product/${product.id}`)}>
      <div className="mini-product-image-wrapper">
        {thumbnail ? (
          <img src={thumbnail} alt={product.name} />
        ) : (
          <div className="mini-product-placeholder">No Image</div>
        )}
        {soldOut && <div className="mini-sold-out-overlay">SOLD OUT</div>}
      </div>

      <p className="mini-product-title">{product.name}</p>
      <p className="mini-product-price">${Number(product.price).toFixed(2)}</p>

      <div className="mini-product-rating">
        {rating.count > 0 ? (
          <>
            <div className="mini-stars">{renderStars()}</div>
            <span className="mini-rating-count">({rating.count})</span>
          </>
        ) : (
          <span className="mini-no-ratings">No ratings yet</span>
        )}
      </div>

      <p className="mini-stock">
        {soldOut
          ? <span className="mini-out-stock">Out of Stock</span>
          : stock <= 5
            ? <span className="mini-low-stock">Only {stock} left!</span>
            : <span className="mini-in-stock">In Stock ({stock})</span>
        }
      </p>

      <button
        className="mini-add-btn"
        onClick={handleAddToCart}
        disabled={soldOut}
      >
        {soldOut ? "Sold Out" : added ? "Added!" : "Add to Cart"}
      </button>
    </div>
  );
}