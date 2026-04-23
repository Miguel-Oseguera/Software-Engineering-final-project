import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../Css/MainPage.css";

const CATEGORIES = ["All","beauty","fragrances","furniture","groceries","home-decoration","kitchen-accessories","laptops","mens-shirts","mens-shoes","mens-watches","mobile-accessories","skin-care","smartphones","sports-accessories","sunglasses","tablets","tops","womens-bags","womens-dresses","womens-jewellery","womens-shoes","womens-watches"];

function ProductCard({ product }) {
  const navigate = useNavigate();

  const getThumbnail = (product) => {
    try {
      const imgs = JSON.parse(product.images);
      return imgs[0] || "";
    } catch { return ""; }
  };

  const thumb = getThumbnail(product);

  return (
    <div className="mp-product-card" onClick={() => navigate(`/product/${product.id}`)}>
      <div className="mp-product-img-wrap">
        {thumb
          ? <img src={thumb} alt={product.name} className="mp-product-img" />
          : <div className="mp-product-no-img">No Image</div>
        }
      </div>
      <div className="mp-product-info">
        <p className="mp-product-name">{product.name}</p>
        <p className="mp-product-price">${Number(product.price).toFixed(2)}</p>
        <div className="mp-product-rating">
          <span className="mp-stars">★★★★☆</span>
          <span className="mp-rating-count">(142)</span>
        </div>
        {product.quantity_remaining > 0
          ? <span className="mp-in-stock">In Stock</span>
          : <span className="mp-out-stock">Out of Stock</span>
        }
      </div>
    </div>
  );
}

