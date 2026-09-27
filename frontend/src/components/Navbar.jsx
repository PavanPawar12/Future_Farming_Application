import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectCartCount } from '../store/cartSlice';
import { ShoppingCart, Menu, X, Search, User } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const count = useSelector(selectCartCount);
  const { user } = useSelector((s) => s.auth);
  const [open, setOpen] = useState(false);
  const links = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/farm', label: 'Our Farm' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];
  return (
    <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl text-leaf-800">
          <span className="bg-leaf-600 text-white p-1.5 rounded-xl"><Leaf size={20} /></span>
          Green Acres
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {links.map((l) => <Link key={l.to} className="hover:text-leaf-700" to={l.to}>{l.label}</Link>)}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/shop" className="hidden sm:inline-flex btn-secondary !px-3 !py-2 text-sm"><Search size={18} /></Link>
          <Link to="/cart" className="relative btn-secondary !px-3 !py-2">
            <ShoppingCart size={18} />
            {count > 0 && <span className="absolute -top-2 -right-2 bg-leaf-600 text-white text-[11px] w-5 h-5 rounded-full flex items-center justify-center">{count}</span>}
          </Link>
          {user ? (
            <Link to={user.role === 'admin' ? '/admin' : '/customer'} className="btn-primary !px-4 !py-2 text-sm">
              <User size={16} /> {user.name?.split(' ')[0]}
            </Link>
          ) : (
            <Link to="/login" className="btn-primary !px-4 !py-2 text-sm">Login</Link>
          )}
          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        </div>
      </div>
      {open && (
        <nav className="md:hidden border-t border-stone-200 bg-cream px-4 py-3 flex flex-col gap-2">
          {links.map((l) => <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="py-2 font-medium">{l.label}</Link>)}
        </nav>
      )}
    </header>
  );
}
