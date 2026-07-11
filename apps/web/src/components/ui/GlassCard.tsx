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
          'bg-slate-950/60 backdrop-blur-md border border-slate-900 rounded-xl p-4 md:p-6',
          hoverEffect &&
            'hover:border-primary/40 hover:shadow-[0_0_20px_rgba(124,58,237,0.12)] transition-all duration-300',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}
