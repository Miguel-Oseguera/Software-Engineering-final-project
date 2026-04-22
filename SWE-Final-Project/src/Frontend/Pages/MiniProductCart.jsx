import React from "react";
import "../Css/MiniProductCart.css";

export default function MiniProductCart({ product }) {
  if (!product) return null;

  let thumbnail = "";
  let name = product.name || "Unknown Product";
  let price = product.price ?? "N/A";

  try {
    const imgs = JSON.parse(product.images || "[]");
    thumbnail = imgs[0] || "";
  } catch {
    thumbnail = "";
  }

  return (
    <div className="mini-cart-item">
      {thumbnail ? (
        <img className="mini-cart-img" src={thumbnail} alt={name} />
      ) : (
        <div className="mini-cart-img placeholder">No Image</div>
      )}

      <div className="mini-cart-info">
        <p className="mini-cart-title">{name}</p>
        <p className="mini-cart-price">${price}</p>
      </div>
    </div>
  );
}