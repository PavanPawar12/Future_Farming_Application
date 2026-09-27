import React from 'react';
export default function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div className="card p-10 text-center max-w-md mx-auto">
      <div className="text-4xl mb-3">{icon || '🌾'}</div>
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      {subtitle && <p className="text-stone-500 text-sm mt-1">{subtitle}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
