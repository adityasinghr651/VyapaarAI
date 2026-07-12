import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={twMerge(
        clsx(
          'flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-xl border border-dashed border-outline-variant bg-surface-container-low/40',
          className
        )
      )}
      {...props}
    >
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-container border border-outline-variant text-on-surface-variant">
          {icon}
        </div>
      )}
      <h3 className="text-base font-bold text-on-surface">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-on-surface-variant leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
