import React from 'react';
import { Loader2 } from 'lucide-react';
export default function Loader({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-stone-500">
      <Loader2 className="animate-spin text-leaf-600" size={32} />
      <p className="mt-3 text-sm font-medium">{text}</p>
    </div>
  );
}
