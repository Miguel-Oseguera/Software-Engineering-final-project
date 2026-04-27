import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Css/SoldPage.css";
import Navbar from "../components/Navbar";

export default function SoldPage() {
  const navigate = useNavigate();
  const raw = localStorage.getItem("user");
  const username = raw ? ((() => { try { return JSON.parse(raw).username; } catch { return raw; } })()) : "";
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`/api/orders/sold/${username}`)
      .then(res => res.json())
      .then(data => { setSales(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = sales.filter(s =>
    s.product_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.buyer?.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = filtered.reduce((sum, s) => sum + Number(s.price || 0), 0);

  return (
    <div className="sold-container">

      <header className="header">
        <div className="left-logo">
          <div className="logo">fake<span className="amazon">amazon</span></div>
          <p className="tagline">NOT THE REAL ONE</p>
        </div>
        <div className="center-search">
          <input className="search-bar" placeholder="Search by product or buyer..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="right-icons">
          <div className="icon" onClick={() => navigate("/cart")}>🛒</div>
          <div className="icon" onClick={() => navigate("/profile")}>👤</div>
        </div>
      </header>

      <Navbar active="Sold" navClass="sold-nav" btnClass="sold-nav-btn" />

      <div className="sold-body">
        <div className="sold-header-row">
          <h2>Items You've Sold</h2>
          {sales.length > 0 && (
            <div className="sold-revenue">
              Total Revenue: <strong>${totalRevenue.toFixed(2)}</strong>
            </div>
          )}
        </div>

        {loading ? (
          <p className="empty">Loading...</p>
        ) : sales.length === 0 ? (
          <p className="empty">You haven't sold anything yet.</p>
        ) : filtered.length === 0 ? (
          <p className="empty">No sales match your search.</p>
        ) : (
          <table className="sold-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Buyer</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sale, i) => (
                <tr key={i}>
                  <td>{sale.product_name}</td>
                  <td>${Number(sale.price).toFixed(2)}</td>
                  <td>{sale.buyer || "Unknown"}</td>
                  <td>{sale.sold_at ? new Date(sale.sold_at).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
