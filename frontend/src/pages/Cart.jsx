import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setQuantity, removeItem, selectSubtotal } from '../store/cartSlice';
import { Minus, Plus, Trash2 } from 'lucide-react';
import EmptyState from '../components/EmptyState';

export default function Cart() {
  const items = useSelector((s) => s.cart.items);
  const subtotal = useSelector(selectSubtotal);
  const dispatch = useDispatch();
  const delivery = subtotal === 0 ? 0 : subtotal >= 500 ? 0 : 30;

  if (!items.length) {
    return <EmptyState title="Your cart is empty" subtitle="Add fresh vegetables, fruits and dairy." action={<Link to="/shop" className="btn-primary">Shop Fresh Products</Link>} />;
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-3">
        <h1 className="font-display text-2xl font-bold">Your Cart ({items.length})</h1>
        {items.map((i) => (
          <div key={i.product} className="card p-4 flex gap-3 items-center">
            <img src={i.image} className="w-16 h-16 rounded-xl object-cover" alt={i.name} />
            <div className="flex-1">
              <p className="font-semibold">{i.name}</p>
              <p className="text-sm text-stone-500">{i.quantity} {i.unit} × ₹{i.price} = <b className="text-stone-800">₹{i.quantity * i.price}</b></p>
              <div className="flex items-center gap-2 mt-2">
                <button onClick={() => dispatch(setQuantity({ product: i.product, quantity: i.quantity - 1 }))} className="border rounded-lg p-1"><Minus size={14} /></button>
                <span className="font-bold text-sm w-6 text-center">{i.quantity}</span>
                <button onClick={() => dispatch(setQuantity({ product: i.product, quantity: i.quantity + 1 }))} className="border rounded-lg p-1"><Plus size={14} /></button>
              </div>
            </div>
            <button onClick={() => dispatch(removeItem(i.product))} className="text-red-600 p-2"><Trash2 size={18} /></button>
          </div>
        ))}
      </div>
      <div className="card p-5 h-fit sticky top-20">
        <h3 className="font-bold">Bill</h3>
        <div className="text-sm mt-3 space-y-1">
          <p className="flex justify-between"><span>Subtotal</span><span>₹{subtotal}</span></p>
          <p className="flex justify-between"><span>Delivery</span><span>{delivery === 0 ? 'FREE' : `₹${delivery}`}</span></p>
          {delivery > 0 && <p className="text-xs text-leaf-700">Add ₹{500 - subtotal} more for FREE delivery</p>}
          <p className="flex justify-between font-bold text-base pt-2 border-t"><span>Total</span><span>₹{subtotal + delivery}</span></p>
        </div>
        <Link to="/checkout" className="btn-primary w-full mt-4">Proceed to Checkout</Link>
        <Link to="/shop" className="btn-secondary w-full mt-2">Continue shopping</Link>
      </div>
    </div>
  );
}
