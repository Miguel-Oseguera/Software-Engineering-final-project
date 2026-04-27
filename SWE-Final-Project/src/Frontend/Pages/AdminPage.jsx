import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Css/AdminPage.css";

export default function AdminPage() {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL || "";

  const [tab, setTab] = useState("products");
  const [stats, setStats] = useState({});
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [bundleDeals, setBundleDeals] = useState([]);
  const [orders, setOrders] = useState([]);
  const [sort, setSort] = useState("date");
  const [bundleSearch, setBundleSearch] = useState("");

  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    description: "",
    imageUrl: "",
    quantity: "",
    seller: "fakeamazon",
    category: "",
  });

  const [discountForm, setDiscountForm] = useState({
    code: "",
    percentOff: "",
    expiresAt: "",
  });

  const [bundleForm, setBundleForm] = useState({
    name: "",
    productIds: [],
    percentOff: "",
  });

  const loadAll = async () => {
    try {
      const [statsRes, productsRes, usersRes, discountsRes, bundleDealsRes, ordersRes] =
        await Promise.all([
          fetch(`${API}/api/admin/stats`),
          fetch(`${API}/api/admin/products`),
          fetch(`${API}/api/admin/users`),
          fetch(`${API}/api/admin/discounts`),
          fetch(`${API}/api/admin/bundle-deals`),
          fetch(`${API}/api/admin/orders/history?sort=${sort}`),
        ]);

      setStats(await statsRes.json());
      setProducts(await productsRes.json());
      setUsers(await usersRes.json());
      setDiscounts(await discountsRes.json());
      setBundleDeals(await bundleDealsRes.json());
      setOrders(await ordersRes.json());
    } catch (err) {
      console.error("ADMIN LOAD ERROR:", err);
    }
  };

  useEffect(() => {
    loadAll();
  }, [sort]);

  const filteredBundleProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(bundleSearch.toLowerCase())
  );

  const createProduct = async () => {
    if (!productForm.name || !productForm.price) {
      alert("Product name and price are required");
      return;
    }

    await fetch(`${API}/api/admin/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productForm),
    });

    setProductForm({
      name: "",
      price: "",
      description: "",
      imageUrl: "",
      quantity: "",
      seller: "fakeamazon",
      category: "",
    });

    loadAll();
  };

  const updateProduct = async (product) => {
    await fetch(`${API}/api/admin/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });

    loadAll();
  };

  const deleteProduct = async (id) => {
    if (!confirm("Remove this product from the store?")) return;

    await fetch(`${API}/api/admin/products/${id}`, {
      method: "DELETE",
    });

    loadAll();
  };

  const updateUser = async (user) => {
    await fetch(`${API}/api/admin/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });

    loadAll();
  };

  const deleteUser = async (id) => {
    if (!confirm("Delete this user?")) return;

    await fetch(`${API}/api/admin/users/${id}`, {
      method: "DELETE",
    });

    loadAll();
  };

  const createDiscount = async () => {
    if (!discountForm.code || discountForm.percentOff === "") {
      alert("Code and percent off are required");
      return;
    }

    await fetch(`${API}/api/admin/discounts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(discountForm),
    });

    setDiscountForm({
      code: "",
      percentOff: "",
      expiresAt: "",
    });

    loadAll();
  };

  const toggleDiscount = async (code, active) => {
    await fetch(`${API}/api/admin/discounts/${code}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: active ? 0 : 1 }),
    });

    loadAll();
  };

  const createBundleDeal = async () => {
    if (!bundleForm.name || bundleForm.productIds.length < 2 || bundleForm.percentOff === "") {
      alert("Bundle name, at least 2 products, and percent off are required");
      return;
    }

    await fetch(`${API}/api/admin/bundle-deals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bundleForm),
    });

    setBundleForm({
      name: "",
      productIds: [],
      percentOff: "",
    });

    setBundleSearch("");
    loadAll();
  };

  const toggleBundleProduct = (productId) => {
    setBundleForm((prev) => {
      const exists = prev.productIds.includes(productId);

      return {
        ...prev,
        productIds: exists
          ? prev.productIds.filter((id) => id !== productId)
          : [...prev.productIds, productId],
      };
    });
  };

  const toggleBundleDeal = async (id, active) => {
    await fetch(`${API}/api/admin/bundle-deals/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: active ? 0 : 1 }),
    });

    loadAll();
  };

  const deleteBundleDeal = async (id) => {
    if (!confirm("Delete this bundle deal?")) return;

    await fetch(`${API}/api/admin/bundle-deals/${id}`, {
      method: "DELETE",
    });

    loadAll();
  };

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          fake<span>amazon</span>
          <p>ADMIN BACKEND</p>
        </div>

        <button className={tab === "products" ? "active" : ""} onClick={() => setTab("products")}>
          Products
        </button>
        <button className={tab === "users" ? "active" : ""} onClick={() => setTab("users")}>
          Users
        </button>
        <button className={tab === "discounts" ? "active" : ""} onClick={() => setTab("discounts")}>
          Discount Codes
        </button>
        <button className={tab === "bundles" ? "active" : ""} onClick={() => setTab("bundles")}>
          Bundle Deals
        </button>
        <button className={tab === "orders" ? "active" : ""} onClick={() => setTab("orders")}>
          Orders
        </button>

        <button className="back-store" onClick={() => navigate("/")}>
          Back to Store
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h1>Administrative Backend</h1>
            <p>Manage products, users, discounts, bundle deals, and order history.</p>
          </div>
        </header>

        <section className="admin-stats">
          <div>
            <p>Total Products</p>
            <h2>{stats.products || 0}</h2>
          </div>
          <div>
            <p>Total Users</p>
            <h2>{stats.users || 0}</h2>
          </div>
          <div>
            <p>Total Orders</p>
            <h2>{stats.orders || 0}</h2>
          </div>
          <div>
            <p>Revenue</p>
            <h2>${Number(stats.revenue || 0).toFixed(2)}</h2>
          </div>
        </section>

        {tab === "products" && (
          <section className="admin-card">
            <div className="admin-card-header">
              <h2>Modify All Items / Create Sales Items</h2>
            </div>

            <div className="admin-form-grid">
              <input placeholder="Name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
              <input placeholder="Price" type="number" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} />
              <input placeholder="Quantity" type="number" value={productForm.quantity} onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })} />
              <input placeholder="Seller" value={productForm.seller} onChange={(e) => setProductForm({ ...productForm, seller: e.target.value })} />
              <input placeholder="Category" value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} />
              <input placeholder="Image URL" value={productForm.imageUrl} onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })} />
              <textarea placeholder="Description" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
              <button onClick={createProduct}>Add Product</button>
            </div>

            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Seller</th>
                    <th>Available</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <input value={p.name || ""} onChange={(e) => setProducts(products.map(x => x.id === p.id ? { ...x, name: e.target.value } : x))} />
                      </td>
                      <td>
                        <input type="number" value={p.price || ""} onChange={(e) => setProducts(products.map(x => x.id === p.id ? { ...x, price: e.target.value } : x))} />
                      </td>
                      <td>
                        <input type="number" value={p.quantity_remaining || 0} onChange={(e) => setProducts(products.map(x => x.id === p.id ? { ...x, quantity: e.target.value, quantity_remaining: e.target.value } : x))} />
                      </td>
                      <td>{p.seller || "none"}</td>
                      <td>{Number(p.availability) === 1 ? "Yes" : "No"}</td>
                      <td className="admin-actions">
                        <button onClick={() => updateProduct(p)}>Save</button>
                        <button className="danger" onClick={() => deleteProduct(p.id)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab === "users" && (
          <section className="admin-card">
            <div className="admin-card-header">
              <h2>Modify Users</h2>
            </div>

            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Admin</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <input value={u.username || ""} onChange={(e) => setUsers(users.map(x => x.id === u.id ? { ...x, username: e.target.value } : x))} />
                      </td>
                      <td>
                        <input value={u.email || ""} onChange={(e) => setUsers(users.map(x => x.id === u.id ? { ...x, email: e.target.value } : x))} />
                      </td>
                      <td>
                        <select value={Number(u.is_admin || 0)} onChange={(e) => setUsers(users.map(x => x.id === u.id ? { ...x, is_admin: Number(e.target.value) } : x))}>
                          <option value={0}>False</option>
                          <option value={1}>True</option>
                        </select>
                      </td>
                      <td className="admin-actions">
                        <button onClick={() => updateUser(u)}>Save</button>
                        <button className="danger" onClick={() => deleteUser(u.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab === "discounts" && (
          <section className="admin-card">
            <div className="admin-card-header">
              <h2>Creation of Discount Codes</h2>
            </div>

            <div className="admin-form-grid small">
              <input placeholder="Code" value={discountForm.code} onChange={(e) => setDiscountForm({ ...discountForm, code: e.target.value })} />
              <input placeholder="Percent Off" type="number" value={discountForm.percentOff} onChange={(e) => setDiscountForm({ ...discountForm, percentOff: e.target.value })} />
              <input placeholder="Expires At optional" value={discountForm.expiresAt} onChange={(e) => setDiscountForm({ ...discountForm, expiresAt: e.target.value })} />
              <button onClick={createDiscount}>Create Discount</button>
            </div>

            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Percent Off</th>
                    <th>Active</th>
                    <th>Expires</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {discounts.map((d) => (
                    <tr key={d.code}>
                      <td>{d.code}</td>
                      <td>{d.percent_off}%</td>
                      <td>{Number(d.active) === 1 ? "Yes" : "No"}</td>
                      <td>{d.expires_at || "None"}</td>
                      <td className="admin-actions">
                        <button onClick={() => toggleDiscount(d.code, Number(d.active) === 1)}>
                          {Number(d.active) === 1 ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab === "bundles" && (
          <section className="admin-card">
            <div className="admin-card-header">
              <h2>Bundle Deals</h2>
            </div>

            <div className="admin-form-grid small">
              <input
                placeholder="Bundle Name"
                value={bundleForm.name}
                onChange={(e) => setBundleForm({ ...bundleForm, name: e.target.value })}
              />

              <input
                placeholder="Percent Off"
                type="number"
                value={bundleForm.percentOff}
                onChange={(e) => setBundleForm({ ...bundleForm, percentOff: e.target.value })}
              />

              <button onClick={createBundleDeal}>Create Bundle Deal</button>
            </div>

            <div className="admin-bundle-products">
              <h3>Select Products for Bundle</h3>

              <input
                className="admin-bundle-search"
                placeholder="Search products..."
                value={bundleSearch}
                onChange={(e) => setBundleSearch(e.target.value)}
              />

              {products.length === 0 ? (
                <p>No products loaded. Check /api/admin/products.</p>
              ) : filteredBundleProducts.length === 0 ? (
                <p>No products match your search.</p>
              ) : (
                <div className="admin-bundle-grid">
                  {filteredBundleProducts.map((p) => (
                    <label key={p.id} className="admin-bundle-option">
                      <input
                        type="checkbox"
                        checked={bundleForm.productIds.includes(p.id)}
                        onChange={() => toggleBundleProduct(p.id)}
                      />
                      <span>{p.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Products</th>
                    <th>Percent Off</th>
                    <th>Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {bundleDeals.map((deal) => {
                    let ids = [];

                    try {
                      ids = JSON.parse(deal.product_ids || "[]");
                    } catch {
                      ids = [];
                    }

                    const productNames = ids
                      .map((id) => products.find((p) => String(p.id) === String(id))?.name)
                      .filter(Boolean)
                      .join(", ");

                    return (
                      <tr key={deal.id}>
                        <td>{deal.name}</td>
                        <td>{productNames || deal.product_ids}</td>
                        <td>{deal.percent_off}%</td>
                        <td>{Number(deal.active) === 1 ? "Yes" : "No"}</td>
                        <td className="admin-actions">
                          <button onClick={() => toggleBundleDeal(deal.id, Number(deal.active) === 1)}>
                            {Number(deal.active) === 1 ? "Deactivate" : "Activate"}
                          </button>

                          <button className="danger" onClick={() => deleteBundleDeal(deal.id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab === "orders" && (
          <section className="admin-card">
            <div className="admin-card-header">
              <h2>Currently Placed Orders / History of Orders</h2>

              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="date">Sort by order date</option>
                <option value="customer">Sort by customer</option>
                <option value="dollars">Sort by dollars</option>
              </select>
            </div>

            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Buyer</th>
                    <th>Seller</th>
                    <th>Price</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td>{o.product_name}</td>
                      <td>{o.buyer || "none"}</td>
                      <td>{o.seller || "none"}</td>
                      <td>${Number(o.price || 0).toFixed(2)}</td>
                      <td>{o.sold_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}