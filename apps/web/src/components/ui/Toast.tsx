'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration?: number;
}

export interface ToastContextType {
  toast: (item: Omit<ToastItem, 'id'>) => string;
  dismiss: (id: string) => void;
  success: (title: string, description?: string) => string;
  error: (title: string, description?: string) => string;
  warning: (title: string, description?: string) => string;
  info: (title: string, description?: string) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const variantConfig: Record<
  ToastVariant,
  {
    icon: React.ComponentType<{ className?: string; size?: number | string }>;
    border: string;
    iconColor: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    border: 'border-emerald-500/30 bg-emerald-950/20',
    iconColor: 'text-emerald-400',
  },
  error: {
    icon: AlertCircle,
    border: 'border-rose-500/30 bg-rose-950/20',
    iconColor: 'text-rose-400',
  },
  warning: {
    icon: AlertTriangle,
    border: 'border-amber-500/30 bg-amber-950/20',
    iconColor: 'text-amber-400',
  },
  info: {
    icon: Info,
    border: 'border-blue-500/30 bg-blue-950/20',
    iconColor: 'text-blue-400',
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (item: Omit<ToastItem, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      const duration = item.duration ?? 4000;

      setToasts((prev) => [...prev, { ...item, id }]);

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, duration);
      }

      return id;
    },
    [dismiss]
  );

  const success = useCallback(
    (title: string, description?: string) => toast({ variant: 'success', title, description }),
    [toast]
  );

  const error = useCallback(
    (title: string, description?: string) => toast({ variant: 'error', title, description }),
    [toast]
  );

  const warning = useCallback(
    (title: string, description?: string) => toast({ variant: 'warning', title, description }),
    [toast]
  );

  const info = useCallback(
    (title: string, description?: string) => toast({ variant: 'info', title, description }),
    [toast]
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss, success, error, warning, info }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-2.5 pointer-events-none p-4 w-full"
      >
        {toasts.map((t) => {
          const config = variantConfig[t.variant];
          const Icon = config.icon;
          const isError = t.variant === 'error';

          return (
            <div
              key={t.id}
              role={isError ? 'alert' : 'status'}
              aria-live={isError ? 'assertive' : 'polite'}
              className={twMerge(
                clsx(
                  'pointer-events-auto flex w-full items-start gap-3 rounded-xl border bg-slate-950/90 p-4 shadow-2xl backdrop-blur-md transition-all animate-in slide-in-from-right duration-300',
                  config.border
                )
              )}
            >
              <Icon size={18} className={clsx('mt-0.5 shrink-0', config.iconColor)} />
              <div className="flex-1 space-y-1">
                <p className="text-xs font-semibold text-white leading-tight">{t.title}</p>
                {t.description && (
                  <p className="text-[11px] text-slate-300 leading-relaxed">{t.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Close notification"
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-900 hover:text-white shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
