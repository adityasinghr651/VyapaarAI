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
    border: 'border-green-500/40 bg-green-50',
    iconColor: 'text-green-600',
  },
  error: {
    icon: AlertCircle,
    border: 'border-error/40 bg-error-container/30',
    iconColor: 'text-error',
  },
  warning: {
    icon: AlertTriangle,
    border: 'border-amber-500/40 bg-amber-50',
    iconColor: 'text-amber-600',
  },
  info: {
    icon: Info,
    border: 'border-primary/40 bg-primary/5',
    iconColor: 'text-primary',
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (item: Omit<ToastItem, 'id'>) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
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
    (title: string, description?: string) =>
      toast({ variant: 'success', title, description }),
    [toast]
  );

  const error = useCallback(
    (title: string, description?: string) =>
      toast({ variant: 'error', title, description }),
    [toast]
  );

  const warning = useCallback(
    (title: string, description?: string) =>
      toast({ variant: 'warning', title, description }),
    [toast]
  );

  const info = useCallback(
    (title: string, description?: string) =>
      toast({ variant: 'info', title, description }),
    [toast]
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss, success, error, warning, info }}>
      {children}
      <div
        role="region"
        aria-label="Notifications"
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
                  'pointer-events-auto flex w-full items-start gap-3 rounded-xl border bg-surface-container-lowest p-4 shadow-lg transition-all animate-in slide-in-from-right duration-300',
                  config.border
                )
              )}
            >
              <Icon size={18} className={clsx('mt-0.5 shrink-0', config.iconColor)} />
              <div className="flex-1 space-y-1">
                <p className="text-xs font-bold text-on-surface leading-tight">{t.title}</p>
                {t.description && (
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">{t.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Close notification"
                className="rounded-lg p-1 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface shrink-0"
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
