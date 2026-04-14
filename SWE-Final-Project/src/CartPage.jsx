import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MiniProductCart from "./MiniProductCart";
import "./CartPage.css";

export default function CartPage() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [orderedItems, setOrderedItems] = useState([]);

  // Load cart + ordered from localStorage
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    const storedOrdered = JSON.parse(localStorage.getItem("ordered")) || [];
    setCartItems(storedCart);
    setOrderedItems(storedOrdered);
  }, []);

  // Save cart changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Save ordered changes
  useEffect(() => {
    localStorage.setItem("ordered", JSON.stringify(orderedItems));
  }, [orderedItems]);

  // Purchase → move cart items to ordered
  const handlePurchase = () => {
    if (cartItems.length === 0) return;

    const newOrdered = [...orderedItems, ...cartItems];
    setOrderedItems(newOrdered);
    setCartItems([]);
  };

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
        <button>Selling</button>
        <button>Listings</button>
        <button>Sold</button>
      </nav>

      {/* CART ITEMS */}
      <div className="cart-items">
        {cartItems.length === 0 ? (
          <p className="empty">Your cart is empty.</p>
        ) : (
          cartItems.map((item, index) => (
            <MiniProductCart key={index} product={item} />
          ))
        )}
      </div>

      {/* PURCHASE BUTTON */}
      <button className="purchase-btn" onClick={handlePurchase}>
        Purchase
      </button>

    </div>
  );
}