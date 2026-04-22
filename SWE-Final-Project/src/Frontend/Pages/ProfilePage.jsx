import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../Css/ProfilePage.css";

const FIELDS = [
  "username", "email", "phone", "deliveryAddress", "city",
  "state", "zip", "paymentMethod", "profilePic"
];

function getCompletionPct(profile) {
  const filled = FIELDS.filter(f => profile[f] && profile[f].toString().trim() !== "");
  return Math.round((filled.length / FIELDS.length) * 100);
}

function Field({ label, field, placeholder, type = "text", draft, profile, editing, onChange }) {
  return (
    <div className="pf-field">
      <span className="pf-label">{label}</span>
      {editing ? (
        <input
          className="pf-input"
          type={type}
          value={draft[field] || ""}
          placeholder={placeholder}
          onChange={e => onChange(field, e.target.value)}
        />
      ) : (
        <span className="pf-value">{profile[field] || <em className="pf-empty">Not set</em>}</span>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  // Load user from localStorage
  const raw = localStorage.getItem("user");
  let initialUser = { username: "Unknown User", email: "No email provided" };
  if (raw) {
    try { initialUser = { ...initialUser, ...JSON.parse(raw) }; }
    catch { initialUser.username = raw; }
  }

  const savedProfile = (() => {
    try { return JSON.parse(localStorage.getItem("profileData")) || {}; } catch { return {}; }
  })();

  const [profile, setProfile] = useState({
    username: initialUser.username,
    email: initialUser.email,
    phone: "",
    deliveryAddress: "",
    city: "",
    state: "",
    zip: "",
    paymentMethod: "",
    profilePic: null,
    notifications: { orders: true, deals: false, messages: true },
    ...savedProfile,
  });

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ ...profile });
  const [activeTab, setActiveTab] = useState("account");

  const pct = getCompletionPct(profile);

  const handleEdit = () => { setDraft({ ...profile }); setEditing(true); };
  const handleCancel = () => setEditing(false);

  const handleSave = () => {
    setProfile({ ...draft });
    localStorage.setItem("profileData", JSON.stringify(draft));
    setEditing(false);
  };

  const handleChange = (field, value) => {
    setDraft(prev => ({ ...prev, [field]: value }));
  };

  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => handleChange("profilePic", ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSignOut = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    navigate("/login");
  };

  const toggleNotif = (key) => {
    if (!editing) return;
    setDraft(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: !prev.notifications[key] }
    }));
  };

  const pctColor = pct < 40 ? "#cc0000" : pct < 75 ? "#c87533" : "#4a7c59";

  return (
    <div className="profile-container">

      {/* HEADER */}
      <header className="pf-header">
        <div className="pf-logo-wrap" onClick={() => navigate("/")}>
          <span className="pf-logo-fake">fake</span>
          <span className="pf-logo-amazon">amazon</span>
          <p className="pf-tagline">NOT THE REAL ONE</p>
        </div>
        <div className="pf-search-wrap">
          <input className="pf-search" placeholder="Search..." />
        </div>
        <div className="pf-icons">
          <span className="pf-icon" onClick={() => navigate("/cart")}>🛒</span>
          <span className="pf-icon pf-icon-active" onClick={() => navigate("/profile")}>👤</span>
        </div>
      </header>

      {/* NAV */}
      <nav className="pf-nav">
        {[["Home","/"],["Orders","/orders"],["Deals","#"],["Selling","/selling"],["Listings","/listings"],["Sold","/sold"]].map(([label, path]) => (
          <button key={label} className="pf-nav-btn" onClick={() => navigate(path)}>{label}</button>
        ))}
      </nav>

      {/* PAGE BODY */}
      <div className="pf-body">

        {/* SIDEBAR */}
        <aside className="pf-sidebar">

          {/* Avatar */}
          <div className="pf-avatar-wrap">
            <div className="pf-avatar" onClick={() => editing && fileRef.current.click()}>
              {(editing ? draft.profilePic : profile.profilePic)
                ? <img src={editing ? draft.profilePic : profile.profilePic} alt="avatar" className="pf-avatar-img" />
                : <span className="pf-avatar-initial">{profile.username.charAt(0).toUpperCase()}</span>
              }
              {editing && <div className="pf-avatar-overlay">📷</div>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePicChange} />
            <p className="pf-sidebar-name">{profile.username}</p>
            <p className="pf-sidebar-email">{profile.email}</p>
          </div>

          {/* Completion */}
          <div className="pf-completion">
            <div className="pf-completion-header">
              <span>Profile Completion</span>
              <strong style={{ color: pctColor }}>{pct}%</strong>
            </div>
            <div className="pf-bar-bg">
              <div className="pf-bar-fill" style={{ width: `${pct}%`, background: pctColor }} />
            </div>
            {pct < 100 && (
              <p className="pf-completion-tip">
                {pct < 40 ? "Add your address and contact info to get started." :
                 pct < 75 ? "Almost there — fill in your payment and delivery info." :
                 "Just a few more fields to complete your profile!"}
              </p>
            )}
          </div>

          {/* Sidebar nav */}
          <div className="pf-sidenav">
            {[["account","👤","Account Info"],["delivery","📦","Delivery"],["payment","💳","Payment"],["notifications","🔔","Notifications"],["security","🔒","Security"]].map(([tab, icon, label]) => (
              <button key={tab} className={`pf-sidenav-btn${activeTab === tab ? " active" : ""}`} onClick={() => setActiveTab(tab)}>
                <span>{icon}</span> {label}
              </button>
            ))}
          </div>

          <button className="pf-signout" onClick={handleSignOut}>Sign Out</button>
        </aside>

        {/* MAIN PANEL */}
        <main className="pf-main">
          <div className="pf-card">
            <div className="pf-card-header">
              <h2 className="pf-card-title">
                {activeTab === "account" && "Account Information"}
                {activeTab === "delivery" && "Delivery Address"}
                {activeTab === "payment" && "Payment Methods"}
                {activeTab === "notifications" && "Notification Preferences"}
                {activeTab === "security" && "Security Settings"}
              </h2>
              {!editing
                ? <button className="pf-edit-btn" onClick={handleEdit}>✏️ Edit</button>
                : <div className="pf-edit-actions">
                    <button className="pf-save-btn" onClick={handleSave}>Save</button>
                    <button className="pf-cancel-btn" onClick={handleCancel}>Cancel</button>
                  </div>
              }
            </div>

            {/* ACCOUNT TAB */}
            {activeTab === "account" && (
              <div className="pf-section">
                <Field label="Username" field="username" placeholder="Enter username" draft={draft} profile={profile} editing={editing} onChange={handleChange} />
                <Field label="Email" field="email" placeholder="Enter email" type="email" draft={draft} profile={profile} editing={editing} onChange={handleChange} />
                <Field label="Phone Number" field="phone" placeholder="(555) 000-0000" type="tel" draft={draft} profile={profile} editing={editing} onChange={handleChange} />
              </div>
            )}

            {/* DELIVERY TAB */}
            {activeTab === "delivery" && (
              <div className="pf-section">
                <div className="pf-section-note">📦 This address will be used as your default shipping destination.</div>
                <Field label="Street Address" field="deliveryAddress" placeholder="123 Main St" draft={draft} profile={profile} editing={editing} onChange={handleChange} />
                <Field label="City" field="city" placeholder="San Antonio" draft={draft} profile={profile} editing={editing} onChange={handleChange} />
                <div className="pf-row">
                  <Field label="State" field="state" placeholder="TX" draft={draft} profile={profile} editing={editing} onChange={handleChange} />
                  <Field label="ZIP Code" field="zip" placeholder="78201" draft={draft} profile={profile} editing={editing} onChange={handleChange} />
                </div>
              </div>
            )}

            {/* PAYMENT TAB */}
            {activeTab === "payment" && (
              <div className="pf-section">
                <div className="pf-section-note">💳 Manage your saved payment methods.</div>
                <Field label="Default Payment Method" field="paymentMethod" placeholder="e.g. Visa ending in 4242" draft={draft} profile={profile} editing={editing} onChange={handleChange} />
                <div className="pf-payment-cards">
                  <div className="pf-payment-card">
                    <span>💳</span>
                    <div>
                      <p className="pf-card-name">{profile.paymentMethod || "No card saved"}</p>
                      <p className="pf-card-sub">Default</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === "notifications" && (
              <div className="pf-section">
                <div className="pf-section-note">🔔 Choose what you'd like to be notified about.</div>
                {[["orders","Order Updates","Shipping, delivery, and order status"],["deals","Deals & Promotions","Personalized offers and flash sales"],["messages","Messages","Replies from sellers and buyers"]].map(([key, title, desc]) => (
                  <div className="pf-notif-row" key={key}>
                    <div>
                      <p className="pf-notif-title">{title}</p>
                      <p className="pf-notif-desc">{desc}</p>
                    </div>
                    <div
                      className={`pf-toggle${(editing ? draft : profile).notifications?.[key] ? " on" : ""}`}
                      onClick={() => toggleNotif(key)}
                    >
                      <div className="pf-toggle-thumb" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === "security" && (
              <div className="pf-section">
                <div className="pf-section-note">🔒 Keep your account secure.</div>
                <div className="pf-security-row">
                  <div>
                    <p className="pf-security-title">Password</p>
                    <p className="pf-security-sub">Last changed: Never</p>
                  </div>
                  <button className="pf-security-btn">Change Password</button>
                </div>
                <div className="pf-security-row">
                  <div>
                    <p className="pf-security-title">Two-Factor Authentication</p>
                    <p className="pf-security-sub">Not enabled</p>
                  </div>
                  <button className="pf-security-btn">Enable 2FA</button>
                </div>
                <div className="pf-security-row">
                  <div>
                    <p className="pf-security-title">Active Sessions</p>
                    <p className="pf-security-sub">1 device currently signed in</p>
                  </div>
                  <button className="pf-security-btn danger">Sign Out All</button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}