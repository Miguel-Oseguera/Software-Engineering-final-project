import React from "react";
import "../Css/MiniProductOrder.css";

export default function MiniProductOrder({ product, quantity }) {
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
    <div className="mini-order-item">
      {thumbnail ? (
        <img className="mini-order-img" src={thumbnail} alt={name} />
      ) : (
        <div className="mini-order-img placeholder">No Image</div>
      )}

      <div className="mini-order-info">
        <p className="mini-order-title">{name}</p>
        <p className="mini-order-price">${price}</p>
      </div>

      {quantity > 1 && (
        <div className="mini-order-qty">{quantity}</div>
      )}
    </div>
  );
}