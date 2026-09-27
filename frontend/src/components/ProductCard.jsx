import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Minus, Plus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, setQuantity } from '../store/cartSlice';
import { toast } from 'sonner';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const inCart = useSelector((s) => s.cart.items.find((i) => i.product === product._id));
  const out = product.stock <= 0 || !product.isAvailable;
  const img = product.images?.[0] || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800';

  const add = () => {
    dispatch(addToCart({ product: product._id, name: product.name, price: product.price, unit: product.unit, image: img, stock: product.stock, quantity: 1 }));
    toast.success('Product added to cart');
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden flex flex-col">
      <Link to={`/product/${product._id}`} className="relative block aspect-[4/3] overflow-hidden bg-stone-100">
        <img src={img} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition duration-500" loading="lazy" />
        {product.featured && <span className="absolute top-2 left-2 badge bg-amber-100 text-amber-800">Featured</span>}
        {out && <span className="absolute top-2 right-2 badge bg-stone-800 text-white">Out of Stock</span>}
      </Link>
      <div className="p-4 flex flex-col gap-1.5 flex-1">
        <p className="text-[11px] uppercase tracking-wide text-leaf-700 font-semibold">{product.category?.name}</p>
        <Link to={`/product/${product._id}`} className="font-semibold leading-tight hover:text-leaf-700">{product.name}</Link>
        <p className="text-sm"><span className="font-bold text-lg">₹{product.price}</span> <span className="text-stone-500">/ {product.unit}</span>
          {product.mrp > product.price && <span className="ml-2 text-stone-400 line-through text-sm">₹{product.mrp}</span>}
        </p>
        <p className={`text-xs ${out ? 'text-red-600' : 'text-leaf-700'}`}>{out ? 'Out of Stock' : `Available: ${product.stock} ${product.unit}`}</p>
        <div className="mt-auto pt-2">
          {inCart ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 border rounded-xl px-2 py-1">
                <button onClick={() => dispatch(setQuantity({ product: product._id, quantity: inCart.quantity - 1 }))} className="p-1"><Minus size={16} /></button>
                <span className="font-semibold min-w-6 text-center">{inCart.quantity}</span>
                <button onClick={() => dispatch(setQuantity({ product: product._id, quantity: inCart.quantity + 1 }))} className="p-1"><Plus size={16} /></button>
              </div>
              <Link to="/cart" className="text-sm font-semibold text-leaf-700">Go to Cart</Link>
            </div>
          ) : (
            <button disabled={out} onClick={add} className="btn-primary w-full !py-2.5 text-sm">
              <ShoppingCart size={16} /> Add to Cart
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
