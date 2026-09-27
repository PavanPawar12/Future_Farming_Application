import React from 'react';
import { Link } from 'react-router-dom';
export default function Farm() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Our Farm 🌾</h1>
      <img src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200" className="rounded-2xl w-full h-72 object-cover" alt="farm" />
      <div className="grid md:grid-cols-3 gap-4">
        {[['Morning harvest', 'Picked at 5 AM after your order, never stocked.'], ['No middlemen', 'Farmer earns ~70% of what you pay vs ~30% in mandis.'], ['Local delivery', 'Nashik + nearby villages. ₹30, free above ₹500.']].map(([t, d]) => (
          <div key={t} className="card p-5"><h3 className="font-bold">{t}</h3><p className="text-sm text-stone-500 mt-1">{d}</p></div>
        ))}
      </div>
      <Link to="/shop" className="btn-primary">Shop the harvest</Link>
    </div>
  );
}
