import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MiniProduct.css";

export default function MiniProduct({ product, onCartChange }) {
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);

  let thumbnail = "";
  try {
    const imgs = JSON.parse(product.images);
    thumbnail = imgs[0] || "";
  } catch {
    thumbnail = "";
  }

  const handleAddToCart = (e) => {
    e.stopPropagation();
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push(product);
    localStorage.setItem("cart", JSON.stringify(cart));
    setAdded(true);
    if (onCartChange) onCartChange(cart.length);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="mini-product" onClick={() => navigate(`/product/${product.id}`)}>
      <div className="mini-product-image-wrapper">
        {thumbnail ? (
          <img src={thumbnail} alt={product.name} />
        ) : (
          <div className="mini-product-placeholder">No Image</div>
        )}
      </div>

      <p className="mini-product-title">{product.name}</p>
      <p className="mini-product-price">${product.price}</p>

      <button className="mini-add-btn" onClick={handleAddToCart}>
        {added ? "Added!" : "Add to Cart"}
      </button>
    </div>
  );
}