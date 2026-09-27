import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import Loader from '../../components/Loader';
import OrderTimeline, { statusBadge } from '../../components/OrderTimeline';
import { toast } from 'sonner';

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const { user, token } = useSelector((s) => s.auth);

  useEffect(() => {
    api.get(`/orders/${id}`).then((r) => setOrder(r.data.data)).catch(() => {});
    const s = getSocket(token);
    s.emit('join-user', user?._id);
    const handler = (o) => {
      if (o._id === id) {
        setOrder(o);
        toast.success(`Order ${o.orderStatus.replace(/_/g, ' ')}`);
      }
    };
    s.on('order:updated', handler);
    return () => s.off('order:updated', handler);
  }, [id]);

  if (!order) return <Loader text="Loading order..." />;

  const cancel = async () => {
    if (!confirm('Cancel this order? Stock will be restored.')) return;
    try {
      const r = await api.post(`/orders/${id}/cancel`);
      setOrder(r.data.data);
      toast.success('Order cancelled');
    } catch (e) { toast.error(e.response?.data?.message || 'Cannot cancel'); }
  };

  return (
    <div className="space-y-4">
      <Link to="/customer/orders" className="text-sm text-leaf-700 font-semibold">← All orders</Link>
      <div className="card p-5 flex flex-wrap justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-bold">Order #{order.orderNumber}</h1>
          <p className="text-xs text-stone-500">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex gap-2 items-center">
          <span className={`badge ${statusBadge(order.orderStatus)}`}>{order.orderStatus}</span>
          <span className={`badge ${statusBadge(order.paymentStatus)}`}>{order.paymentMethod === 'COD' ? 'COD' : 'ONLINE'} · {order.paymentStatus}</span>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <OrderTimeline status={order.orderStatus} />
        <div className="space-y-4">
          <div className="card p-5 text-sm">
            <h3 className="font-bold mb-2">Items</h3>
            {order.items.map((i, idx) => (
              <p key={idx} className="flex justify-between py-1 border-b last:border-0"><span>{i.name} · {i.quantity} {i.unit}</span><span>₹{i.lineTotal}</span></p>
            ))}
            <p className="flex justify-between mt-2"><span>Subtotal</span><span>₹{order.subtotal}</span></p>
            <p className="flex justify-between"><span>Delivery</span><span>{order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}</span></p>
            <p className="flex justify-between font-bold text-base"><span>Total</span><span>₹{order.totalAmount}</span></p>
          </div>
          <div className="card p-5 text-sm">
            <h3 className="font-bold mb-1">Deliver to</h3>
            <p>{order.shippingAddress.fullName} · {order.shippingAddress.phone}</p>
            <p className="text-stone-500">{order.shippingAddress.addressLine}, {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}</p>
          </div>
          {['pending', 'confirmed'].includes(order.orderStatus) && (
            <button onClick={cancel} className="btn-secondary w-full text-red-700">Cancel order</button>
          )}
        </div>
      </div>
    </div>
  );
}
