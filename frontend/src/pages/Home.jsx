import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Truck, Leaf, ShieldCheck, Star, ArrowRight } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [p, c] = await Promise.all([
          api.get('/products', { params: { featured: 'true', limit: 8 } }),
          api.get('/categories', { params: { activeOnly: 'true' } }),
        ]);
        setFeatured(p.data.data.items || []);
        setCats(c.data.data || []);
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="space-y-14">
      {/* HERO */}
      <section className="grid md:grid-cols-2 gap-8 items-center card overflow-hidden !p-0">
        <div className="p-8 md:p-12">
          <span className="badge bg-leaf-100 text-leaf-800">🌱 Direct from farm</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold mt-4 leading-tight">Fresh From Our Farm 🌱</h1>
          <p className="text-stone-600 mt-3">Fresh, quality products delivered directly from our farm to your home.</p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link to="/shop" className="btn-primary">Shop Fresh Products <ArrowRight size={18} /></Link>
            <Link to="/farm" className="btn-secondary">Explore Our Farm</Link>
          </div>
          <div className="flex gap-6 mt-6 text-sm">
            <span className="flex items-center gap-2"><Truck size={16} className="text-leaf-600" /> Same-day harvest</span>
            <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-leaf-600" /> No middlemen</span>
          </div>
        </div>
        <img src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200" alt="Farm" className="h-72 md:h-full w-full object-cover" />
      </section>

      {/* Categories */}
      <section>
        <h2 className="font-display text-2xl font-bold mb-4">Shop by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {(cats.length ? cats : [{ _id: '1', name: 'Vegetables' }, { _id: '2', name: 'Fruits' }, { _id: '3', name: 'Grains' }, { _id: '4', name: 'Dairy' }, { _id: '5', name: 'Farm Products' }, { _id: '6', name: 'Seasonal Products' }]).map((c) => (
            <Link key={c._id || c.name} to={`/shop?category=${c._id}`} className="card p-4 text-center hover:border-leaf-400 transition">
              <div className="text-3xl">🥬</div>
              <p className="font-semibold text-sm mt-2">{c.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl font-bold">Fresh Today</h2>
          <Link to="/shop" className="text-leaf-700 font-semibold text-sm">View all →</Link>
        </div>
        {loading ? <Loader text="Loading products..." /> : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {featured.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>

      {/* Why */}
      <section className="grid md:grid-cols-3 gap-4">
        {[
          { icon: <Leaf />, t: 'Harvested to order', d: 'We pick vegetables only after you order, so nothing sits in cold storage.' },
          { icon: <ShieldCheck />, t: 'Honest pricing', d: 'Direct-from-farm means you pay less and the farmer earns more.' },
          { icon: <Truck />, t: 'Fast local delivery', d: '₹30 delivery, free above ₹500. COD & UPI accepted.' },
        ].map((f, i) => (
          <motion.div key={i} whileHover={{ y: -4 }} className="card p-6">
            <div className="text-leaf-600">{f.icon}</div>
            <h3 className="font-semibold mt-2">{f.t}</h3>
            <p className="text-sm text-stone-500 mt-1">{f.d}</p>
          </motion.div>
        ))}
      </section>

      {/* How it works */}
      <section className="card p-8">
        <h2 className="font-display text-2xl font-bold text-center">How ordering works</h2>
        <div className="grid sm:grid-cols-4 gap-4 mt-6 text-center text-sm">
          {['Browse fresh products', 'Add to cart & checkout', 'Pay online or COD', 'Track live to doorstep'].map((s, i) => (
            <div key={i}><div className="w-10 h-10 mx-auto rounded-full bg-leaf-600 text-white font-bold flex items-center justify-center">{i + 1}</div><p className="mt-2 font-medium">{s}</p></div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section>
        <h2 className="font-display text-2xl font-bold mb-4">Loved by families</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            ['Priya S.', 'Tomatoes tasted like childhood — fresh and honest. Delivery was quick.'],
            ['Rahul P.', 'Milk and veggies every week now. COD makes it easy for my parents.'],
            ['Sneha K.', 'Order tracking is live. Out-for-delivery update is accurate.'],
          ].map(([n, t]) => (
            <div key={n} className="card p-5">
              <div className="flex text-amber-400">{[1, 2, 3, 4, 5].map((s) => <Star key={s} size={14} fill="currentColor" />)}</div>
              <p className="text-sm mt-2">“{t}”</p>
              <p className="text-xs font-semibold mt-2 text-leaf-700">{n}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-8 text-center bg-leaf-700 !border-0 text-white">
        <h2 className="font-display text-2xl font-bold">Eat fresh this week?</h2>
        <p className="text-leaf-100 text-sm mt-1">Harvest happens every morning at 5 AM.</p>
        <Link to="/shop" className="inline-block mt-4 bg-white text-leaf-800 font-bold px-6 py-3 rounded-xl">Shop Fresh Products</Link>
      </section>
    </div>
  );
}
