import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export function GlassCard({
  children,
  className,
  hoverEffect = false,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-surface-container-lowest border border-outline-variant rounded-xl p-4 md:p-6 shadow-sm',
          hoverEffect &&
            'hover:border-primary/40 hover:shadow-md transition-all duration-300',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}
