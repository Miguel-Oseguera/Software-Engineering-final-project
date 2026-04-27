import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Css/SellingPage.css";
import Navbar from "../components/Navbar";

const API = import.meta.env.VITE_API_URL || "";

export default function SellingPage() {
  const navigate = useNavigate();
  const raw = localStorage.getItem("user");
  const username = raw ? ((() => { try { return JSON.parse(raw).username; } catch { return raw; } })()) : "";

  const [listings, setListings] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editFields, setEditFields] = useState({});

  const fetchListings = () => {
    fetch(`${API}/api/products/seller/${username}`)
      .then(res => res.json())
      .then(data => setListings(Array.isArray(data) ? data : []))
      .catch(() => setListings([]));
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price) { setMessage("Name and price are required."); return; }

    const res = await fetch(`${API}/api/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, price, description, imageUrl, quantity, seller: username }),
    });

    const data = await res.json();
    if (data.success) {
      setMessage("Listing created!");
      setName(""); setPrice(""); setDescription(""); setImageUrl(""); setQuantity("1");
      fetchListings();
    } else {
      setMessage("Failed to create listing.");
    }
  };

  const handleRemove = async (id) => {
    await fetch(`${API}/api/products/${id}`, { method: "DELETE" });
    fetchListings();
  };

  const startEdit = (item) => {
    let imageUrl = "";
    try { imageUrl = JSON.parse(item.images || "[]")[0] || ""; } catch {}
    setEditingId(item.id);
    setEditFields({
      name: item.name,
      price: item.price,
      description: item.description || "",
      imageUrl,
      quantity: item.quantity_remaining,
    });
  };

  const handleEdit = async (id) => {
    const res = await fetch(`${API}/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editFields),
    });
    const data = await res.json();
    if (data.success) { setEditingId(null); fetchListings(); }
  };

  return (
    <div className="selling-container">

      <header className="header">
        <div className="left-logo">
          <div className="logo">fake<span className="amazon">amazon</span></div>
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

      <Navbar active="Selling" navClass="selling-nav" btnClass="selling-nav-btn" />

      <div className="selling-body">

        <div className="selling-form-section">
          <h2>List a New Product</h2>
          {message && <p className="selling-message">{message}</p>}
          <form className="selling-form" onSubmit={handleSubmit}>
            <label>Product Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Vintage Lamp" />

            <label>Price ($) *</label>
            <input type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 19.99" />

            <label>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your product..." rows={3} />

            <label>Image URL</label>
            <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." />

            <label>Quantity</label>
            <input type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} />

            <button type="submit" className="submit-btn">List Product</button>
          </form>
        </div>

        <div className="selling-listings-section">
          <h2>Your Listings</h2>
          {listings.length === 0 ? (
            <p className="no-listings">You have no active listings.</p>
          ) : (
            listings.map(item => {
              let thumbnail = "";
              try { thumbnail = JSON.parse(item.images || "[]")[0] || ""; } catch {}

              if (editingId === item.id) {
                return (
                  <div key={item.id} className="selling-edit-form">
                    <input placeholder="Name" value={editFields.name} onChange={e => setEditFields({...editFields, name: e.target.value})} />
                    <input type="number" placeholder="Price" value={editFields.price} onChange={e => setEditFields({...editFields, price: e.target.value})} />
                    <textarea placeholder="Description" value={editFields.description} onChange={e => setEditFields({...editFields, description: e.target.value})} rows={2} />
                    <input placeholder="Image URL" value={editFields.imageUrl} onChange={e => setEditFields({...editFields, imageUrl: e.target.value})} />
                    <input type="number" placeholder="Quantity" value={editFields.quantity} onChange={e => setEditFields({...editFields, quantity: e.target.value})} />
                    <div className="edit-actions">
                      <button className="submit-btn" onClick={() => handleEdit(item.id)}>Save</button>
                      <button className="cancel-btn" onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={item.id} className="selling-listing-row">
                  {thumbnail
                    ? <img src={thumbnail} alt={item.name} className="selling-thumb" />
                    : <div className="selling-thumb-placeholder">No Image</div>
                  }
                  <div className="selling-listing-info">
                    <p className="selling-listing-name">{item.name}</p>
                    <p className="selling-listing-price">${item.price}</p>
                    <p className="selling-listing-qty">Qty: {item.quantity_remaining}</p>
                  </div>
                  <div className="listing-actions">
                    <button className="edit-listing-btn" onClick={() => startEdit(item)}>Edit</button>
                    <button className="remove-listing-btn" onClick={() => handleRemove(item.id)}>Remove</button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
