import React from 'react';
export default function About() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">About Our Farm</h1>
      <div className="card overflow-hidden !p-0 grid md:grid-cols-2">
        <img src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1000" className="h-64 md:h-full object-cover" alt="farm" />
        <div className="p-8">
          <h2 className="font-display text-xl font-bold">Three generations, one promise: fresh.</h2>
          <p className="text-sm text-stone-600 mt-3 leading-relaxed">Green Acres is a family farm in Nashik, Maharashtra. We grow vegetables, fruits, grains and dairy without middlemen — harvest happens at 5 AM, delivery the same day. What you pay goes mostly to the farmer, not the mandi chain.</p>
          <div className="grid grid-cols-3 gap-3 mt-6 text-center">
            {[['12+', 'acres'], ['40+', 'products'], ['2k+', 'families']].map(([n, l]) => (
              <div key={l} className="bg-cream rounded-xl p-3"><p className="font-bold text-xl text-leaf-700">{n}</p><p className="text-xs">{l}</p></div>
            ))}
          </div>
        </div>
      </div>
      <div className="card p-6 text-sm text-stone-600">
        <h3 className="font-bold text-stone-800">Terms & Privacy (summary)</h3>
        <p className="mt-2">Prices are farm-gate honest. Orders can be cancelled while pending/confirmed. COD payable on delivery. Online payments via Razorpay with signature verification. We never store card details.</p>
      </div>
    </div>
  );
}
