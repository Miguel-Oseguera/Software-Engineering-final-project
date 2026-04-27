import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Css/OrdersPage.css";
import Navbar from "../components/Navbar";

const TAX_RATE = 0.0825;
const SHIPPING_THRESHOLD = 25;
const SHIPPING_FEE = 8;

function generateReceiptPDF(item) {
  const load = () => new Promise((resolve, reject) => {
    if (window.jspdf) return resolve(window.jspdf.jsPDF);
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.onload = () => resolve(window.jspdf.jsPDF);
    script.onerror = reject;
    document.head.appendChild(script);
  });

  load().then(jsPDF => {
    const doc = new jsPDF();
    const subtotal = Number(item.price) * item.quantity;
    const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const tax = subtotal * TAX_RATE;
    const total = subtotal + shipping + tax;

    doc.setFillColor(139, 58, 15);
    doc.rect(0, 0, 210, 36, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("fakeamazon", 14, 18);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(255, 200, 100);
    doc.text("NOT THE REAL ONE", 14, 26);
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text("ORDER RECEIPT", 196, 22, { align: "right" });

    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Order Details", 14, 50);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 58);
    doc.text(`Order ID: FA-${Date.now()}`, 14, 65);

    doc.setDrawColor(200, 180, 160);
    doc.line(14, 70, 196, 70);

    doc.setFillColor(245, 240, 235);
    doc.rect(14, 74, 182, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(100, 50, 20);
    doc.text("Item", 18, 81);
    doc.text("Qty", 130, 81);
    doc.text("Unit Price", 150, 81);
    doc.text("Total", 182, 81, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 40, 40);
    const name = item.name || "Product";
    const truncated = name.length > 50 ? name.substring(0, 47) + "..." : name;
    doc.text(truncated, 18, 95);
    doc.text(String(item.quantity), 133, 95);
    doc.text(`$${Number(item.price).toFixed(2)}`, 153, 95);
    doc.text(`$${subtotal.toFixed(2)}`, 182, 95, { align: "right" });

    doc.setDrawColor(220, 210, 200);
    doc.line(14, 102, 196, 102);

    let y = 114;
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text("Subtotal:", 130, y);
    doc.text(`$${subtotal.toFixed(2)}`, 196, y, { align: "right" });
    y += 10;
    doc.text("Tax (8.25%):", 130, y);
    doc.text(`$${tax.toFixed(2)}`, 196, y, { align: "right" });
    y += 10;
    doc.text("Shipping:", 130, y);
    if (shipping === 0) {
      doc.setTextColor(74, 124, 89);
      doc.text("FREE", 196, y, { align: "right" });
      doc.setTextColor(80, 80, 80);
    } else {
      doc.text(`$${shipping.toFixed(2)}`, 196, y, { align: "right" });
    }
    y += 2;
    doc.setFillColor(139, 58, 15);
    doc.rect(120, y + 4, 76, 14, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Total:", 130, y + 13);
    doc.text(`$${total.toFixed(2)}`, 193, y + 13, { align: "right" });

    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(160, 140, 120);
    doc.text("Thank you for shopping with FakeAmazon!", 105, 270, { align: "center" });
    doc.text("This is not a real store. No actual purchase was made.", 105, 277, { align: "center" });

    doc.save(`FakeAmazon-Receipt-${name.replace(/\s+/g, "-").substring(0, 20)}.pdf`);
  });
}

function OrderCard({ item, index }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const subtotal = Number(item.price) * item.quantity;
  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shipping + tax;

  const orderId = `FA-${String(item.id || index).padStart(8, "0")}`;
  const orderDate = new Date(Date.now() - index * 86400000 * 2).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric"
  });

  let thumbnail = "";
  try { thumbnail = JSON.parse(item.images || "[]")[0] || ""; } catch {}

  return (
    <div className="order-card">
      {/* CARD HEADER */}
      <div className="order-card-header">
        <div className="order-header-group">
          <span className="order-header-label">ORDER PLACED</span>
          <span className="order-header-value">{orderDate}</span>
        </div>
        <div className="order-header-group">
          <span className="order-header-label">TOTAL</span>
          <span className="order-header-value">${total.toFixed(2)}</span>
        </div>
        <div className="order-header-group">
          <span className="order-header-label">SHIP TO</span>
          <span className="order-header-value order-ship-to">My Address</span>
        </div>
        <div className="order-header-id">
          <span className="order-header-label">ORDER # {orderId}</span>
        </div>
      </div>

      {/* CARD BODY */}
      <div className="order-card-body">
        <div className="order-item-row">
          <div className="order-item-left">
            {thumbnail
              ? <img className="order-item-img" src={thumbnail} alt={item.name} onClick={() => navigate(`/product/${item.id}`)} />
              : <div className="order-item-img no-img">No Image</div>
            }
            <div className="order-item-details">
              <p className="order-item-name" onClick={() => navigate(`/product/${item.id}`)}>{item.name}</p>
              <p className="order-item-price">${Number(item.price).toFixed(2)} each</p>
              <p className="order-item-qty">Quantity: {item.quantity}</p>
              {shipping === 0
                ? <span className="order-free-ship">✔ FREE Shipping</span>
                : <span className="order-paid-ship">Shipping: ${shipping.toFixed(2)}</span>
              }
            </div>
          </div>

          <div className="order-item-actions">
            <button
              className="order-details-btn"
              onClick={() => setExpanded(e => !e)}
            >
              {expanded ? "Hide Details ▲" : "Order Details ▼"}
            </button>
            <button
              className="order-receipt-btn"
              onClick={() => generateReceiptPDF(item)}
            >
              📄 Receipt
            </button>
            <button
              className="order-buy-again-btn"
              onClick={() => navigate(`/product/${item.id}`)}
            >
              Buy Again
            </button>
          </div>
        </div>

        {/* EXPANDED DETAILS */}
        {expanded && (
          <div className="order-details-panel">
            <div className="order-details-grid">
              <div className="order-details-section">
                <h4>Shipping Address</h4>
                <p>My Address</p>
                <p>123 Fake Street</p>
                <p>San Antonio, TX 78201</p>
              </div>

              <div className="order-details-section">
                <h4>Payment Method</h4>
                <p>💳 Card on file</p>
              </div>

              <div className="order-details-section order-details-summary">
                <h4>Order Summary</h4>
                <div className="order-summary-line">
                  <span>Item(s) subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="order-summary-line">
                  <span>Shipping:</span>
                  {shipping === 0
                    ? <span className="order-free-text">FREE</span>
                    : <span>${shipping.toFixed(2)}</span>
                  }
                </div>
                <div className="order-summary-line">
                  <span>Tax (8.25%):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="order-summary-line order-summary-total">
                  <span>Order Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

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
      <header className="orders-header">
        <div className="orders-logo-wrap" onClick={() => navigate("/")}>
          <span className="orders-logo-fake">fake</span>
          <span className="orders-logo-amazon">amazon</span>
          <p className="orders-tagline">NOT THE REAL ONE</p>
        </div>
        <div className="orders-search-wrap">
          <input
            className="orders-search"
            placeholder="Search orders..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="orders-search-btn">🔍</button>
        </div>
        <div className="orders-icons">
          <div className="orders-icon" onClick={() => navigate("/cart")}>🛒</div>
          <div className="orders-icon" onClick={() => navigate("/profile")}>👤</div>
        </div>
      </header>

      {/* NAV */}
      <Navbar active="Orders" navClass="orders-nav" btnClass="orders-nav-btn" />

      {/* PAGE CONTENT */}
      <div className="orders-page-body">

        {/* SIDEBAR */}
        <aside className="orders-sidebar">
          <h3 className="orders-sidebar-title">Your Orders</h3>
          <div className="orders-filter-group">
            {["all", "recent", "last 3 months"].map(f => (
              <button
                key={f}
                className={`orders-filter-btn${filter === f ? " active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "All Orders" : f === "recent" ? "Recent Orders" : "Last 3 Months"}
              </button>
            ))}
          </div>
        </aside>

        {/* MAIN */}
        <main className="orders-main">
          <div className="orders-main-header">
            <h2 className="orders-main-title">
              {filter === "all" ? "All Orders" : filter === "recent" ? "Recent Orders" : "Orders — Last 3 Months"}
            </h2>
            <span className="orders-main-count">{filtered.length} order{filtered.length !== 1 ? "s" : ""}</span>
          </div>

          {filtered.length === 0 ? (
            <div className="orders-empty">
              <p className="orders-empty-icon">📦</p>
              <p className="orders-empty-title">
                {search ? `No orders matching "${search}"` : "No orders yet"}
              </p>
              <p className="orders-empty-sub">Items you purchase will appear here.</p>
              <button className="orders-empty-btn" onClick={() => navigate("/")}>Start Shopping</button>
            </div>
          ) : (
            <div className="orders-list">
              {filtered.map((item, i) => (
                <OrderCard key={item.id || i} item={item} index={i} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}