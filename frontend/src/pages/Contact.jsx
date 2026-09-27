import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
export default function Contact() {
  const { register, handleSubmit, reset } = useForm();
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Contact the farm</h1>
        <p className="text-sm text-stone-500 mt-2">Phone: +91 98765 43210 · hello@greenacres.farm<br />Village Road, Nashik, Maharashtra · 7 AM – 7 PM</p>
        <div className="card p-4 mt-4 text-sm">Bulk / hotel / tiffin orders welcome — call us for weekly rates.</div>
      </div>
      <form className="card p-6 space-y-3" onSubmit={handleSubmit((d) => { toast.success('Message received! We will call back.'); reset(); })}>
        <div><label className="label">Name</label><input className="input" {...register('name', { required: true })} /></div>
        <div><label className="label">Phone</label><input className="input" {...register('phone', { required: true })} /></div>
        <div><label className="label">Message</label><textarea className="input" rows={4} {...register('message', { required: true })} /></div>
        <button className="btn-primary w-full">Send message</button>
      </form>
    </div>
  );
}
