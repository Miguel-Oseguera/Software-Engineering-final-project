import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../Css/DealsPage.css";

function DealCard({ product, onCartChange }) {
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);

  let thumbnail = "";
  try {
    const imgs = JSON.parse(product.images);
    thumbnail = imgs[0] || "";
  } catch {
    thumbnail = "";
  }

  const discount = Math.round(
    ((product.original_price - product.price) / product.original_price) * 100
  );

  const savings = (product.original_price - product.price).toFixed(2);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push(product);
    localStorage.setItem("cart", JSON.stringify(cart));
    setAdded(true);
    if (onCartChange) onCartChange(cart.length);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="dp-card" onClick={() => navigate(`/product/${product.id}`)}>
      <div className="dp-badge">-{discount}%</div>

      <div className="dp-card-img-wrap">
        {thumbnail ? (
          <img className="dp-card-img" src={thumbnail} alt={product.name} />
        ) : (
          <div className="dp-card-no-img">No Image</div>
        )}
      </div>

      <div className="dp-card-info">
        <p className="dp-card-name">{product.name}</p>

        <div className="dp-card-prices">
          <span className="dp-card-price">${Number(product.price).toFixed(2)}</span>
          <span className="dp-card-original">${Number(product.original_price).toFixed(2)}</span>
        </div>

        <p className="dp-card-savings">You save ${savings}</p>

        {product.quantity_remaining > 0 ? (
          <p className="dp-card-stock-ok">In Stock</p>
        ) : (
          <p className="dp-card-stock-out">Out of Stock</p>
        )}

        <button
          className={`dp-add-btn${added ? " added" : ""}`}
          onClick={handleAddToCart}
        >
          {added ? "Added!" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

export default function DealsPage() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(
    () => (JSON.parse(localStorage.getItem("cart")) || []).length
  );

  const [search, setSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minDiscount, setMinDiscount] = useState(10);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState("discount-desc");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    fetch("/api/products/deals")
      .then(res => res.json())
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setProducts([]);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    let list = products.filter(p => {
      const discount = ((p.original_price - p.price) / p.original_price) * 100;
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description || "").toLowerCase().includes(search.toLowerCase());
      const matchMax = maxPrice === "" || Number(p.price) <= Number(maxPrice);
      const matchDiscount = discount >= Number(minDiscount);
      const matchStock = !inStockOnly || p.quantity_remaining > 0;
      return matchSearch && matchMax && matchDiscount && matchStock;
    });

    if (sort === "discount-desc") {
      return [...list].sort((a, b) => {
        const da = (a.original_price - a.price) / a.original_price;
        const db = (b.original_price - b.price) / b.original_price;
        return db - da;
      });
    }
    if (sort === "price-asc") return [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return [...list].sort((a, b) => b.price - a.price);
    if (sort === "name") return [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [products, search, maxPrice, minDiscount, inStockOnly, sort]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const clearFilters = () => {
    setSearch("");
    setMaxPrice("");
    setMinDiscount(10);
    setInStockOnly(false);
    setSort("discount-desc");
    setPage(1);
  };

  const navLinks = [
    ["Home", "/"],
    ["Orders", "/orders"],
    ["Deals", "/deals"],
    ["Selling", "/selling"],
    ["Listings", "/listings"],
    ["Sold", "/sold"],
  ];

  return (
    <div className="dp-container">

      {/* HEADER */}
      <header className="dp-header">
        <div className="dp-logo-wrap" onClick={() => navigate("/")}>
          <span className="dp-logo-fake">fake</span>
          <span className="dp-logo-amazon">amazon</span>
          <p className="dp-tagline">NOT THE REAL ONE</p>
        </div>

        <div className="dp-search-wrap">
          <input
            className="dp-search"
            placeholder="Search deals..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          <button className="dp-search-btn">🔍</button>
        </div>

        <div className="dp-icons">
          <div className="dp-icon" onClick={() => navigate("/cart")}>
            🛒
            {cartCount > 0 && <span className="dp-cart-badge">{cartCount}</span>}
          </div>
          <div className="dp-icon" onClick={() => navigate("/profile")}>👤</div>
        </div>
      </header>

      {/* NAV */}
      <nav className="dp-nav">
        {navLinks.map(([label, path]) => (
          <button
            key={label}
            className={`dp-nav-btn${label === "Deals" ? " active" : ""}`}
            onClick={() => navigate(path)}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* BANNER */}
      <div className="dp-banner">
        <div className="dp-banner-left">
          <h1 className="dp-banner-title">Today's <span>Deals</span></h1>
          <span className="dp-banner-sub">LIMITED TIME OFFERS</span>
        </div>
        <div className="dp-banner-count">
          {filtered.length} deal{filtered.length !== 1 ? "s" : ""} available
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="dp-filter-bar">
        <span className="dp-filter-label">Max Price</span>
        <input
          className="dp-filter-input"
          type="number"
          placeholder="Any"
          value={maxPrice}
          onChange={e => { setMaxPrice(e.target.value); setPage(1); }}
        />

        <span className="dp-filter-sep">|</span>

        <span className="dp-filter-label">Min Discount</span>
        <input
          className="dp-filter-input"
          type="number"
          min="0"
          max="90"
          value={minDiscount}
          onChange={e => { setMinDiscount(e.target.value); setPage(1); }}
        />
        <span className="dp-filter-label">%</span>

        <span className="dp-filter-sep">|</span>

        <label className="dp-filter-checkbox">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={e => { setInStockOnly(e.target.checked); setPage(1); }}
          />
          In Stock Only
        </label>

        <span className="dp-filter-sep">|</span>

        <select
          className="dp-filter-sort"
          value={sort}
          onChange={e => setSort(e.target.value)}
        >
          <option value="discount-desc">Biggest Discount</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name">Name A–Z</option>
        </select>

        <button className="dp-filter-clear" onClick={clearFilters}>Clear Filters</button>
      </div>

      {/* BODY */}
      <div className="dp-body">
        {(search || maxPrice || minDiscount !== 10 || inStockOnly) && (
          <div className="dp-results-header">
            <span>
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              {search && <> for "{search}"</>}
            </span>
            <button className="dp-inline-clear" onClick={clearFilters}>Clear all filters</button>
          </div>
        )}

        <div className="dp-grid">
          {loading ? (
            <div className="dp-loading">Loading deals...</div>
          ) : paginated.length === 0 ? (
            <div className="dp-empty">
              <p>No deals found matching your filters.</p>
              <button className="dp-filter-clear" onClick={clearFilters}>Clear all filters</button>
            </div>
          ) : (
            paginated.map(product => (
              <DealCard
                key={product.id}
                product={product}
                onCartChange={setCartCount}
              />
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="dp-pagination">
            <button
              className="dp-page-btn"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`dp-page-btn${page === i + 1 ? " active" : ""}`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button
              className="dp-page-btn"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}