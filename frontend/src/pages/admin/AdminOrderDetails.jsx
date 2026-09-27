import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import Loader from '../../components/Loader';
import OrderTimeline from '../../components/OrderTimeline';
import { toast } from 'sonner';

export default function AdminOrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const update = async (status) => {
    try {
      const r = await api.patch(`/orders/${id}/status`, { status });
      setOrder(r.data.data);
      toast.success('Order status updated');
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };
  useEffect(() => { api.get(`/orders/${id}`).then((r) => setOrder(r.data.data)).catch(() => {}); }, [id]);
  if (!order) return <Loader />;
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold">Order #{order.orderNumber}</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-5 text-sm space-y-1">
          <p><b>Customer:</b> {order.user?.name} · {order.user?.email} · {order.user?.phone}</p>
          <p><b>Items:</b></p>
          {order.items.map((i, x) => <p key={x}>{i.name} — {i.quantity} {i.unit} × ₹{i.price} = ₹{i.lineTotal}</p>)}
          <p><b>Total:</b> ₹{order.totalAmount} (sub ₹{order.subtotal} + delivery ₹{order.deliveryCharge})</p>
          <p><b>Payment:</b> {order.paymentMethod} · {order.paymentStatus}</p>
          <p><b>Address:</b> {order.shippingAddress.fullName}, {order.shippingAddress.addressLine}, {order.shippingAddress.city} — {order.shippingAddress.pincode} · {order.shippingAddress.phone}</p>
          <div className="flex flex-wrap gap-2 pt-3">
            {['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'].map((s) => (
              <button key={s} onClick={() => update(s)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${order.orderStatus === s ? 'bg-leaf-600 text-white' : 'bg-white'}`}>{s}</button>
            ))}
          </div>
          <p className="text-xs text-stone-500 pt-2">Status change notifies the customer in real time via Socket.IO.</p>
        </div>
        <OrderTimeline status={order.orderStatus} />
      </div>
    </div>
  );
}
