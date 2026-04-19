import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MiniProductCart from "./MiniProductCart";
import "./CartPage.css";

export default function CartPage() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState(
    () => JSON.parse(localStorage.getItem("cart")) || []
  );
  const [orderedItems, setOrderedItems] = useState(
    () => JSON.parse(localStorage.getItem("ordered")) || []
  );

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem("ordered", JSON.stringify(orderedItems));
  }, [orderedItems]);

  const handleRemove = (index) => {
    const updated = cartItems.filter((_, i) => i !== index);
    setCartItems(updated);
  };

  const handlePurchase = async () => {
    if (cartItems.length === 0) return;
    const raw = localStorage.getItem("user");
    const buyer = raw ? ((() => { try { return JSON.parse(raw).username; } catch { return raw; } })()) : "";

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cartItems, buyer }),
      });
      const data = await res.json();
      if (!data.success) { alert("Purchase failed. Try again."); return; }
    } catch {
      alert("Could not connect to server.");
      return;
    }

    const newOrdered = [...orderedItems, ...cartItems];
    setOrderedItems(newOrdered);
    setCartItems([]);
  };

  const total = cartItems.reduce((sum, item) => sum + Number(item.price || 0), 0);

  return (
    <div className="cart-container">

      {/* HEADER */}
      <header className="header">
        <div className="left-logo">
          <div className="logo">
            fake<span className="amazon">amazon</span>
          </div>
          <p className="tagline">NOT THE REAL ONE</p>
        </div>

        <div className="center-search">
          <input className="search-bar" placeholder="Search..." />
        </div>

        <div className="right-icons">
          <div className="icon" onClick={() => navigate("/cart")}>🛒</div>
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

      {/* CART ITEMS */}
      <div className="cart-items">
        {cartItems.length === 0 ? (
          <p className="empty">Your cart is empty.</p>
        ) : (
          cartItems.map((item, index) => (
            <div key={index} className="cart-item-row">
              <MiniProductCart product={item} />
              <button className="remove-btn" onClick={() => handleRemove(index)}>Remove</button>
            </div>
          ))
        )}
      </div>

      {/* TOTAL + PURCHASE */}
      {cartItems.length > 0 && (
        <div className="cart-footer">
          <span className="cart-total">Total: ${total.toFixed(2)}</span>
          <button className="purchase-btn" onClick={handlePurchase}>
            Purchase ({cartItems.length} item{cartItems.length !== 1 ? "s" : ""})
          </button>
        </div>
      )}

    </div>
  );
}