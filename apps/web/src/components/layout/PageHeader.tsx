'use client';

import React from 'react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  action,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/60 pb-6 ${className}`}>
      <div>
        <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">{title}</h1>
        {description && (
          <p className="font-body-lg text-body-md text-on-surface-variant mt-1">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex items-center gap-3 shrink-0">{action}</div>}
    </div>
  );
}
