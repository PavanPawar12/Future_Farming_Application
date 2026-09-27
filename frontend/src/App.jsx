import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useSelector } from 'react-redux';
import api, { setAuthToken } from './services/api';
import { MainLayout, CustomerLayout, AdminLayout } from './layouts/Layouts';
import { CustomerRoute, AdminRoute } from './components/ProtectedRoute';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import About from './pages/About';
import Farm from './pages/Farm';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import { Dashboard, Profile, MyOrders, Addresses } from './pages/customer/Customer';
import OrderDetails from './pages/customer/OrderDetails';
import AdminLogin from './pages/admin/AdminLogin';
import { AdminDashboard, AdminOrders } from './pages/admin/AdminDashboard';
import AdminOrderDetails from './pages/admin/AdminOrderDetails';
import { AdminProducts, ProductForm, AdminCategories, AdminCustomers, AdminInventory, AdminSettings } from './pages/admin/AdminMisc';

function AuthBootstrap({ children }) {
  const { token } = useSelector((s) => s.auth);
  useEffect(() => {
    if (token) setAuthToken(token);
    // refresh session via cookie
    api.get('/auth/me').catch(() => {});
  }, []);
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthBootstrap>
        <Toaster position="top-center" richColors />
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/about" element={<About />} />
            <Route path="/farm" element={<Farm />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<CustomerRoute><Checkout /></CustomerRoute>} />
          </Route>

          <Route element={<CustomerRoute><CustomerLayout /></CustomerRoute>}>
            <Route path="/customer" element={<Dashboard />} />
            <Route path="/customer/orders" element={<MyOrders />} />
            <Route path="/customer/orders/:id" element={<OrderDetails />} />
            <Route path="/customer/addresses" element={<Addresses />} />
            <Route path="/customer/profile" element={<Profile />} />
          </Route>

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/products/new" element={<ProductForm />} />
            <Route path="/admin/products/:id/edit" element={<ProductForm />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/orders/:id" element={<AdminOrderDetails />} />
            <Route path="/admin/customers" element={<AdminCustomers />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/inventory" element={<AdminInventory />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthBootstrap>
    </BrowserRouter>
  );
}
