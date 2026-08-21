import "./App.css"
import { Routes, Route } from "react-router-dom"
import Layout from "./components/common/layout"
import ProtectedRoute from "./components/ProtectedRoute"
import Home from "./pages/shop/Home"
import CategoryPage from "./pages/shop/CategoryPage"
import ProductPage from "./pages/shop/ProductPage"
import CareGuides from "./pages/shop/CareGuides"
import AdminLogin from "./pages/admin/AdminLogin"
import Cart from "./pages/shop/Cart"
import BeginnerGuide from "./pages/shop/BeginnerGuide"
import AllProductPage from "./pages/shop/AllProductPage"
import FeaturedAllPage from "./pages/shop/FeaturedAllPage"
import CheckoutPage from "./pages/payment/CheckoutPage"
import QRPayment from "./pages/payment/QRPayment"
import PaymentSuccess from "./pages/payment/PaymentSuccess"
import ForgotPassword from "./pages/auth/ForgotPassword"
import ResetPassword from "./pages/auth/ResetPassword"
import ForgotSuccess from "./pages/auth/ForgotSuccess"
import ResetSuccess from "./pages/auth/ResetSuccess"
import AdminDashboard from "./pages/admin/AdminDashboard"
import Inventory from "./pages/admin/Inventory"
import ProductManagement from "./pages/admin/ProductManagement"
import Orders from "./pages/admin/Orders"
import Coupons from "./pages/admin/Coupons"
import Customers from "./pages/admin/Customers"
import Analytics from "./pages/admin/Analytics"
import Notifications from "./pages/admin/Notifications"
import Settings from "./pages/admin/Settings"
import SignUp from "./pages/auth/SignUp"
import SignIn from "./pages/auth/SignIn"
import Profile from "./pages/auth/Profile"
import OrderHistory from "./pages/auth/OrderHistory"
import ScrollToTop from "./components/common/ScrollToTop"

function App() {

  return (
    <>
    <ScrollToTop />
    <Routes>
      <Route element={<Layout />}>
      <Route path="/" element={<Home />} />
      <Route path="/shop-all" element={<AllProductPage />} />
      <Route path="/:category/:subCategory" element={<CategoryPage />} />
      <Route path="/:category/:subCategory/:slug" element={<ProductPage />} />
      <Route path="/beginner-guide" element={<BeginnerGuide />} />
      <Route path="/care-guides" element={<CareGuides />} />
      <Route path="/cart" element={<Cart/>} />
      <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
      <Route path="/featured/:type" element={<FeaturedAllPage />} />
      <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
      </Route>
      <Route path="/qr-payment" element={<ProtectedRoute><QRPayment /></ProtectedRoute>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/forgot-password/success" element={<ForgotSuccess />} />
      <Route path="/reset-password" element={<ProtectedRoute><ResetPassword /></ProtectedRoute>} />
      <Route path="/reset-password/success" element={<ResetSuccess />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/inventory" element={<ProtectedRoute requireAdmin><Inventory /></ProtectedRoute>} />
      <Route path="/admin/products" element={<ProtectedRoute requireAdmin><ProductManagement /></ProtectedRoute>} />
      <Route path="/admin/orders" element={<ProtectedRoute requireAdmin><Orders /></ProtectedRoute>} />
      <Route path="/admin/coupons" element={<ProtectedRoute requireAdmin><Coupons /></ProtectedRoute>} />
      <Route path="/admin/customers" element={<ProtectedRoute requireAdmin><Customers /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute requireAdmin><Analytics /></ProtectedRoute>} />
      <Route path="/admin/notifications" element={<ProtectedRoute requireAdmin><Notifications /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute requireAdmin><Settings /></ProtectedRoute>} />
    </Routes>
    </>
  )
}


export default App
