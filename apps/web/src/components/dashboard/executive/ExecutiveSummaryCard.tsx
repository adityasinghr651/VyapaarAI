'use client';

import React from 'react';

export interface ExecutiveSummaryCardProps {
  title: string;
  value: string;
  badgeText?: string;
  badgeIcon?: string;
  badgeVariant?: 'emerald' | 'rose' | 'info';
}

export function ExecutiveSummaryCard({
  title,
  value,
  badgeText,
  badgeIcon,
  badgeVariant = 'emerald',
}: ExecutiveSummaryCardProps) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 flex flex-col justify-between h-28 hover:bg-surface-container-low transition-colors">
      <div className="flex justify-between items-start">
        <span className="font-label-md text-label-md text-on-surface-variant uppercase">{title}</span>
        {badgeVariant === 'emerald' && badgeText && (
          <span className="flex items-center text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-bold">
            <span className="material-symbols-outlined text-[12px]">{badgeIcon || 'arrow_upward'}</span> {badgeText}
          </span>
        )}
        {badgeVariant === 'rose' && badgeText && (
          <span className="flex items-center text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded text-[10px] font-bold">
            <span className="material-symbols-outlined text-[12px]">{badgeIcon || 'arrow_downward'}</span> {badgeText}
          </span>
        )}
        {badgeVariant === 'info' && (
          <span className="material-symbols-outlined text-outline-variant text-[16px]">{badgeIcon || 'info'}</span>
        )}
      </div>
      <div className="font-headline-md text-headline-md text-on-surface mt-2">{value}</div>
    </div>
  );
}
