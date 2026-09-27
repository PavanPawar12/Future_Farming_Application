import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6"><Outlet /></main>
      <Footer />
    </div>
  );
}

export function CustomerLayout() {
  const loc = useLocation();
  const links = [
    { to: '/customer', label: 'Dashboard' },
    { to: '/customer/orders', label: 'My Orders' },
    { to: '/customer/addresses', label: 'Addresses' },
    { to: '/customer/profile', label: 'Profile' },
  ];
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 overflow-x-auto mb-6">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap ${loc.pathname === l.to ? 'bg-leaf-600 text-white' : 'bg-white border'}`}>{l.label}</Link>
          ))}
        </div>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export function AdminLayout() {
  const loc = useLocation();
  const nav = useNavigate();
  const links = [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/products', label: 'Products' },
    { to: '/admin/orders', label: 'Orders' },
    { to: '/admin/customers', label: 'Customers' },
    { to: '/admin/categories', label: 'Categories' },
    { to: '/admin/inventory', label: 'Inventory' },
    { to: '/admin/settings', label: 'Settings' },
  ];
  return (
    <div className="min-h-screen bg-stone-100">
      <div className="bg-leaf-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <Link to="/admin" className="font-display font-bold">🌱 Green Acres · Admin</Link>
        <div className="flex gap-2 text-sm">
          <Link to="/" className="underline">View Store</Link>
          <button onClick={() => nav('/admin/products/new')} className="bg-leaf-500 px-3 py-1 rounded-lg font-semibold">+ Product</button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
        <aside className="md:w-56 shrink-0 card p-3 h-fit flex md:flex-col flex-row overflow-x-auto gap-1">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${loc.pathname === l.to ? 'bg-leaf-100 text-leaf-800' : 'hover:bg-stone-100'}`}>{l.label}</Link>
          ))}
        </aside>
        <div className="flex-1 min-w-0"><Outlet /></div>
      </div>
    </div>
  );
}
