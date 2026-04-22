import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../Css/ProductPage.css";

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => setProduct(data));
  }, [id]);

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push(product);
    localStorage.setItem("cart", JSON.stringify(cart));
    setAdded(true);
  };

  if (!product) return <p>Loading...</p>;

  const images = JSON.parse(product.images || "[]");

  return (
    <div className="product-container">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
      <div className="product-content">
        <div className="product-images">
          <img src={images[0]} alt={product.name} />
        </div>

        <div className="product-details">
          <h1>{product.name}</h1>
          <p className="price">${product.price}</p>
          <p className="description">{product.description}</p>
          <button className="add-to-cart-btn" onClick={handleAddToCart} disabled={added}>
            {added ? "Added to Cart!" : "Add to Cart"}
          </button>
          {added && (
            <button className="add-to-cart-btn" onClick={() => navigate("/cart")} style={{ marginTop: "8px" }}>
              Go to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}