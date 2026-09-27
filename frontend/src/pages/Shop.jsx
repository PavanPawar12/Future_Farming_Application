import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: params.get('search') || '',
    category: params.get('category') || '',
    sort: 'newest',
    minPrice: '', maxPrice: '', available: false, featured: params.get('featured') === 'true',
  });

  useEffect(() => {
    api.get('/categories').then((r) => setCats(r.data.data || [])).catch(() => {});
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const p = {};
      if (filters.search) p.search = filters.search;
      if (filters.category) p.category = filters.category;
      if (filters.sort) p.sort = filters.sort;
      if (filters.minPrice) p.minPrice = filters.minPrice;
      if (filters.maxPrice) p.maxPrice = filters.maxPrice;
      if (filters.available) p.available = 'true';
      if (filters.featured) p.featured = 'true';
      p.limit = 48;
      const r = await api.get('/products', { params: p });
      setItems(r.data.data.items || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);
  // debounce search
  useEffect(() => {
    const t = setTimeout(fetchProducts, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [filters]);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Shop Fresh Products</h1>
      <p className="text-stone-500 text-sm mt-1">Harvested this morning · Direct from farm</p>

      <div className="card p-4 mt-4 grid gap-3 md:grid-cols-6">
        <input className="input md:col-span-2" placeholder="Search tomatoes, milk..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        <select className="input" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
          <option value="">All Categories</option>
          {cats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select className="input" value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}>
          <option value="newest">Newest</option>
          <option value="price_asc">Price low to high</option>
          <option value="price_desc">Price high to low</option>
          <option value="popular">Popular</option>
        </select>
        <input className="input" type="number" placeholder="Min ₹" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} />
        <input className="input" type="number" placeholder="Max ₹" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} />
        <div className="md:col-span-6 flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={filters.available} onChange={(e) => setFilters({ ...filters, available: e.target.checked })} /> In stock only</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={filters.featured} onChange={(e) => setFilters({ ...filters, featured: e.target.checked })} /> Featured</label>
          <button onClick={() => setFilters({ search: '', category: '', sort: 'newest', minPrice: '', maxPrice: '', available: false, featured: false })} className="text-leaf-700 font-semibold">Clear</button>
        </div>
      </div>

      {loading ? <Loader text="Loading products..." /> : items.length === 0 ? (
        <div className="mt-6"><EmptyState title="No products found" subtitle="Try a different search or category." /></div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {items.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}
