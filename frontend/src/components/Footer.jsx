import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-leaf-900 text-leaf-100 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid gap-8 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-display font-bold text-xl text-white">
            <span className="bg-leaf-500 p-1.5 rounded-xl"><Leaf size={20} /></span> Green Acres Farm
          </div>
          <p className="text-sm mt-3 text-leaf-200">Fresh, quality products delivered directly from our farm to your home.</p>
          <p className="text-xs mt-3 flex items-center gap-2"><MapPin size={14} /> Village Road, Nashik, Maharashtra</p>
          <p className="text-xs mt-1 flex items-center gap-2"><Phone size={14} /> +91 98765 43210</p>
          <p className="text-xs mt-1 flex items-center gap-2"><Mail size={14} /> hello@greenacres.farm</p>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Shop</h4>
          <div className="flex flex-col gap-2 text-sm">
            <Link to="/shop">All Products</Link>
            <Link to="/shop?featured=true">Featured</Link>
            <Link to="/cart">Cart</Link>
            <Link to="/customer/orders">Track Order</Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Farm</h4>
          <div className="flex flex-col gap-2 text-sm">
            <Link to="/farm">Our Farm</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Good to know</h4>
          <p className="text-sm text-leaf-200">Delivery ₹30 · Free above ₹500</p>
          <p className="text-sm text-leaf-200 mt-1">COD & Online payments (Razorpay)</p>
          <div className="flex gap-3 text-xs mt-3">
            <Link to="/about">Terms</Link><Link to="/about">Privacy</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-leaf-800 text-center text-xs py-4">© 2026 Green Acres Farm · Farm to Home</div>
    </footer>
  );
}
