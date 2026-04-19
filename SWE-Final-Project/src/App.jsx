import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./AuthPage";
import MainPage from "./MainPage";
import ProductPage from "./ProductPage";
import CartPage from "./CartPage";
import OrdersPage from "./OrdersPage";
import ProfilePage from "./ProfilePage";
import SellingPage from "./SellingPage";
import ListingsPage from "./ListingsPage";
import MiniProduct from "./MiniProduct";
import MiniProductCart from "./MiniProductCart";
import MiniProductOrder from "./MiniProductOrder";

export default function App() {
  const isLoggedIn = localStorage.getItem("user");

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={isLoggedIn ? <MainPage /> : <Navigate to="/login" />}
        />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/product/:id" element={<ProductPage />} />

        {/* ⭐ NEW CART ROUTE */}
        <Route path="/cart" element={<CartPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/selling" element={<SellingPage />} />
        <Route path="/listings" element={<ListingsPage />} />

      </Routes>
    </Router>
  );
}