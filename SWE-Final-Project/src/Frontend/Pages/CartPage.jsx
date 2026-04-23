import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MiniProductCart from "./MiniProductCart";
import "../Css/CartPage.css";

export default function CartPage() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState(
    () => JSON.parse(localStorage.getItem("cart")) || []
  );
  const [orderedItems, setOrderedItems] = useState(
    () => JSON.parse(localStorage.getItem("ordered")) || []
  );
  const [purchased, setPurchased] = useState(false);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem("ordered", JSON.stringify(orderedItems));
  }, [orderedItems]);

  const handleRemove = (index) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
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

    setOrderedItems([...orderedItems, ...cartItems]);
    setCartItems([]);
    setPurchased(true);
    setTimeout(() => setPurchased(false), 4000);
  };

  const total = cartItems.reduce((sum, item) => sum + Number(item.price || 0), 0);

  return (
    <div className="cart-container">

      {/* HEADER */}
      <header className="cart-header">
        <div className="cart-logo-wrap" onClick={() => navigate("/")}>
          <span className="cart-logo-fake">fake</span>
          <span className="cart-logo-amazon">amazon</span>
          <p className="cart-tagline">NOT THE REAL ONE</p>
        </div>
        <div className="cart-search-wrap">
          <input className="cart-search" placeholder="Search..." />
        </div>
        <div className="cart-icons">
          <span className="cart-icon cart-icon-active" onClick={() => navigate("/cart")}>🛒</span>
          <span className="cart-icon" onClick={() => navigate("/profile")}>👤</span>
        </div>
      </header>

      {/* NAV */}
      <nav className="cart-nav">
        {[["Home","/"],["Orders","/orders"],["Deals","/deals"],["Selling","/selling"],["Listings","/listings"],["Sold","/sold"]].map(([label, path]) => (
          <button key={label} className="cart-nav-btn" onClick={() => navigate(path)}>{label}</button>
        ))}
      </nav>

      {/* SUCCESS BANNER */}
      {purchased && (
        <div className="cart-success-banner">
          ✅ Order placed successfully! Check your <span onClick={() => navigate("/orders")}>Orders</span> page.
        </div>
      )}

      {/* PAGE TITLE */}
      <div className="cart-page-title">
        <h1>Shopping Cart</h1>
        {cartItems.length > 0 && (
          <span className="cart-count">{cartItems.length} item{cartItems.length !== 1 ? "s" : ""}</span>
        )}
      </div>

      {/* BODY */}
      <div className="cart-body">

        {/* ITEMS LIST */}
        <div className="cart-items-col">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛒</div>
              <p className="cart-empty-title">Your cart is empty</p>
              <p className="cart-empty-sub">Looks like you haven't added anything yet.</p>
              <button className="cart-shop-btn" onClick={() => navigate("/")}>Start Shopping</button>
            </div>
          ) : (
            cartItems.map((item, index) => (
              <div key={index} className="cart-item-row">
                <MiniProductCart product={item} />
                <div className="cart-item-actions">
                  <span className="cart-item-price">${Number(item.price || 0).toFixed(2)}</span>
                  <button className="cart-remove-btn" onClick={() => handleRemove(index)}>Remove</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ORDER SUMMARY SIDEBAR */}
        {cartItems.length > 0 && (
          <aside className="cart-summary">
            <h2 className="cart-summary-title">Order Summary</h2>

            <div className="cart-summary-rows">
              {cartItems.map((item, i) => (
                <div key={i} className="cart-summary-row">
                  <span className="cart-summary-item-name">{item.name || item.title || "Item"}</span>
                  <span>${Number(item.price || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="cart-summary-divider" />

            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="cart-summary-row">
              <span>Shipping</span>
              <span className="cart-free">FREE</span>
            </div>
            <div className="cart-summary-row cart-summary-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <button className="cart-purchase-btn" onClick={handlePurchase}>
              Purchase ({cartItems.length} item{cartItems.length !== 1 ? "s" : ""})
            </button>

            <p className="cart-secure-note">🔒 Secure checkout</p>
          </aside>
        )}
      </div>

    </div>
  );
}