import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MiniProduct from "./MiniProduct";

export default function DealsPage() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [cartCount, setCartCount] = useState(
    () => (JSON.parse(localStorage.getItem("cart")) || []).length
  );

  // Filters
  const [search, setSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minDiscount, setMinDiscount] = useState(10);
  const [inStockOnly, setInStockOnly] = useState(false);

  // Sorting
  const [sort, setSort] = useState("discount-desc");

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    fetch("/api/products/all")
      .then(res => res.json())
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]));
  }, []);

  const filtered = useMemo(() => {
    let list = products.filter(p => {
      if (!p.original_price || !p.price) return false;

      const discount = ((p.original_price - p.price) / p.original_price) * 100;

      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description || "").toLowerCase().includes(search.toLowerCase());

      const matchMax = maxPrice === "" || Number(p.price) <= Number(maxPrice);
      const matchDiscount = discount >= minDiscount;
      const matchStock = !inStockOnly || p.quantity_remaining > 0;

      return matchSearch && matchMax && matchDiscount && matchStock;
    });

    // Sorting
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

  // Pagination logic
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

  return (
    <div>

      {/* HEADER */}
      <header>
        <div onClick={() => navigate("/")}>
          <span>fake</span>
          <span>amazon</span>
          <p>NOT THE REAL ONE</p>
        </div>

        <div>
          <input
            placeholder="Search deals..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <button>🔍</button>
        </div>

        <div>
          <div onClick={() => navigate("/cart")}>
            🛒
            {cartCount > 0 && <span>{cartCount}</span>}
          </div>
          <div onClick={() => navigate("/profile")}>👤</div>
        </div>
      </header>

      {/* NAV */}
      <nav>
        {[["Home","/"],["Orders","/orders"],["Deals","/deals"],["Selling","/selling"],["Listings","/listings"],["Sold","/sold"]]
          .map(([label, path]) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              style={label === "Deals" ? { fontWeight: "bold" } : {}}
            >
              {label}
            </button>
        ))}
      </nav>

      {/* BODY */}
      <div style={{ display: "flex" }}>

        {/* SIDEBAR FILTERS */}
        <aside style={{ width: "250px" }}>
          <h3>Deal Filters</h3>

          <div>
            <p>Max Price</p>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={e => {
                setMaxPrice(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div>
            <p>Minimum Discount (%)</p>
            <input
              type="number"
              min="0"
              max="90"
              value={minDiscount}
              onChange={e => {
                setMinDiscount(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div>
            <label>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={e => {
                  setInStockOnly(e.target.checked);
                  setPage(1);
                }}
              />
              In Stock Only
            </label>
          </div>

          <button onClick={clearFilters}>Clear Filters</button>
        </aside>

        {/* MAIN CONTENT */}
        <main style={{ flex: 1 }}>

          {/* TOOLBAR */}
          <div>
            <p>
              {filtered.length} deal{filtered.length !== 1 ? "s" : ""}
              {search && <> for "{search}"</>}
            </p>

            <div>
              <span>Sort by:</span>
              <select value={sort} onChange={e => setSort(e.target.value)}>
                <option value="discount-desc">Biggest Discount</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name A–Z</option>
              </select>
            </div>
          </div>

          {/* GRID */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "12px"
            }}
          >
            {products.length === 0 ? (
              <p>Loading deals...</p>
            ) : paginated.length === 0 ? (
              <div>
                <p>No deals found</p>
                <button onClick={clearFilters}>Clear all filters</button>
              </div>
            ) : (
              paginated.map(product => (
                <MiniProduct
                  key={product.id}
                  product={product}
                  onCartChange={setCartCount}
                />
              ))
            )}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div style={{ marginTop: "20px", display: "flex", gap: "8px" }}>
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  style={page === i + 1 ? { fontWeight: "bold" } : {}}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}