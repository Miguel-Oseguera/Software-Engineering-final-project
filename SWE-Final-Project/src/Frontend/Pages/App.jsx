import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./AuthPage.jsx";
import MainPage from "./MainPage.jsx";
import ProductPage from "./ProductPage.jsx";
import CartPage from "./CartPage.jsx";
import OrdersPage from "./OrdersPage.jsx";
import ProfilePage from "./ProfilePage.jsx";
import SellingPage from "./SellingPage.jsx";
import ListingsPage from "./ListingsPage.jsx";
import SoldPage from "./SoldPage.jsx";
import DealsPage from "./DealsPage.jsx";
import AdminPage from "./AdminPage.jsx";

export default function App() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isLoggedIn = !!user;

  return (
    <Router>
      <Routes>
        <Route path="/" element={isLoggedIn ? <MainPage /> : <Navigate to="/login" />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/selling" element={<SellingPage />} />
        <Route path="/listings" element={<ListingsPage />} />
        <Route path="/sold" element={<SoldPage />} />
        <Route path="/deals" element={<DealsPage />} />

        <Route
          path="/admin"
          element={
            isLoggedIn && Number(user?.is_admin) === 1
              ? <AdminPage />
              : <Navigate to="/" />
          }
        />
      </Routes>
    </Router>
  );
}