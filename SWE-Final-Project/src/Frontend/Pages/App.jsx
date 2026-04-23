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
import MiniProduct from "./MiniProduct.jsx";
import MiniProductCart from "./MiniProductCart.jsx";
import MiniProductOrder from "./MiniProductOrder.jsx";
import DealsPage from "./DealsPage.jsx";

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
        <Route path="/sold" element={<SoldPage />} />
        <Route path="/deals" element={<DealsPage />} />

      </Routes>
    </Router>
  );
}