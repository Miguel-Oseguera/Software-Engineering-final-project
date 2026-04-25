import { useNavigate } from "react-router-dom";

export default function Navbar({ active }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const links = [
    ["Home", "/"],
    ["Orders", "/orders"],
    ["Deals", "/deals"],
    ["Selling", "/selling"],
    ["Listings", "/listings"],
    ["Sold", "/sold"],
  ];

  if (user?.is_admin === 1) {
    links.push(["Admin", "/admin"]);
  }

  return (
    <nav className="mp-nav">
      {links.map(([label, path]) => (
        <button
          key={label}
          className={`mp-nav-btn ${active === label ? "active" : ""}`}
          onClick={() => navigate(path)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}