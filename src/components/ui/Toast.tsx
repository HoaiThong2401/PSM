import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toast: (msg: Omit<ToastMessage, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback((msg: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { ...msg, id };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 sm:top-5 sm:right-5 z-[110] flex flex-col gap-2.5 max-w-sm w-[calc(100%-2rem)] sm:w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-start gap-3 p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xl animate-slide-left"
          >
            <div className="shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-500" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-indigo-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t.title}</h4>
              {t.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.description}</p>
              )}
              {t.action && (
                <button
                  onClick={() => {
                    t.action?.onClick();
                    removeToast(t.id);
                  }}
                  className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {t.action.label}
                </button>
              )}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