function SectionRow({ title, products }) {
  const navigate = useNavigate();
  return (
    <div className="mp-section">
      <div className="mp-section-header">
        <h2 className="mp-section-title">{title}</h2>
        <span className="mp-see-all" onClick={() => navigate("/listings")}>See all results →</span>
      </div>
      <div className="mp-product-row">
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}

export default function MainPage() {
  const navigate = useNavigate();
  const [trending, setTrending] = useState([]);
  const [newest, setNewest] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("default");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [cartCount, setCartCount] = useState(
    () => (JSON.parse(localStorage.getItem("cart")) || []).length
  );

  useEffect(() => {
    fetch("/api/products/trending")
      .then(r => r.json()).then(setTrending).catch(console.error);
    fetch("/api/products/newest")
      .then(r => r.json()).then(setNewest).catch(console.error);
    fetch("/api/products/all")
      .then(r => r.json()).then(data => setAllProducts(Array.isArray(data) ? data : [])).catch(console.error);
  }, []);

  const filtersActive = category !== "All" || minPrice !== "" || maxPrice !== "" || search !== "" || sort !== "default";

  const applyFilters = (arr) => {
    let list = arr.filter(p => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "All" || (p.category || "").toLowerCase() === category;
      const matchMin = minPrice === "" || Number(p.price) >= Number(minPrice);
      const matchMax = maxPrice === "" || Number(p.price) <= Number(maxPrice);
      return matchSearch && matchCat && matchMin && matchMax;
    });
    if (sort === "price-asc") return [...list].sort((a,b) => a.price - b.price);
    if (sort === "price-desc") return [...list].sort((a,b) => b.price - a.price);
    if (sort === "name") return [...list].sort((a,b) => a.name.localeCompare(b.name));
    return list;
  };

  const clearFilters = () => { setCategory("All"); setMinPrice(""); setMaxPrice(""); setSort("default"); setSearch(""); };

  // chunk into rows of 6
  const chunk = (arr, size) => {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  };

  const filteredAll = applyFilters(allProducts);
  const filteredRows = chunk(filteredAll, 6);
  const trendingRows = chunk(applyFilters(trending), 6);
  const newestRows = chunk(applyFilters(newest), 6);

  const handleSearch = (e) => {
    if (e.key === "Enter" && search.trim()) {
      navigate(`/listings?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <div className="mp-container">

      {/* HEADER */}
      <header className="mp-header">
        <div className="mp-logo-wrap" onClick={() => navigate("/")}>
          <span className="mp-logo-fake">fake</span>
          <span className="mp-logo-amazon">amazon</span>
          <p className="mp-tagline">NOT THE REAL ONE</p>
        </div>
        <div className="mp-search-wrap">
          <input
            className="mp-search"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleSearch}
          />
          <button className="mp-search-btn">🔍</button>
        </div>
        <div className="mp-icons">
          <div className="mp-icon mp-cart-icon" onClick={() => navigate("/cart")}>
            🛒
            {cartCount > 0 && <span className="mp-cart-badge">{cartCount}</span>}
          </div>
          <div className="mp-icon" onClick={() => navigate("/profile")}>👤</div>
        </div>
      </header>

      {/* NAV */}
      <nav className="mp-nav">
        {[["Home","/"],["Orders","/orders"],["Deals","/deals"],["Selling","/selling"],["Listings","/listings"],["Sold","/sold"]].map(([label, path]) => (
          <button key={label} className="mp-nav-btn" onClick={() => navigate(path)}>{label}</button>
        ))}
      </nav>

      {/* HERO BANNER */}
      <div className="mp-hero">
        <div className="mp-hero-text">
          <p className="mp-hero-sub">Welcome to</p>
          <h1 className="mp-hero-title">fake<span>amazon</span></h1>
          <p className="mp-hero-desc">Discover thousands of products at great prices</p>
          <button className="mp-hero-btn" onClick={() => navigate("/listings")}>Shop All Products</button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="mp-filter-bar">
        <div className="mp-filter-scroll">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`mp-filter-cat${category === cat ? " active" : ""}`}
              onClick={() => setCategory(cat)}
            >
              {cat === "All" ? "All" : cat.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
        <div className="mp-filter-right">
          <input className="mp-filter-price" type="number" placeholder="Min $" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
          <span className="mp-filter-sep">–</span>
          <input className="mp-filter-price" type="number" placeholder="Max $" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
          <select className="mp-filter-sort" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="default">Sort: Default</option>
            <option value="price-asc">Price: Low–High</option>
            <option value="price-desc">Price: High–Low</option>
            <option value="name">Name A–Z</option>
          </select>
          {(category !== "All" || minPrice || maxPrice || sort !== "default") && (
            <button className="mp-filter-clear" onClick={clearFilters}>✕ Clear</button>
          )}
        </div>
      </div>

      {/* PRODUCT SECTIONS */}
      <div className="mp-content">
        {filtersActive ? (
          filteredAll.length === 0 ? (
            <div className="mp-loading">No products match your filters. <button className="mp-inline-clear" onClick={clearFilters}>Clear filters</button></div>
          ) : (
            <>
              <div className="mp-filter-results-header">
                <span>{filteredAll.length} result{filteredAll.length !== 1 ? "s" : ""}{category !== "All" ? ` in "${category.replace(/-/g," ")}"` : ""}</span>
                <button className="mp-inline-clear" onClick={clearFilters}>✕ Clear filters</button>
              </div>
              {filteredRows.map((row, i) => (
                <SectionRow key={`f${i}`} title={i === 0 ? "Search Results" : ""} products={row} />
              ))}
            </>
          )
        ) : (
          <>
            {trendingRows.length === 0 ? (
              <div className="mp-loading">Loading products...</div>
            ) : (
              trendingRows.map((row, i) => (
                <SectionRow key={`t${i}`} title={i === 0 ? "⭐ Featured Products" : "More Featured"} products={row} />
              ))
            )}
            {newestRows.map((row, i) => (
              <SectionRow key={`n${i}`} title={i === 0 ? "🆕 New Arrivals" : "More New Arrivals"} products={row} />
            ))}
          </>
        )}
      </div>

    </div>
  );
}