import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border transition-all transform animate-slide-in ${
              isSuccess
                ? 'bg-white border-emerald-300 text-slate-800'
                : isError
                ? 'bg-white border-rose-300 text-slate-800'
                : isWarning
                ? 'bg-white border-amber-300 text-slate-800'
                : 'bg-white border-blue-300 text-slate-800'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              {isError && <AlertCircle className="w-5 h-5 text-rose-500" />}
              {isWarning && <AlertCircle className="w-5 h-5 text-amber-500" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-blue-500" />}
            </div>

            <div className="flex-1 overflow-hidden">
              <h5 className="text-xs font-bold text-slate-900">{toast.title}</h5>
              {toast.message && (
                <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">{toast.message}</p>
              )}
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
