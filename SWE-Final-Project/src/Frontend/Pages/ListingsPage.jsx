import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MiniProduct from "./MiniProduct";
import "../Css/ListingsPage.css";

const CATEGORIES = [
  "All", "beauty", "fragrances", "furniture", "groceries",
  "home-decoration", "kitchen-accessories", "laptops", "mens-shirts",
  "mens-shoes", "mens-watches", "mobile-accessories", "motorcycle",
  "skin-care", "smartphones", "sports-accessories", "sunglasses",
  "tablets", "tops", "vehicle", "womens-bags", "womens-dresses",
  "womens-jewellery", "womens-shoes", "womens-watches"
];

export default function ListingsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [sort, setSort] = useState("newest");
  const [category, setCategory] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
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
    let list = products.filter(p => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description || "").toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "All" ||
        (p.category || "").toLowerCase() === category.toLowerCase();
      const matchMin = minPrice === "" || Number(p.price) >= Number(minPrice);
      const matchMax = maxPrice === "" || Number(p.price) <= Number(maxPrice);
      const matchStock = !inStockOnly || p.quantity_remaining > 0;
      return matchSearch && matchCat && matchMin && matchMax && matchStock;
    });

    if (sort === "price-asc") return [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return [...list].sort((a, b) => b.price - a.price);
    if (sort === "name") return [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [products, search, sort, category, minPrice, maxPrice, inStockOnly]);

  const clearFilters = () => {
    setCategory("All");
    setMinPrice("");
    setMaxPrice("");
    setInStockOnly(false);
    setSort("newest");
    setSearch("");
    setSearchParams({});
  };

  const activeFilterCount = [
    category !== "All",
    minPrice !== "",
    maxPrice !== "",
    inStockOnly,
  ].filter(Boolean).length;

  return (
    <div className="lp-container">

      {/* HEADER */}
      <header className="lp-header">
        <div className="lp-logo-wrap" onClick={() => navigate("/")}>
          <span className="lp-logo-fake">fake</span>
          <span className="lp-logo-amazon">amazon</span>
          <p className="lp-tagline">NOT THE REAL ONE</p>
        </div>
        <div className="lp-search-wrap">
          <input
            className="lp-search"
            placeholder="Search products..."
            value={search}
            onChange={e => { setSearch(e.target.value); setSearchParams({ q: e.target.value }); }}
          />
          <button className="lp-search-btn">🔍</button>
        </div>
        <div className="lp-icons">
          <div className="lp-icon lp-cart-icon" onClick={() => navigate("/cart")}>
            🛒
            {cartCount > 0 && <span className="lp-cart-badge">{cartCount}</span>}
          </div>
          <div className="lp-icon" onClick={() => navigate("/profile")}>👤</div>
        </div>
      </header>

      {/* NAV */}
      <nav className="lp-nav">
        {[["Home","/"],["Orders","/orders"],["Deals","#"],["Selling","/selling"],["Listings","/listings"],["Sold","/sold"]].map(([label, path]) => (
          <button key={label} className={`lp-nav-btn${label === "Listings" ? " active" : ""}`} onClick={() => navigate(path)}>{label}</button>
        ))}
      </nav>

      {/* BODY */}
      <div className="lp-body">

        {/* SIDEBAR FILTERS */}
        <aside className="lp-sidebar">
          <div className="lp-filter-header">
            <span className="lp-filter-title">Filters</span>
            {activeFilterCount > 0 && (
              <button className="lp-clear-btn" onClick={clearFilters}>
                Clear all ({activeFilterCount})
              </button>
            )}
          </div>

          {/* Category */}
          <div className="lp-filter-section">
            <p className="lp-filter-label">Category</p>
            <div className="lp-category-list">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`lp-cat-btn${category === cat ? " active" : ""}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat === "All" ? "All Categories" : cat.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="lp-filter-section">
            <p className="lp-filter-label">Price Range</p>
            <div className="lp-price-row">
              <input
                className="lp-price-input"
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
              />
              <span className="lp-price-sep">–</span>
              <input
                className="lp-price-input"
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          {/* Availability */}
          <div className="lp-filter-section">
            <p className="lp-filter-label">Availability</p>
            <label className="lp-checkbox-row">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={e => setInStockOnly(e.target.checked)}
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="lp-main">

          {/* TOOLBAR */}
          <div className="lp-toolbar">
            <p className="lp-count">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              {search && <span className="lp-search-term"> for "{search}"</span>}
            </p>
            <div className="lp-sort-wrap">
              <span className="lp-sort-label">Sort by:</span>
              <select className="lp-sort-select" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name A–Z</option>
              </select>
            </div>
          </div>

          {/* GRID */}
          <div className="lp-grid">
            {products.length === 0 ? (
              <p className="lp-empty">Loading products...</p>
            ) : filtered.length === 0 ? (
              <div className="lp-no-results">
                <p className="lp-no-results-title">No products found</p>
                <p className="lp-no-results-sub">Try adjusting your filters or search term.</p>
                <button className="lp-clear-all-btn" onClick={clearFilters}>Clear all filters</button>
              </div>
            ) : (
              filtered.map(product => (
                <MiniProduct key={product.id} product={product} onCartChange={setCartCount} />
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}