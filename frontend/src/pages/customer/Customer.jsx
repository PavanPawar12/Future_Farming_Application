import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import api from '../../services/api';
import Loader from '../../components/Loader';
import { logout } from '../../store/authSlice';
import { toast } from 'sonner';

export function Dashboard() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get('/orders/my').then((r) => setOrders(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);
  const logoutNow = async () => { await api.post('/auth/logout').catch(() => {}); dispatch(logout()); window.location.href = '/'; };
  return (
    <div className="space-y-4">
      <div className="card p-6 flex items-center justify-between">
        <div><h1 className="font-display text-2xl font-bold">Namaste, {user?.name} 🌱</h1><p className="text-sm text-stone-500">{orders.length} orders so far</p></div>
        <button onClick={logoutNow} className="btn-secondary text-sm">Logout</button>
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        <Link to="/shop" className="card p-5 font-semibold hover:border-leaf-400">🛒 Shop fresh</Link>
        <Link to="/customer/orders" className="card p-5 font-semibold hover:border-leaf-400">📦 Track orders</Link>
        <Link to="/customer/addresses" className="card p-5 font-semibold hover:border-leaf-400">📍 Addresses</Link>
      </div>
      <h2 className="font-bold">Recent orders</h2>
      {loading ? <Loader /> : orders.length === 0 ? <div className="card p-6 text-sm">You haven't placed any orders yet. <Link to="/shop" className="text-leaf-700 font-semibold">Shop now</Link></div> : (
        <div className="space-y-2">
          {orders.slice(0, 5).map((o) => (
            <Link key={o._id} to={`/customer/orders/${o._id}`} className="card p-4 flex justify-between text-sm">
              <span>#{o.orderNumber} · {o.items.length} items · <b>₹{o.totalAmount}</b></span>
              <span className="badge bg-leaf-100 text-leaf-800">{o.orderStatus}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function Profile() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const save = async (e) => {
    e.preventDefault();
    const r = await api.put('/auth/profile', form);
    dispatch({ type: 'auth/setUser', payload: r.data.data });
    toast.success('Profile updated');
  };
  return (
    <form onSubmit={save} className="card p-6 max-w-lg space-y-3">
      <h1 className="font-display text-xl font-bold">Profile</h1>
      <p className="text-sm text-stone-500">{user?.email} · {user?.role}</p>
      <div><label className="label">Name</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
      <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
      <button className="btn-primary">Save</button>
    </form>
  );
}

export function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get('/orders/my').then((r) => setOrders(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);
  if (loading) return <Loader text="Loading orders..." />;
  if (!orders.length) return <div className="card p-10 text-center">You haven't placed any orders yet. <Link to="/shop" className="text-leaf-700 font-semibold">Shop fresh</Link></div>;
  return (
    <div className="space-y-2">
      <h1 className="font-display text-2xl font-bold">My Orders</h1>
      {orders.map((o) => (
        <Link key={o._id} to={`/customer/orders/${o._id}`} className="card p-4 flex flex-wrap gap-2 justify-between items-center text-sm">
          <span><b>#{o.orderNumber}</b> · {new Date(o.createdAt).toLocaleDateString()} · {o.items.length} items</span>
          <span><b>₹{o.totalAmount}</b> · {o.paymentMethod === 'COD' ? 'COD' : o.paymentStatus.toUpperCase()} · <span className="badge bg-leaf-100 text-leaf-800">{o.orderStatus}</span></span>
        </Link>
      ))}
    </div>
  );
}

export function Addresses() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ fullName: '', phone: '', addressLine: '', village: '', city: '', district: '', state: 'Maharashtra', pincode: '', landmark: '' });
  const [editing, setEditing] = useState(null);
  const load = () => api.get('/addresses').then((r) => setItems(r.data.data || [])).catch(() => {});
  useEffect(() => { load(); }, []);
  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/addresses/${editing}`, form);
      else await api.post('/addresses', form);
      toast.success('Address saved');
      setEditing(null);
      setForm({ fullName: '', phone: '', addressLine: '', village: '', city: '', district: '', state: 'Maharashtra', pincode: '', landmark: '' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <h1 className="font-display text-xl font-bold">Saved Addresses</h1>
        {items.map((a) => (
          <div key={a._id} className="card p-4 text-sm">
            <p><b>{a.fullName}</b> {a.isDefault && <span className="badge bg-leaf-100 text-leaf-800 ml-1">Default</span>}</p>
            <p className="text-stone-500">{a.addressLine}, {a.village} {a.city}, {a.state} — {a.pincode} · {a.phone}</p>
            <div className="flex gap-2 mt-2">
              <button onClick={() => { setEditing(a._id); setForm({ ...a }); }} className="text-leaf-700 font-semibold">Edit</button>
              <button onClick={async () => { await api.delete(`/addresses/${a._id}`); load(); }} className="text-red-600 font-semibold">Delete</button>
            </div>
          </div>
        ))}
        {!items.length && <div className="card p-6 text-sm text-stone-500">No addresses yet.</div>}
      </div>
      <form onSubmit={submit} className="card p-5 space-y-2 h-fit">
        <h2 className="font-bold">{editing ? 'Edit' : 'Add'} address</h2>
        {[['fullName', 'Full name'], ['phone', 'Phone'], ['addressLine', 'Address line'], ['village', 'Village'], ['city', 'City'], ['district', 'District'], ['state', 'State'], ['pincode', 'Pincode (6 digits)'], ['landmark', 'Landmark (optional)']].map(([k, l]) => (
          <div key={k}><label className="label">{l}</label><input className="input" value={form[k] || ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} required={['fullName', 'phone', 'addressLine', 'city', 'state', 'pincode'].includes(k)} /></div>
        ))}
        <button className="btn-primary w-full">Save address</button>
      </form>
    </div>
  );
}
