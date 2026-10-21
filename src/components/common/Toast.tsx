import React, { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const Toast: React.FC = () => {
  const { toastMessage, clearToast } = useCart();

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        clearToast();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, clearToast]);

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-in max-w-md">
      <div className="flex items-center gap-3 bg-dark-850/95 border border-brand-orange/40 text-white px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md shadow-black/80">
        <CheckCircle2 className="w-5 h-5 text-brand-orange flex-shrink-0" />
        <p className="text-sm font-medium flex-1 text-slate-100">{toastMessage}</p>
        <button
          onClick={clearToast}
          className="text-slate-400 hover:text-white transition-colors p-1"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
