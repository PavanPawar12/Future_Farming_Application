import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import api from '../services/api';
import { setCredentials } from '../store/authSlice';
import { toast } from 'sonner';

export default function Register() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  const dispatch = useDispatch();

  const onSubmit = async (data) => {
    setBusy(true);
    try {
      const r = await api.post('/auth/register', data);
      dispatch(setCredentials({ user: r.data.data, token: null }));
      toast.success('Registered successfully');
      nav('/');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Registration failed');
    } finally { setBusy(false); }
  };

  return (
    <div className="max-w-md mx-auto card p-8">
      <h1 className="font-display text-2xl font-bold">Join the farm family 🌾</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 mt-5">
        <div><label className="label">Full name</label><input className="input" {...register('name', { required: 'Name required' })} />{errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}</div>
        <div><label className="label">Email</label><input className="input" type="email" {...register('email', { required: 'Email required' })} />{errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}</div>
        <div><label className="label">Phone (optional)</label><input className="input" {...register('phone')} /></div>
        <div><label className="label">Password (min 6)</label><input className="input" type="password" {...register('password', { required: 'Password required', minLength: { value: 6, message: 'Min 6 characters' } })} />{errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}</div>
        <button disabled={busy} className="btn-primary w-full">{busy ? 'Creating...' : 'Create account'}</button>
      </form>
      <p className="text-sm mt-4">Have an account? <Link to="/login" className="text-leaf-700 font-semibold">Login</Link></p>
    </div>
  );
}
