import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MiniProduct from "./MiniProduct";
import "./ListingsPage.css";

export default function ListingsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [cartCount, setCartCount] = useState(
    () => (JSON.parse(localStorage.getItem("cart")) || []).length
  );

  useEffect(() => {
    fetch("/api/products/all")
      .then(res => res.json())
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]));
  }, []);

  const filtered = useMemo(() => {
    let list = products.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(search.toLowerCase())
    );
    if (sort === "newest") return list;
    if (sort === "price-asc") return [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return [...list].sort((a, b) => b.price - a.price);
    if (sort === "name") return [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [products, search, sort]);

  return (
    <div className="listings-container">

      <header className="header">
        <div className="left-logo">
          <div className="logo">fake<span className="amazon">amazon</span></div>
          <p className="tagline">NOT THE REAL ONE</p>
        </div>
        <div className="center-search">
          <input
            className="search-bar"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="right-icons">
          <div className="icon cart-icon" onClick={() => navigate("/cart")}>
            🛒
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </div>
          <div className="icon" onClick={() => navigate("/profile")}>👤</div>
        </div>
      </header>

      <nav className="nav-buttons">
        <button onClick={() => navigate("/")}>Home</button>
        <button onClick={() => navigate("/orders")}>Orders</button>
        <button>Deals</button>
        <button onClick={() => navigate("/selling")}>Selling</button>
        <button className="active" onClick={() => navigate("/listings")}>Listings</button>
        <button>Sold</button>
      </nav>

      <div className="listings-toolbar">
        <p className="listings-count">{filtered.length} product{filtered.length !== 1 ? "s" : ""}</p>
        <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>

      <div className="listings-grid">
        {products.length === 0 ? (
          <p className="empty">Loading products...</p>
        ) : filtered.length === 0 ? (
          <p className="empty">No products match your search.</p>
        ) : (
          filtered.map(product => (
            <MiniProduct key={product.id} product={product} onCartChange={setCartCount} />
          ))
        )}
      </div>

    </div>
  );
}
