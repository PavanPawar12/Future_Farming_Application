import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import api from '../../services/api';
import { setCredentials } from '../../store/authSlice';
import { toast } from 'sonner';

export default function AdminLogin() {
  const { register, handleSubmit } = useForm();
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  const dispatch = useDispatch();
  const onSubmit = async (data) => {
    setBusy(true);
    try {
      const r = await api.post('/auth/admin/login', data);
      dispatch(setCredentials({ user: r.data.data, token: null }));
      toast.success('Welcome back, farmer 👨‍🌾');
      nav('/admin');
    } catch (e) { toast.error(e.response?.data?.message || 'Invalid admin credentials'); }
    finally { setBusy(false); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-leaf-900 p-4">
      <div className="card p-8 w-full max-w-md">
        <p className="text-center text-3xl">🚜</p>
        <h1 className="font-display text-2xl font-bold text-center">Farm Admin</h1>
        <p className="text-xs text-center text-stone-500">Seeded: admin@farm.com / admin123</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 mt-5">
          <div><label className="label">Admin email</label><input className="input" type="email" {...register('email', { required: true })} /></div>
          <div><label className="label">Password</label><input className="input" type="password" {...register('password', { required: true })} /></div>
          <button disabled={busy} className="btn-primary w-full">{busy ? 'Checking...' : 'Login to dashboard'}</button>
        </form>
        <p className="text-center text-sm mt-3"><Link to="/" className="text-leaf-700 font-semibold">← Back to store</Link></p>
      </div>
    </div>
  );
}
