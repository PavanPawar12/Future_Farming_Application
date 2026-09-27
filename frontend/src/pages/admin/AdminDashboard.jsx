import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import Loader from '../../components/Loader';
import { toast } from 'sonner';

export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const { token } = useSelector((s) => s.auth);
  const load = () => api.get('/admin/dashboard').then((r) => setStats(r.data.data)).catch(() => {});
  useEffect(() => {
    load();
    const s = getSocket(token);
    s.emit('join-admin');
    s.on('order:new', (o) => { toast.success(`🔔 New Order #${o.orderNumber} · ₹${o.totalAmount}`); load(); });
    s.on('order:updated', load);
    return () => { s.off('order:new'); s.off('order:updated'); };
  }, []);
  if (!stats) return <Loader text="Loading dashboard..." />;
  const cards = [
    ['Total Orders', stats.totalOrders], ["Today's Orders", stats.todaysOrders],
    ['Revenue', `₹${stats.revenue}`], ['Pending Orders', stats.pendingOrders],
    ['Products', stats.products], ['Customers', stats.customers],
  ];
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold">Dashboard 🚜</h1>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {cards.map(([l, v]) => <div key={l} className="card p-4"><p className="text-xs text-stone-500">{l}</p><p className="text-2xl font-bold">{v}</p></div>)}
      </div>
      {stats.lowStock?.length > 0 && (
        <div className="card p-4">
          <h3 className="font-bold text-sm">⚠️ Low stock ({stats.lowStock.length})</h3>
          <div className="text-sm mt-2">{stats.lowStock.map((p) => <p key={p._id}>{p.name} — {p.stock} {p.unit}</p>)}</div>
          <Link to="/admin/inventory" className="text-leaf-700 text-sm font-semibold">Manage inventory →</Link>
        </div>
      )}
      <div className="card p-4">
        <div className="flex justify-between items-center"><h3 className="font-bold">Recent orders</h3><Link to="/admin/orders" className="text-sm text-leaf-700 font-semibold">View all</Link></div>
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-stone-500"><th className="py-2">Order</th><th>Customer</th><th>Amount</th><th>Payment</th><th>Status</th></tr></thead>
            <tbody>
              {stats.recentOrders?.map((o) => (
                <tr key={o._id} className="border-t"><td><Link to={`/admin/orders/${o._id}`} className="font-semibold text-leaf-700">#{o.orderNumber}</Link></td><td>{o.user?.name}</td><td>₹{o.totalAmount}</td><td>{o.paymentMethod === 'COD' ? 'COD' : o.paymentStatus.toUpperCase()}</td><td>{o.orderStatus}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function AdminOrders() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('');
  const load = () => api.get('/admin/all'.replace('/admin/all', '/orders/admin/all'), { params: status ? { status } : {} }).then((r) => setItems(r.data.data.items || [])).catch(() => {});
  useEffect(() => { load(); }, [status]);
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h1 className="font-display text-2xl font-bold">Orders</h1>
        <select className="input !w-48" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {items.length === 0 ? <div className="card p-8 text-center text-sm">No pending orders.</div> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead><tr className="text-left text-stone-500 border-b"><th className="p-3">Order</th><th>Customer</th><th>Date</th><th>Amount</th><th>Payment</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {items.map((o) => (
                <tr key={o._id} className="border-b last:border-0">
                  <td className="p-3 font-bold">#{o.orderNumber}</td><td>{o.user?.name}</td><td>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td>₹{o.totalAmount}</td><td>{o.paymentMethod === 'COD' ? 'COD' : `ONLINE ${o.paymentStatus.toUpperCase()}`}</td><td>{o.orderStatus}</td>
                  <td><Link to={`/admin/orders/${o._id}`} className="text-leaf-700 font-semibold">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
