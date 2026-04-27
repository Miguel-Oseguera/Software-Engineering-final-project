import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../Css/ProductPage.css";

const API = import.meta.env.VITE_API_URL || "";

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="pd-star-picker">
      {[1,2,3,4,5].map(s => (
        <span
          key={s}
          className={`pd-star-pick ${s <= (hovered || value) ? "filled" : ""}`}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(s)}
        >★</span>
      ))}
    </div>
  );
}

function renderStars(avg) {
  const full = Math.floor(avg);
  const half = avg - full >= 0.5;
  return [1,2,3,4,5].map(i => {
    if (i <= full) return <span key={i} className="pd-star filled">★</span>;
    if (i === full + 1 && half) return <span key={i} className="pd-star half">★</span>;
    return <span key={i} className="pd-star empty">★</span>;
  });
}

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImg, setSelectedImg] = useState(0);

  const [ratingSummary, setRatingSummary] = useState({ average: null, count: 0 });
  const [reviews, setReviews] = useState([]);
  const [bundleDeals, setBundleDeals] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newStars, setNewStars] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [submitStatus, setSubmitStatus] = useState("");

  const username = (() => {
    try { return JSON.parse(localStorage.getItem("user"))?.username || "anonymous"; }
    catch { return "anonymous"; }
  })();

  const loadRatings = () => {
    fetch(`${API}/api/ratings/${id}/summary`)
      .then(r => r.json()).then(setRatingSummary).catch(() => {});
    fetch(`${API}/api/ratings/${id}`)
      .then(r => r.json())
      .then(data => setReviews(Array.isArray(data) ? data : []))
      .catch(() => {});
  };

  useEffect(() => {
    fetch(`${API}/api/products/${id}`)
      .then(res => res.json())
      .then(data => setProduct(data));

    fetch(`${API}/api/products/all`)
      .then(res => res.json())
      .then(data => setAllProducts(Array.isArray(data) ? data : []))
      .catch(() => setAllProducts([]));

    fetch(`${API}/api/admin/bundle-deals`)
      .then(res => res.json())
      .then(data => setBundleDeals(Array.isArray(data) ? data : []))
      .catch(() => setBundleDeals([]));

    loadRatings();
  }, [id]);

  const stock = product ? Number(product.quantity_remaining ?? 0) : 0;
  const soldOut = stock <= 0;

  // How many of this item already in cart
  const getCartQty = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    return cart.filter(i => i.id === product?.id).length;
  };

  const maxCanAdd = Math.max(0, stock - getCartQty());

  const handleAddToCart = () => {
    if (soldOut || maxCanAdd === 0) return;
    const safeQty = Math.min(quantity, maxCanAdd);
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    for (let i = 0; i < safeQty; i++) cart.push(product);
    localStorage.setItem("cart", JSON.stringify(cart));
    setAdded(true);
  };

  const handleAddBundleToCart = (items) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    items.forEach(item => cart.push(item));
    localStorage.setItem("cart", JSON.stringify(cart));
    setAdded(true);
  };

  const handleSubmitRating = async () => {
    if (!newStars) { setSubmitStatus("Please select a star rating."); return; }
    try {
      const res = await fetch(`${API}/api/ratings/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stars: newStars, comment: newComment, username }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitStatus("Review submitted!");
        setNewStars(0);
        setNewComment("");
        loadRatings();
        setTimeout(() => { setSubmitStatus(""); setShowModal(false); }, 1200);
      } else {
        setSubmitStatus("Failed to submit. Try again.");
      }
    } catch {
      setSubmitStatus("Could not connect to server.");
    }
  };

  if (!product) return (
    <div className="pd-loading">
      <div className="pd-spinner" />
      <p>Loading product...</p>
    </div>
  );

  const images = JSON.parse(product.images || "[]");
  const hasMultipleImages = images.length > 1;
  const avg = ratingSummary.average ? Number(ratingSummary.average) : 0;

  const activeBundleDeals = bundleDeals
    .filter(deal => Number(deal.active) === 1)
    .map(deal => {
      let ids = [];

      try {
        ids = JSON.parse(deal.product_ids || "[]");
      } catch {
        ids = [];
      }

      const hasCurrentProduct = ids.some(bundleId => String(bundleId) === String(product.id));
      const bundleProducts = ids
        .map(bundleId => allProducts.find(p => String(p.id) === String(bundleId)))
        .filter(Boolean);

      return {
        ...deal,
        ids,
        hasCurrentProduct,
        bundleProducts,
      };
    })
    .filter(deal => deal.hasCurrentProduct && deal.bundleProducts.length >= 2);

  const getBundleTotal = (items) => {
    return items.reduce((sum, item) => sum + Number(item.price || 0), 0);
  };

  const getProductImage = (item) => {
    try {
      const itemImages = JSON.parse(item.images || "[]");
      return itemImages[0] || "";
    } catch {
      return "";
    }
  };

  return (
    <div className="pd-container">

      {/* HEADER */}
      <header className="pd-header">
        <div className="pd-logo-wrap" onClick={() => navigate("/")}>
          <span className="pd-logo-fake">fake</span>
          <span className="pd-logo-amazon">amazon</span>
          <p className="pd-tagline">NOT THE REAL ONE</p>
        </div>
        <div className="pd-search-wrap">
          <input className="pd-search" placeholder="Search..." />
        </div>
        <div className="pd-icons">
          <span className="pd-icon" onClick={() => navigate("/cart")}>🛒</span>
          <span className="pd-icon" onClick={() => navigate("/profile")}>👤</span>
        </div>
      </header>

      {/* NAV */}
      <nav className="pd-nav">
        {[["Home","/"],["Orders","/orders"],["Deals","/deals"],["Selling","/selling"],["Listings","/listings"],["Sold","/sold"]].map(([label, path]) => (
          <button key={label} className="pd-nav-btn" onClick={() => navigate(path)}>{label}</button>
        ))}
      </nav>

      <div className="pd-breadcrumb">
        <span onClick={() => navigate("/")} className="pd-crumb-link">Home</span>
        <span className="pd-crumb-sep">›</span>
        <span className="pd-crumb-current">{product.name}</span>
      </div>

      <button className="pd-back-btn" onClick={() => navigate(-1)}>← Back to results</button>

      {/* PRODUCT BODY */}
      <div className="pd-body">

        {/* IMAGE COLUMN */}
        <div className="pd-images-col">
          {hasMultipleImages && (
            <div className="pd-thumbs">
              {images.map((src, i) => (
                <div key={i} className={`pd-thumb${selectedImg === i ? " active" : ""}`} onClick={() => setSelectedImg(i)}>
                  <img src={src} alt={`view ${i + 1}`} />
                </div>
              ))}
            </div>
          )}
          <div className="pd-main-img-wrap">
            {soldOut && <div className="pd-sold-out-overlay">SOLD OUT</div>}
            <img src={images[selectedImg] || images[0]} alt={product.name} className="pd-main-img" />
          </div>
        </div>

        {/* DETAILS COLUMN */}
        <div className="pd-details-col">
          <h1 className="pd-title">{product.name}</h1>

          <div className="pd-rating-row">
            {ratingSummary.count > 0 ? (
              <>
                <div className="pd-stars-row">{renderStars(avg)}</div>
                <span className="pd-avg-num">{avg.toFixed(1)}</span>
                <span className="pd-rating-count" onClick={() => setShowModal(true)}>
                  {ratingSummary.count} rating{ratingSummary.count !== 1 ? "s" : ""}
                </span>
              </>
            ) : (
              <span className="pd-no-ratings">No ratings yet</span>
            )}
            <button className="pd-write-review-btn" onClick={() => setShowModal(true)}>Write a review</button>
          </div>

          <div className="pd-divider" />

          <div className="pd-price-block">
            <span className="pd-price-label">Price:</span>
            <span className="pd-price">${Number(product.price).toFixed(2)}</span>
          </div>

          <div className="pd-divider" />

          <div className="pd-description-block">
            <p className="pd-description-label">About this item</p>
            <p className="pd-description">{product.description}</p>
          </div>

          <div className="pd-divider" />

          {/* STOCK STATUS */}
          <div className="pd-stock-row">
            {soldOut ? (
              <span className="pd-out-of-stock">✖ Out of Stock</span>
            ) : stock <= 5 ? (
              <span className="pd-low-stock">⚠ Only {stock} left in stock</span>
            ) : (
              <span className="pd-in-stock">✔ In Stock ({stock} available)</span>
            )}
          </div>

          {/* QUANTITY */}
          {!soldOut && (
            <div className="pd-quantity-row">
              <span className="pd-qty-label">Quantity:</span>
              <div className="pd-qty-control">
                <button className="pd-qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                <span className="pd-qty-value">{quantity}</span>
                <button className="pd-qty-btn" onClick={() => setQuantity(q => Math.min(maxCanAdd, q + 1))}>+</button>
              </div>
              {maxCanAdd < stock && (
                <span className="pd-qty-note">({maxCanAdd} more can be added)</span>
              )}
            </div>
          )}

          {/* ADD TO CART */}
          <div className="pd-actions">
            <button
              className={`pd-add-btn${added ? " added" : ""}${soldOut ? " disabled" : ""}`}
              onClick={handleAddToCart}
              disabled={soldOut || maxCanAdd === 0}
            >
              {soldOut
                ? "Out of Stock"
                : maxCanAdd === 0
                  ? "Max quantity in cart"
                  : added
                    ? `✓ Added ${Math.min(quantity, maxCanAdd)} to Cart`
                    : "Add to Cart"
              }
            </button>
            {added && (
              <button className="pd-go-cart-btn" onClick={() => navigate("/cart")}>
                Go to Cart →
              </button>
            )}
          </div>

          {/* DELIVERY */}
          <div className="pd-delivery-box">
            <p className="pd-delivery-title">📦 Delivery</p>
            <p className="pd-delivery-text">FREE delivery on orders over $25</p>
            <p className="pd-delivery-text">Estimated 3–5 business days</p>
          </div>
        </div>
      </div>

      {activeBundleDeals.length > 0 && (
        <div className="pd-bundle-section">
          <div className="pd-bundle-header">
            <h2>Frequently bought together</h2>
            <p>Bundle these items and save on the total purchase.</p>
          </div>

          {activeBundleDeals.map((deal) => {
            const total = getBundleTotal(deal.bundleProducts);
            const discountAmount = total * (Number(deal.percent_off || 0) / 100);
            const discountedTotal = total - discountAmount;

            return (
              <div key={deal.id} className="pd-bundle-card">
                <div className="pd-bundle-items">
                  {deal.bundleProducts.map((item, index) => (
                    <React.Fragment key={item.id}>
                      <div className="pd-bundle-item" onClick={() => navigate(`/product/${item.id}`)}>
                        {getProductImage(item) ? (
                          <img src={getProductImage(item)} alt={item.name} />
                        ) : (
                          <div className="pd-bundle-no-img">No Image</div>
                        )}
                        <p>{item.name}</p>
                        <span>${Number(item.price || 0).toFixed(2)}</span>
                      </div>

                      {index < deal.bundleProducts.length - 1 && (
                        <div className="pd-bundle-plus">+</div>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <div className="pd-bundle-summary">
                  <h3>{deal.name}</h3>
                  <p className="pd-bundle-discount">{deal.percent_off}% off bundle</p>
                  <p className="pd-bundle-original">Regular total: ${total.toFixed(2)}</p>
                  <p className="pd-bundle-total">Bundle total: ${discountedTotal.toFixed(2)}</p>
                  <p className="pd-bundle-save">You save ${discountAmount.toFixed(2)}</p>
                  <button onClick={() => handleAddBundleToCart(deal.bundleProducts)}>
                    Add bundle to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* REVIEWS SECTION */}
      <div className="pd-reviews-section">
        <div className="pd-reviews-header">
          <h2 className="pd-reviews-title">Customer Reviews</h2>
          {ratingSummary.count > 0 && (
            <div className="pd-reviews-summary">
              <div className="pd-reviews-avg-big">{avg.toFixed(1)}</div>
              <div>
                <div className="pd-stars-row">{renderStars(avg)}</div>
                <div className="pd-reviews-count-sub">{ratingSummary.count} global rating{ratingSummary.count !== 1 ? "s" : ""}</div>
              </div>
            </div>
          )}
          <button className="pd-write-review-btn-lg" onClick={() => setShowModal(true)}>Write a Customer Review</button>
        </div>

        {reviews.length === 0 ? (
          <div className="pd-no-reviews">
            <p>No reviews yet. Be the first!</p>
            <button className="pd-write-review-btn-lg" onClick={() => setShowModal(true)}>Write a Review</button>
          </div>
        ) : (
          <div className="pd-reviews-list">
            {reviews.map(r => (
              <div key={r.id} className="pd-review-card">
                <div className="pd-review-top">
                  <span className="pd-review-user">{r.username}</span>
                  <div className="pd-stars-row pd-review-stars">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className={`pd-star ${s <= r.stars ? "filled" : "empty"}`}>★</span>
                    ))}
                  </div>
                </div>
                {r.comment && <p className="pd-review-comment">{r.comment}</p>}
                <p className="pd-review-date">{new Date(r.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RATINGS MODAL */}
      {showModal && (
        <div className="pd-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="pd-modal" onClick={e => e.stopPropagation()}>
            <div className="pd-modal-header">
              <h3>Reviews for {product.name}</h3>
              <button className="pd-modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="pd-modal-form">
              <p className="pd-modal-form-title">Leave a Review</p>
              <StarPicker value={newStars} onChange={setNewStars} />
              <textarea
                className="pd-modal-textarea"
                placeholder="Share your thoughts (optional)..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                rows={3}
              />
              <div className="pd-modal-form-actions">
                <button className="pd-modal-submit" onClick={handleSubmitRating}>Submit Review</button>
                {submitStatus && <span className="pd-modal-status">{submitStatus}</span>}
              </div>
            </div>
            <div className="pd-modal-divider" />
            <div className="pd-modal-reviews">
              {reviews.length === 0 ? (
                <p className="pd-modal-empty">No reviews yet.</p>
              ) : (
                reviews.map(r => (
                  <div key={r.id} className="pd-review-card">
                    <div className="pd-review-top">
                      <span className="pd-review-user">{r.username}</span>
                      <div className="pd-stars-row">
                        {[1,2,3,4,5].map(s => (
                          <span key={s} className={`pd-star ${s <= r.stars ? "filled" : "empty"}`}>★</span>
                        ))}
                      </div>
                    </div>
                    {r.comment && <p className="pd-review-comment">{r.comment}</p>}
                    <p className="pd-review-date">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}