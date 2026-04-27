import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MiniProductCart from "./MiniProductCart";
import "../Css/CartPage.css";

const SHIPPING_THRESHOLD = 25;
const SHIPPING_FEE = 8;
const TAX_RATE = 0.0825;

function groupCart(items) {
  const map = {};
  for (const item of items) {
    if (map[item.id]) map[item.id].quantity += 1;
    else map[item.id] = { product: item, quantity: 1 };
  }
  return Object.values(map);
}

function flattenCart(grouped) {
  return grouped.flatMap(({ product, quantity }) => Array(quantity).fill(product));
}

function detectCardType(num) {
  if (/^4/.test(num)) return "Visa";
  if (/^5[1-5]/.test(num)) return "Mastercard";
  if (/^3[47]/.test(num)) return "Amex";
  if (/^6/.test(num)) return "Discover";
  return "Card";
}

function cardIcon(type) {
  switch (type) {
    case "Visa": return "💳";
    case "Mastercard": return "💳";
    case "Amex": return "💳";
    default: return "💳";
  }
}

// ---- CREDIT CARD MODAL ----
function CardModal({ username, onClose, onSelect }) {
  const [cards, setCards] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ cardholder_name: "", number: "", expiry: "", cvv: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadCards = () => {
    fetch(`/api/payment/${username}`)
      .then(r => r.json())
      .then(data => setCards(Array.isArray(data) ? data : []))
      .catch(() => {});
  };

  useEffect(() => { loadCards(); }, []);

  const handleSave = async () => {
    const digits = form.number.replace(/\s/g, "");
    if (!form.cardholder_name.trim()) { setError("Enter cardholder name."); return; }
    if (digits.length < 13 || digits.length > 19) { setError("Enter a valid card number."); return; }
    if (!form.expiry.match(/^\d{2}\/\d{2}$/)) { setError("Enter expiry as MM/YY."); return; }
    if (!form.cvv.match(/^\d{3,4}$/)) { setError("Enter a valid CVV."); return; }

    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/payment/${username}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardholder_name: form.cardholder_name,
          last_four: digits.slice(-4),
          expiry: form.expiry,
          card_type: detectCardType(digits),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setForm({ cardholder_name: "", number: "", expiry: "", cvv: "" });
        setShowForm(false);
        loadCards();
      } else {
        setError("Failed to save card.");
      }
    } catch {
      setError("Could not connect to server.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await fetch(`/api/payment/${username}/${id}`, { method: "DELETE" });
    loadCards();
  };

  const handleSetDefault = async (id) => {
    await fetch(`/api/payment/${username}/${id}/default`, { method: "PUT" });
    loadCards();
  };

  const formatNumber = (val) => {
    return val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  };

  return (
    <div className="card-modal-overlay" onClick={onClose}>
      <div className="card-modal" onClick={e => e.stopPropagation()}>
        <div className="card-modal-header">
          <h3>Payment Methods</h3>
          <button className="card-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Saved cards */}
        {cards.length > 0 && (
          <div className="card-list">
            {cards.map(card => (
              <div key={card.id} className={`card-row${Number(card.is_default) ? " card-default" : ""}`}>
                <div className="card-row-left">
                  <span className="card-icon-emoji">{cardIcon(card.card_type)}</span>
                  <div className="card-row-info">
                    <span className="card-row-type">{card.card_type} •••• {card.last_four}</span>
                    <span className="card-row-sub">{card.cardholder_name} · Exp {card.expiry}</span>
                  </div>
                  {Number(card.is_default) === 1 && <span className="card-default-badge">Default</span>}
                </div>
                <div className="card-row-actions">
                  <button className="card-use-btn" onClick={() => { onSelect(card); onClose(); }}>Use</button>
                  {!Number(card.is_default) && (
                    <button className="card-default-btn" onClick={() => handleSetDefault(card.id)}>Set Default</button>
                  )}
                  <button className="card-delete-btn" onClick={() => handleDelete(card.id)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add new card form */}
        {showForm ? (
          <div className="card-form">
            <p className="card-form-title">Add a New Card</p>

            <div className="card-form-preview">
              <div className="card-preview-chip">💳</div>
              <div className="card-preview-number">
                {form.number || "•••• •••• •••• ••••"}
              </div>
              <div className="card-preview-bottom">
                <span>{form.cardholder_name || "CARDHOLDER NAME"}</span>
                <span>{form.expiry || "MM/YY"}</span>
              </div>
            </div>

            <input
              className="card-input"
              placeholder="Cardholder Name"
              value={form.cardholder_name}
              onChange={e => setForm({ ...form, cardholder_name: e.target.value.toUpperCase() })}
            />
            <input
              className="card-input"
              placeholder="Card Number"
              value={form.number}
              maxLength={19}
              onChange={e => setForm({ ...form, number: formatNumber(e.target.value) })}
            />
            <div className="card-form-row">
              <input
                className="card-input"
                placeholder="MM/YY"
                value={form.expiry}
                maxLength={5}
                onChange={e => {
                  let v = e.target.value.replace(/\D/g, "");
                  if (v.length >= 2) v = v.slice(0, 2) + "/" + v.slice(2, 4);
                  setForm({ ...form, expiry: v });
                }}
              />
              <input
                className="card-input"
                placeholder="CVV"
                value={form.cvv}
                maxLength={4}
                onChange={e => setForm({ ...form, cvv: e.target.value.replace(/\D/g, "") })}
              />
            </div>
            {error && <p className="card-error">{error}</p>}
            <div className="card-form-actions">
              <button className="card-save-btn" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Card"}
              </button>
              <button className="card-cancel-btn" onClick={() => { setShowForm(false); setError(""); }}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button className="card-add-new-btn" onClick={() => setShowForm(true)}>
            + Add a new card
          </button>
        )}
      </div>
    </div>
  );
}

// ---- MAIN CART PAGE ----
export default function CartPage() {
  const navigate = useNavigate();

  const [grouped, setGrouped] = useState(() =>
    groupCart(JSON.parse(localStorage.getItem("cart")) || [])
  );
  const [orderedItems, setOrderedItems] = useState(
    () => JSON.parse(localStorage.getItem("ordered")) || []
  );
  const [purchased, setPurchased] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  const [discountInput, setDiscountInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [discountError, setDiscountError] = useState("");
  const [discountLoading, setDiscountLoading] = useState(false);

  const username = (() => {
    try { return JSON.parse(localStorage.getItem("user"))?.username || null; }
    catch { return null; }
  })();

  // Load default card on mount
  useEffect(() => {
    if (!username) return;
    fetch(`/api/payment/${username}`)
      .then(r => r.json())
      .then(cards => {
        if (Array.isArray(cards) && cards.length > 0) {
          const def = cards.find(c => Number(c.is_default)) || cards[0];
          setSelectedCard(def);
        }
      })
      .catch(() => {});
  }, [username]);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(flattenCart(grouped)));
  }, [grouped]);

  useEffect(() => {
    localStorage.setItem("ordered", JSON.stringify(orderedItems));
  }, [orderedItems]);

  const handleIncrease = (id) => {
    setGrouped(grouped.map(g => {
      if (g.product.id !== id) return g;
      const stock = Number(g.product.quantity_remaining ?? 0);
      if (g.quantity >= stock) return g;
      return { ...g, quantity: g.quantity + 1 };
    }));
  };

  const handleDecrease = (id) => {
    setGrouped(grouped
      .map(g => g.product.id === id ? { ...g, quantity: g.quantity - 1 } : g)
      .filter(g => g.quantity > 0)
    );
  };

  const handleRemove = (id) => {
    setGrouped(grouped.filter(g => g.product.id !== id));
  };

  const handleApplyDiscount = async () => {
    if (!discountInput.trim()) return;
    setDiscountError("");
    setAppliedDiscount(null);
    setDiscountLoading(true);
    try {
      const res = await fetch("/api/orders/validate-discount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: discountInput.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedDiscount({ code: data.code, percent_off: data.percent_off });
      } else {
        setDiscountError(data.error || "Invalid or expired code.");
      }
    } catch {
      setDiscountError("Could not validate code.");
    } finally {
      setDiscountLoading(false);
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountInput("");
    setDiscountError("");
  };

  const handlePurchase = async () => {
    if (grouped.length === 0) return;
    const raw = localStorage.getItem("user");
    const buyer = raw ? ((() => { try { return JSON.parse(raw).username; } catch { return raw; } })()) : "";
    const flatItems = flattenCart(grouped);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: flatItems, buyer, discountCode: appliedDiscount?.code || null }),
      });
      const data = await res.json();
      if (!data.success) { alert("Purchase failed. Try again."); return; }
    } catch {
      alert("Could not connect to server.");
      return;
    }

    setOrderedItems([...orderedItems, ...flatItems]);
    setGrouped([]);
    setAppliedDiscount(null);
    setDiscountInput("");
    setPurchased(true);
    setTimeout(() => setPurchased(false), 4000);
  };

  const totalItems = grouped.reduce((sum, g) => sum + g.quantity, 0);
  const subtotal = grouped.reduce((sum, g) => sum + Number(g.product.price || 0) * g.quantity, 0);
  const discountAmount = appliedDiscount ? subtotal * (appliedDiscount.percent_off / 100) : 0;
  const discountedSubtotal = subtotal - discountAmount;
  const shipping = discountedSubtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const tax = discountedSubtotal * TAX_RATE;
  const total = discountedSubtotal + shipping + tax;
  const amountToFreeShipping = SHIPPING_THRESHOLD - discountedSubtotal;

  return (
    <div className="cart-container">
      <header className="cart-header">
        <div className="cart-logo-wrap" onClick={() => navigate("/")}>
          <span className="cart-logo-fake">fake</span>
          <span className="cart-logo-amazon">amazon</span>
          <p className="cart-tagline">NOT THE REAL ONE</p>
        </div>
        <div className="cart-search-wrap">
          <input className="cart-search" placeholder="Search..." />
        </div>
        <div className="cart-icons">
          <span className="cart-icon cart-icon-active" onClick={() => navigate("/cart")}>🛒</span>
          <span className="cart-icon" onClick={() => navigate("/profile")}>👤</span>
        </div>
      </header>

      <nav className="cart-nav">
        {[["Home","/"],["Orders","/orders"],["Deals","/deals"],["Selling","/selling"],["Listings","/listings"],["Sold","/sold"]].map(([label, path]) => (
          <button key={label} className="cart-nav-btn" onClick={() => navigate(path)}>{label}</button>
        ))}
      </nav>

      {purchased && (
        <div className="cart-success-banner">
          ✅ Order placed! Check your <span onClick={() => navigate("/orders")}>Orders</span> page.
        </div>
      )}

      <div className="cart-page-title">
        <h1>Shopping Cart</h1>
        {totalItems > 0 && <span className="cart-count">{totalItems} item{totalItems !== 1 ? "s" : ""}</span>}
      </div>

      <div className="cart-body">
        <div className="cart-items-col">
          {grouped.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛒</div>
              <p className="cart-empty-title">Your cart is empty</p>
              <p className="cart-empty-sub">Looks like you haven't added anything yet.</p>
              <button className="cart-shop-btn" onClick={() => navigate("/")}>Start Shopping</button>
            </div>
          ) : (
            grouped.map(({ product, quantity }) => {
              const stock = Number(product.quantity_remaining ?? 0);
              const atMax = quantity >= stock;
              return (
                <div key={product.id} className="cart-item-row">
                  <MiniProductCart product={product} />
                  <div className="cart-item-actions">
                    <span className="cart-item-price">${(Number(product.price || 0) * quantity).toFixed(2)}</span>
                    <div className="cart-qty-control">
                      <button className="cart-qty-btn" onClick={() => handleDecrease(product.id)}>−</button>
                      <span className="cart-qty-value">{quantity}</span>
                      <button className="cart-qty-btn" onClick={() => handleIncrease(product.id)} disabled={atMax}>+</button>
                    </div>
                    {atMax && <span className="cart-stock-note">Max stock reached</span>}
                    <button className="cart-remove-btn" onClick={() => handleRemove(product.id)}>Remove</button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {grouped.length > 0 && (
          <aside className="cart-summary">
            <h2 className="cart-summary-title">Order Summary</h2>

            <div className="cart-summary-rows">
              {grouped.map(({ product, quantity }) => (
                <div key={product.id} className="cart-summary-row">
                  <span className="cart-summary-item-name">
                    {product.name || "Item"}{quantity > 1 ? ` ×${quantity}` : ""}
                  </span>
                  <span>${(Number(product.price || 0) * quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="cart-summary-divider" />

            {shipping > 0 && (
              <div className="cart-shipping-nudge">
                Add <strong>${amountToFreeShipping.toFixed(2)}</strong> more for FREE shipping!
              </div>
            )}

            {/* PAYMENT METHOD */}
            {username && (
              <div className="cart-payment-section">
                <p className="cart-payment-label">Payment Method</p>
                {selectedCard ? (
                  <div className="cart-selected-card" onClick={() => setShowCardModal(true)}>
                    <span className="cart-card-icon">💳</span>
                    <div className="cart-card-info">
                      <span className="cart-card-type">{selectedCard.card_type} •••• {selectedCard.last_four}</span>
                      <span className="cart-card-exp">Exp {selectedCard.expiry}</span>
                    </div>
                    <span className="cart-card-change">Change</span>
                  </div>
                ) : (
                  <button className="cart-add-card-btn" onClick={() => setShowCardModal(true)}>
                    + Add a payment method
                  </button>
                )}
              </div>
            )}

            {/* DISCOUNT CODE */}
            {!appliedDiscount ? (
              <div className="cart-discount-wrap">
                <input
                  className="cart-discount-input"
                  placeholder="Discount code"
                  value={discountInput}
                  onChange={e => { setDiscountInput(e.target.value); setDiscountError(""); }}
                  onKeyDown={e => e.key === "Enter" && handleApplyDiscount()}
                />
                <button className="cart-discount-btn" onClick={handleApplyDiscount} disabled={discountLoading}>
                  {discountLoading ? "..." : "Apply"}
                </button>
                {discountError && <p className="cart-discount-error">{discountError}</p>}
              </div>
            ) : (
              <div className="cart-discount-applied">
                <span>🏷 <strong>{appliedDiscount.code}</strong> — {appliedDiscount.percent_off}% off</span>
                <button className="cart-discount-remove" onClick={handleRemoveDiscount}>✕</button>
              </div>
            )}

            <div className="cart-summary-divider" />

            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {appliedDiscount && (
              <div className="cart-summary-row cart-discount-line">
                <span>Discount ({appliedDiscount.percent_off}%)</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="cart-summary-row">
              <span>Tax (8.25%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="cart-summary-row">
              <span>Shipping</span>
              {shipping === 0 ? <span className="cart-free">FREE</span> : <span>${shipping.toFixed(2)}</span>}
            </div>
            <div className="cart-summary-row cart-summary-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <button className="cart-purchase-btn" onClick={handlePurchase}>
              Purchase ({totalItems} item{totalItems !== 1 ? "s" : ""})
            </button>
            <p className="cart-secure-note">🔒 Secure checkout</p>
          </aside>
        )}
      </div>

      {showCardModal && username && (
        <CardModal
          username={username}
          onClose={() => setShowCardModal(false)}
          onSelect={(card) => setSelectedCard(card)}
        />
      )}
    </div>
  );
}