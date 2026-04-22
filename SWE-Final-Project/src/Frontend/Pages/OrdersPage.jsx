import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MiniProductOrder from "./MiniProductOrder";
import "../Css/OrdersPage.css";

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("ordered")) || [];
    const grouped = {};
    stored.forEach(item => {
      const key = item.id;
      if (!grouped[key]) grouped[key] = { ...item, quantity: 1 };
      else grouped[key].quantity += 1;
    });
    setOrders(Object.values(grouped));
  }, []);

  const filtered = orders.filter(o =>
    o.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="orders-container">

      {/* HEADER */}
      <header className="header">
        <div className="left-logo">
          <div className="logo">
            fake<span className="amazon">amazon</span>
          </div>
          <p className="tagline">NOT THE REAL ONE</p>
        </div>

        <div className="center-search">
          <input className="search-bar" placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="right-icons">
          <div className="icon" onClick={() => navigate("/cart")}>🛒</div>
          <div className="icon" onClick={() => navigate("/profile")}>👤</div>
        </div>
      </header>

      {/* NAV */}
      <nav className="nav-buttons">
        <button onClick={() => navigate("/")}>Home</button>
        <button className="active">Orders</button>
        <button>Deals</button>
        <button onClick={() => navigate("/selling")}>Selling</button>
        <button onClick={() => navigate("/listings")}>Listings</button>
        <button onClick={() => navigate("/sold")}>Sold</button>
      </nav>

      {/* ORDERS LIST */}
      <div className="orders-list">
        {orders.length === 0 ? (
          <p className="empty">No orders yet.</p>
        ) : filtered.length === 0 ? (
          <p className="empty">No orders match your search.</p>
        ) : (
          filtered.map((item, index) => (
            <MiniProductOrder key={index} product={item} quantity={item.quantity} />
          ))
        )}
      </div>

    </div>
  );
}