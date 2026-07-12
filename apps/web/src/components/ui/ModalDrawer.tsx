'use client';

import React, { useEffect } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { X } from 'lucide-react';

export interface ModalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
  position?: 'modal' | 'drawer-right' | 'drawer-left';
  className?: string;
}

export function ModalDrawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'max-w-lg',
  position = 'modal',
  className,
}: ModalDrawerProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const isDrawer = position === 'drawer-right' || position === 'drawer-left';

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden bg-on-surface/40 backdrop-blur-xs animate-in fade-in-0 duration-200">
      {/* Backdrop click dismiss */}
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Content panel */}
      <div
        role="dialog"
        aria-modal="true"
        className={twMerge(
          clsx(
            'relative z-10 flex flex-col bg-surface-container-lowest border border-outline-variant shadow-2xl transition-all text-on-surface',
            isDrawer
              ? clsx(
                  'h-full w-full max-w-md',
                  position === 'drawer-right'
                    ? 'ml-auto border-l animate-in slide-in-from-right duration-300'
                    : 'mr-auto border-r animate-in slide-in-from-left duration-300'
                )
              : clsx(
                  'm-auto w-full rounded-2xl p-0 animate-in zoom-in-95 duration-200 max-h-[90vh]',
                  maxWidth
                ),
            className
          )
        )}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between border-b border-outline-variant p-6 bg-surface-container-low/50">
            <div className="space-y-1">
              {title && <h2 className="text-lg font-bold tracking-tight text-on-surface">{title}</h2>}
              {description && <p className="text-xs text-on-surface-variant">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-surface-container-lowest">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end space-x-3 border-t border-outline-variant bg-surface-container-low p-4 px-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
