import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import api from '../services/api';
import { clearCart, selectSubtotal } from '../store/cartSlice';
import { toast } from 'sonner';
import Loader from '../components/Loader';

export default function Checkout() {
  const items = useSelector((s) => s.cart.items);
  const subtotal = useSelector(selectSubtotal);
  const dispatch = useDispatch();
  const nav = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [payment, setPayment] = useState('COD');
  const [placing, setPlacing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/addresses').then((r) => {
      setAddresses(r.data.data || []);
      const d = (r.data.data || []).find((a) => a.isDefault) || r.data.data?.[0];
      if (d) setSelected(d._id);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const delivery = subtotal >= 500 ? 0 : 30;
  const total = subtotal + delivery;

  const loadRazorpay = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });

  const placeOrder = async () => {
    if (!items.length) return toast.error('Cart is empty');
    if (!selected) return toast.error('Select a delivery address');
    setPlacing(true);
    try {
      const addr = addresses.find((a) => a._id === selected);
      const { fullName, phone, addressLine, village, city, district, state, pincode, landmark } = addr;
      const payload = {
        items: items.map((i) => ({ product: i.product, quantity: i.quantity })),
        shippingAddress: { fullName, phone, addressLine, village, city, district, state, pincode, landmark },
        paymentMethod: payment,
      };
      const r = await api.post('/orders', payload);
      const { order, razorpayOrder, razorpayKeyId } = r.data.data;

      if (payment === 'COD') {
        toast.success('Order placed successfully');
        dispatch(clearCart());
        nav(`/customer/orders/${order._id}`);
        return;
      }
      // Online: open Razorpay
      const ok = await loadRazorpay();
      if (!ok) throw new Error('Razorpay SDK failed to load');
      const rzp = new window.Razorpay({
        key: razorpayKeyId,
        amount: razorpayOrder.amount,
        currency: 'INR',
        order_id: razorpayOrder.id,
        name: 'Green Acres Farm',
        description: `Order #${order.orderNumber}`,
        handler: async (resp) => {
          try {
            await api.post(`/orders/${order._id}/verify-payment`, {
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
            });
            toast.success('Payment successful');
            dispatch(clearCart());
            nav(`/customer/orders/${order._id}`);
          } catch {
            toast.error('Payment verification failed');
            nav(`/customer/orders/${order._id}`);
          }
        },
        modal: { ondismiss: () => toast.error('Payment cancelled — order kept as pending') },
      });
      rzp.open();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Order failed');
    } finally { setPlacing(false); }
  };

  if (!items.length) return <div className="card p-8 text-center">Empty cart. <Link to="/shop" className="text-leaf-700 font-semibold">Shop now</Link></div>;
  if (loading) return <Loader text="Loading checkout..." />;

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-4">
        <div className="card p-5">
          <h2 className="font-bold">1 · Delivery address</h2>
          {addresses.length === 0 ? (
            <p className="text-sm mt-2">No addresses. <Link to="/customer/addresses" className="text-leaf-700 font-semibold">Add one →</Link></p>
          ) : (
            <div className="grid gap-2 mt-3">
              {addresses.map((a) => (
                <label key={a._id} className={`border rounded-xl p-3 text-sm flex gap-2 cursor-pointer ${selected === a._id ? 'border-leaf-500 bg-leaf-50' : ''}`}>
                  <input type="radio" checked={selected === a._id} onChange={() => setSelected(a._id)} />
                  <span><b>{a.fullName}</b> · {a.phone}<br />{a.addressLine}, {a.village} {a.city}, {a.state} — {a.pincode}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        <div className="card p-5">
          <h2 className="font-bold">2 · Review cart</h2>
          <div className="text-sm mt-2 space-y-1">
            {items.map((i) => <p key={i.product} className="flex justify-between"><span>{i.name} · {i.quantity} {i.unit}</span><span>₹{i.quantity * i.price}</span></p>)}
          </div>
        </div>
        <div className="card p-5">
          <h2 className="font-bold">3 · Payment method</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
            {['COD', 'UPI', 'Card', 'NetBanking'].map((m) => (
              <button key={m} onClick={() => setPayment(m)} className={`border rounded-xl py-2.5 text-sm font-semibold ${payment === m ? 'border-leaf-600 bg-leaf-50 text-leaf-800' : ''}`}>
                {m === 'COD' ? 'Cash on Delivery' : m}
              </button>
            ))}
          </div>
          <p className="text-xs text-stone-500 mt-2">{payment === 'COD' ? 'Pay in cash/UPI when your order arrives.' : 'Secured by Razorpay. Never marked paid without signature verification.'}</p>
        </div>
      </div>
      <div className="card p-5 h-fit sticky top-20">
        <h3 className="font-bold">4 · Place order</h3>
        <div className="text-sm mt-2 space-y-1">
          <p className="flex justify-between"><span>Subtotal</span><span>₹{subtotal}</span></p>
          <p className="flex justify-between"><span>Delivery</span><span>{delivery === 0 ? 'FREE' : `₹${delivery}`}</span></p>
          <p className="flex justify-between font-bold text-base border-t pt-2"><span>Total</span><span>₹{total}</span></p>
        </div>
        <button disabled={placing} onClick={placeOrder} className="btn-primary w-full mt-4">{placing ? 'Placing...' : `Place order · ₹${total}`}</button>
      </div>
    </div>
  );
}
