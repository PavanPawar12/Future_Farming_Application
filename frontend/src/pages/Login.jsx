import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import api, { setAuthToken } from '../services/api';
import { setCredentials } from '../store/authSlice';
import { getSocket } from '../services/socket';
import { toast } from 'sonner';

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  const loc = useLocation();
  const dispatch = useDispatch();

  const onSubmit = async (data) => {
    setBusy(true);
    try {
      const r = await api.post('/auth/login', data);
      const user = r.data.data;
      const token = r.headers['x-token'] || null;
      dispatch(setCredentials({ user, token }));
      if (token) setAuthToken(token);
      const s = getSocket(token);
      s.emit('join-user', user._id);
      toast.success('Logged in successfully');
      nav(loc.state?.from || (user.role === 'admin' ? '/admin' : '/'), { replace: true });
    } catch (e) {
      toast.error(e.response?.data?.message || 'Invalid email or password');
    } finally { setBusy(false); }
  };

  return (
    <div className="max-w-md mx-auto card p-8">
      <h1 className="font-display text-2xl font-bold">Welcome back 🌱</h1>
      <p className="text-sm text-stone-500">Login to order fresh from the farm.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 mt-5">
        <div><label className="label">Email</label><input className="input" type="email" {...register('email', { required: 'Email required' })} />{errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}</div>
        <div><label className="label">Password</label><input className="input" type="password" {...register('password', { required: 'Password required' })} />{errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}</div>
        <button disabled={busy} className="btn-primary w-full">{busy ? 'Logging in...' : 'Login'}</button>
      </form>
      <p className="text-sm mt-4">New here? <Link to="/register" className="text-leaf-700 font-semibold">Create account</Link></p>
      <p className="text-sm">Farm admin? <Link to="/admin/login" className="text-leaf-700 font-semibold">Admin login</Link></p>
    </div>
  );
}
