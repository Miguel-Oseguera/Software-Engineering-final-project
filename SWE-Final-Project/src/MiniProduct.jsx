import React from "react";
import { useNavigate } from "react-router-dom";
import "./MiniProduct.css";

export default function MiniProduct({ product }) {
  const navigate = useNavigate();

  // Safely parse images array
  let thumbnail = "";
  try {
    const imgs = JSON.parse(product.images);
    thumbnail = imgs[0] || "";
  } catch {
    thumbnail = "";
  }

  return (
    <div
      className="mini-product"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="mini-product-image-wrapper">
        {thumbnail ? (
          <img src={thumbnail} alt={product.name} />
        ) : (
          <div className="mini-product-placeholder">No Image</div>
        )}
      </div>

      <p className="mini-product-title">{product.name}</p>
      <p className="mini-product-price">${product.price}</p>
    </div>
  );
}