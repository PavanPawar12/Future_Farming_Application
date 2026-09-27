import React from 'react';
import { Check, Truck, Package, ChefHat, ClipboardCheck } from 'lucide-react';

const STEPS = [
  { key: 'pending', label: 'Order Placed', icon: ClipboardCheck },
  { key: 'confirmed', label: 'Confirmed', icon: Check },
  { key: 'preparing', label: 'Preparing', icon: ChefHat },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Package },
];

export default function OrderTimeline({ status }) {
  if (status === 'cancelled') {
    return <div className="card p-4 text-center text-red-700 font-semibold">This order was cancelled.</div>;
  }
  const idx = STEPS.findIndex((s) => s.key === status);
  return (
    <div className="card p-5">
      <div className="flex flex-col gap-0">
        {STEPS.map((s, i) => {
          const done = i < idx, active = i === idx;
          const Icon = s.icon;
          return (
            <div key={s.key} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 ${done ? 'bg-leaf-600 border-leaf-600 text-white' : active ? 'border-leaf-600 text-leaf-700 bg-leaf-50 animate-pulse' : 'border-stone-200 text-stone-400 bg-white'}`}>
                  {done ? <Check size={18} /> : <Icon size={18} />}
                </div>
                {i < STEPS.length - 1 && <div className={`w-0.5 flex-1 min-h-8 ${i < idx ? 'bg-leaf-500' : 'bg-stone-200'}`} />}
              </div>
              <div className="pb-6">
                <p className={`font-semibold ${done || active ? 'text-leaf-800' : 'text-stone-400'}`}>{s.label}</p>
                {active && <p className="text-xs text-leaf-600 font-medium">Current status — live updates on</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const statusBadge = (status) => {
  const map = {
    pending: 'bg-amber-100 text-amber-800', confirmed: 'bg-blue-100 text-blue-800',
    preparing: 'bg-purple-100 text-purple-800', out_for_delivery: 'bg-orange-100 text-orange-800',
    delivered: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800',
    paid: 'bg-green-100 text-green-800', failed: 'bg-red-100 text-red-800', refunded: 'bg-stone-200 text-stone-700',
  };
  return map[status] || 'bg-stone-100 text-stone-700';
};
