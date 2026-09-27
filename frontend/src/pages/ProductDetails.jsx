import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/Loader';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { toast } from 'sonner';
import { Minus, Plus, ShoppingCart } from 'lucide-react';

export default function ProductDetails() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const dispatch = useDispatch();

  useEffect(() => {
    api.get(`/products/${id}`).then((r) => setP(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader text="Loading product..." />;
  if (!p) return <div className="card p-10 text-center">Product not found. <Link to="/shop" className="text-leaf-700 font-semibold">Back to shop</Link></div>;

  const out = p.stock <= 0 || !p.isAvailable;
  const img = p.images?.[0] || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800';

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="card overflow-hidden !p-0">
        <img src={img} alt={p.name} className="w-full aspect-square object-cover" />
        {p.images?.length > 1 && (
          <div className="flex gap-2 p-3 overflow-x-auto">
            {p.images.map((u, i) => <img key={i} src={u} className="w-16 h-16 rounded-lg object-cover border" alt="" />)}
          </div>
        )}
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-leaf-700 font-bold">{p.category?.name}</p>
        <h1 className="font-display text-3xl font-bold mt-1">{p.name}</h1>
        <p className="mt-2 text-2xl font-bold">₹{p.price} <span className="text-base font-normal text-stone-500">/ {p.unit}</span>
          {p.mrp > p.price && <span className="ml-2 text-stone-400 line-through text-lg">₹{p.mrp}</span>}
        </p>
        <p className={`text-sm mt-1 font-medium ${out ? 'text-red-600' : 'text-leaf-700'}`}>{out ? 'Out of Stock' : `Available: ${p.stock} ${p.unit}`}</p>
        <p className="text-stone-600 text-sm mt-4 leading-relaxed">{p.description || 'Fresh from our farm, harvested to order.'}</p>
        <div className="flex items-center gap-3 mt-6">
          <div className="flex items-center gap-3 border rounded-xl px-3 py-2">
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-1"><Minus size={16} /></button>
            <span className="font-bold w-6 text-center">{qty}</span>
            <button onClick={() => setQty(Math.min(p.stock || 99, qty + 1))} className="p-1"><Plus size={16} /></button>
          </div>
          <button disabled={out} onClick={() => { dispatch(addToCart({ product: p._id, name: p.name, price: p.price, unit: p.unit, image: img, stock: p.stock, quantity: qty })); toast.success('Product added to cart'); }} className="btn-primary flex-1">
            <ShoppingCart size={18} /> Add to Cart · ₹{p.price * qty}
          </button>
        </div>
        <div className="card p-4 mt-6 text-sm text-stone-600">
          <p>🚚 Delivery ₹30 · Free above ₹500</p>
          <p className="mt-1">💵 COD & Online (UPI / Card / NetBanking) accepted</p>
          <p className="mt-1">🌱 Harvested on order — no cold storage</p>
        </div>
      </div>
    </div>
  );
}
