import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import Loader from '../../components/Loader';
import { toast } from 'sonner';

export function AdminProducts() {
  const [items, setItems] = useState([]);
  const load = () => api.get('/products', { params: { all: 'true', limit: 100 } }).then((r) => setItems(r.data.data.items || [])).catch(() => {});
  useEffect(() => { load(); }, []);
  const del = async (id) => {
    if (!confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    toast.success('Product deleted');
    load();
  };
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h1 className="font-display text-2xl font-bold">Products</h1>
        <Link to="/admin/products/new" className="btn-primary text-sm">+ Add Product</Link>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead><tr className="text-left text-stone-500 border-b"><th className="p-3">Product</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {items.map((p) => (
              <tr key={p._id} className="border-b last:border-0">
                <td className="p-3 flex items-center gap-2"><img src={p.images?.[0]} className="w-10 h-10 rounded-lg object-cover" alt="" /><span><b>{p.name}</b><br /><span className="text-xs text-stone-500">{p.category?.name} {p.featured && '· ⭐'}</span></span></td>
                <td>₹{p.price}/{p.unit}</td><td>{p.stock}</td>
                <td>{p.isAvailable && p.stock > 0 ? 'Active' : 'Disabled'}</td>
                <td className="whitespace-nowrap"><Link to={`/admin/products/${p._id}/edit`} className="text-leaf-700 font-semibold mr-3">Edit</Link><button onClick={() => del(p._id)} className="text-red-600 font-semibold">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ProductForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const nav = useNavigate();
  const { register, handleSubmit, setValue } = useForm();
  const [cats, setCats] = useState([]);
  const [files, setFiles] = useState([]);
  const [existing, setExisting] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/categories').then((r) => setCats(r.data.data || []));
    if (isEdit) {
      api.get(`/products/${id}`).then((r) => {
        const p = r.data.data;
        for (const k of ['name', 'description', 'price', 'mrp', 'unit', 'stock', 'isAvailable', 'featured']) setValue(k, p[k]);
        setValue('category', p.category?._id || p.category);
        setExisting(p.images || []);
      });
    }
  }, [id]);

  const onSubmit = async (data) => {
    setBusy(true);
    try {
      const fd = new FormData();
      for (const k of ['name', 'description', 'price', 'mrp', 'unit', 'stock', 'category', 'isAvailable', 'featured']) fd.append(k, data[k] ?? '');
      for (const f of files) fd.append('images', f);
      if (isEdit) {
        // keep existing images
        for (const u of existing) fd.append('images', u);
        // send as urlencoded-ish? backend reads req.body.images — with multipart, string fields ok
        await api.put(`/products/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product updated');
      } else {
        await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product added successfully');
      }
      nav('/admin/products');
    } catch (e) { toast.error(e.response?.data?.message || 'Save failed'); }
    finally { setBusy(false); }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card p-6 max-w-2xl space-y-3">
      <h1 className="font-display text-xl font-bold">{isEdit ? 'Edit' : 'Add'} Product</h1>
      <div><label className="label">Name</label><input className="input" {...register('name', { required: true })} /></div>
      <div><label className="label">Description</label><textarea className="input" rows={3} {...register('description')} /></div>
      <div className="grid grid-cols-3 gap-2">
        <div><label className="label">Price ₹</label><input type="number" className="input" {...register('price', { required: true })} /></div>
        <div><label className="label">MRP ₹</label><input type="number" className="input" {...register('mrp')} /></div>
        <div><label className="label">Stock</label><input type="number" className="input" {...register('stock', { required: true })} /></div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div><label className="label">Unit</label><select className="input" {...register('unit')}><option value="kg">kg</option><option value="gram">gram</option><option value="litre">litre</option><option value="dozen">dozen</option><option value="piece">piece</option><option value="packet">packet</option></select></div>
        <div><label className="label">Category</label><select className="input" {...register('category', { required: true })}><option value="">Select</option>{cats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</select></div>
      </div>
      <div className="flex gap-4 text-sm">
        <label className="flex gap-2 items-center"><input type="checkbox" {...register('isAvailable')} defaultChecked /> Available</label>
        <label className="flex gap-2 items-center"><input type="checkbox" {...register('featured')} /> Featured</label>
      </div>
      <div>
        <label className="label">Images (upload up to 5, or Cloudinary URLs kept)</label>
        <input type="file" multiple accept="image/*" onChange={(e) => setFiles([...e.target.files])} className="text-sm" />
        {existing.length > 0 && <div className="flex gap-2 mt-2">{existing.map((u) => <img key={u} src={u} className="w-14 h-14 rounded-lg object-cover" alt="" />)}</div>}
      </div>
      <button disabled={busy} className="btn-primary">{busy ? 'Saving...' : isEdit ? 'Save changes' : 'Add product'}</button>
    </form>
  );
}

export function AdminCategories() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const load = () => api.get('/categories').then((r) => setItems(r.data.data || []));
  useEffect(() => { load(); }, []);
  return (
    <div className="space-y-3">
      <h1 className="font-display text-2xl font-bold">Categories</h1>
      <form className="card p-4 flex gap-2" onSubmit={async (e) => { e.preventDefault(); await api.post('/categories', { name }); setName(''); load(); }}>
        <input className="input" placeholder="New category (e.g. Spices)" value={name} onChange={(e) => setName(e.target.value)} required />
        <button className="btn-primary whitespace-nowrap">Add</button>
      </form>
      <div className="grid gap-2">
        {items.map((c) => (
          <div key={c._id} className="card p-3 flex justify-between text-sm">
            <span><b>{c.name}</b> · {c.slug}</span>
            <button className="text-red-600 font-semibold" onClick={async () => { if (confirm('Delete?')) { await api.delete(`/categories/${c._id}`); load(); } }}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminCustomers() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get('/admin/customers', { params: { limit: 50 } }).then((r) => setItems(r.data.data.items || [])); }, []);
  return (
    <div className="space-y-3">
      <h1 className="font-display text-2xl font-bold">Customers</h1>
      <div className="card overflow-x-auto"><table className="w-full text-sm min-w-[600px]">
        <thead><tr className="text-left text-stone-500 border-b"><th className="p-3">Name</th><th>Email</th><th>Orders</th><th>Spent</th></tr></thead>
        <tbody>{items.map((u) => <tr key={u._id} className="border-b last:border-0"><td className="p-3 font-semibold">{u.name}</td><td>{u.email}</td><td>{u.orders}</td><td>₹{u.totalSpent}</td></tr>)}</tbody>
      </table></div>
    </div>
  );
}

export function AdminInventory() {
  const [items, setItems] = useState([]);
  const load = () => api.get('/admin/inventory').then((r) => setItems(r.data.data || []));
  useEffect(() => { load(); }, []);
  const save = async (p) => {
    await api.put(`/products/${p._id}`, { stock: p.stock, price: p.price, isAvailable: p.isAvailable });
    toast.success('Inventory updated');
  };
  return (
    <div className="space-y-3">
      <h1 className="font-display text-2xl font-bold">Inventory</h1>
      <div className="space-y-2">
        {items.map((p, i) => (
          <div key={p._id} className="card p-3 flex flex-wrap items-center gap-2 text-sm">
            <b className="flex-1 min-w-32">{p.name}</b>
            <label>Stock <input type="number" className="input !w-24 !py-1" value={p.stock} onChange={(e) => { const c = [...items]; c[i].stock = Number(e.target.value); setItems(c); }} /></label>
            <label>₹ <input type="number" className="input !w-24 !py-1" value={p.price} onChange={(e) => { const c = [...items]; c[i].price = Number(e.target.value); setItems(c); }} /></label>
            <label className="flex items-center gap-1"><input type="checkbox" checked={p.isAvailable} onChange={(e) => { const c = [...items]; c[i].isAvailable = e.target.checked; setItems(c); }} /> Active</label>
            <button onClick={() => save(p)} className="btn-primary !py-1.5 !px-3 text-xs">Save</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminSettings() {
  const [form, setForm] = useState({ deliveryCharge: 30, freeDeliveryMinAmount: 500, deliveryAreas: [], farmName: '', farmPhone: '', farmEmail: '', farmAddress: '' });
  const [areas, setAreas] = useState('');
  useEffect(() => {
    api.get('/admin/settings').then((r) => { setForm(r.data.data); setAreas((r.data.data.deliveryAreas || []).join(', ')); });
  }, []);
  const save = async (e) => {
    e.preventDefault();
    await api.put('/admin/settings', { ...form, deliveryAreas: areas.split(',').map((s) => s.trim()).filter(Boolean) });
    toast.success('Settings saved');
  };
  return (
    <form onSubmit={save} className="card p-6 max-w-xl space-y-3">
      <h1 className="font-display text-xl font-bold">Delivery & Farm Settings</h1>
      <div className="grid grid-cols-2 gap-2">
        <div><label className="label">Delivery charge ₹</label><input type="number" className="input" value={form.deliveryCharge} onChange={(e) => setForm({ ...form, deliveryCharge: Number(e.target.value) })} /></div>
        <div><label className="label">Free above ₹</label><input type="number" className="input" value={form.freeDeliveryMinAmount} onChange={(e) => setForm({ ...form, freeDeliveryMinAmount: Number(e.target.value) })} /></div>
      </div>
      <div><label className="label">Delivery areas (comma separated)</label><input className="input" value={areas} onChange={(e) => setAreas(e.target.value)} /></div>
      <div><label className="label">Farm name</label><input className="input" value={form.farmName || ''} onChange={(e) => setForm({ ...form, farmName: e.target.value })} /></div>
      <div className="grid grid-cols-2 gap-2">
        <div><label className="label">Phone</label><input className="input" value={form.farmPhone || ''} onChange={(e) => setForm({ ...form, farmPhone: e.target.value })} /></div>
        <div><label className="label">Email</label><input className="input" value={form.farmEmail || ''} onChange={(e) => setForm({ ...form, farmEmail: e.target.value })} /></div>
      </div>
      <div><label className="label">Address</label><input className="input" value={form.farmAddress || ''} onChange={(e) => setForm({ ...form, farmAddress: e.target.value })} /></div>
      <button className="btn-primary">Save settings</button>
    </form>
  );
}
