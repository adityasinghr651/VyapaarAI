'use client';

import React from 'react';

export type SummaryCardVariant = 'default' | 'amber' | 'red' | 'compliance';

export interface SummaryCardProps {
  title: string;
  value: string;
  icon: string;
  subtext?: string;
  subIcon?: string;
  variant?: SummaryCardVariant;
}

export function SummaryCard({
  title,
  value,
  icon,
  subtext,
  subIcon,
  variant = 'default',
}: SummaryCardProps) {
  let containerClasses = 'bg-surface-container-lowest border border-outline-variant rounded p-4 flex flex-col justify-between h-full';
  let titleClasses = 'font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-[10px]';
  let iconClasses = 'material-symbols-outlined text-on-surface-variant text-[20px]';
  let valueClasses = 'font-display text-[24px] text-on-surface';
  let subtextClasses = 'flex items-center gap-1 mt-1 text-xs text-on-surface-variant';
  const subIconClasses = 'material-symbols-outlined text-[14px]';

  if (variant === 'default' && title.includes('Revenue')) {
    iconClasses = 'material-symbols-outlined text-primary text-[20px]';
    subtextClasses = 'flex items-center gap-1 mt-1 text-xs text-primary';
  } else if (variant === 'amber') {
    containerClasses = 'bg-[#FFFBEB] border border-[#FCD34D] rounded p-4 flex flex-col justify-between h-full';
    titleClasses = 'font-label-md text-label-md text-[#92400E] uppercase tracking-wider text-[10px]';
    iconClasses = 'material-symbols-outlined text-[#D97706] text-[20px]';
    valueClasses = 'font-display text-[24px] text-[#92400E]';
    subtextClasses = 'flex items-center gap-1 mt-1 text-xs text-[#D97706] font-medium';
  } else if (variant === 'red') {
    containerClasses = 'bg-[#FEF2F2] border border-[#FCA5A5] rounded p-4 flex flex-col justify-between h-full';
    titleClasses = 'font-label-md text-label-md text-[#991B1B] uppercase tracking-wider text-[10px]';
    iconClasses = 'material-symbols-outlined text-[#DC2626] text-[20px]';
    valueClasses = 'font-display text-[24px] text-[#991B1B]';
    subtextClasses = 'flex items-center gap-1 mt-1 text-xs text-[#DC2626] font-medium';
  } else if (variant === 'compliance') {
    containerClasses = 'bg-surface-container-lowest border border-outline-variant rounded p-4 flex flex-col justify-between h-full relative overflow-hidden';
    titleClasses = 'font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-[10px] relative z-10';
    iconClasses = 'material-symbols-outlined text-primary text-[20px] relative z-10';
    valueClasses = 'font-display text-[24px] text-on-surface relative z-10';
    subtextClasses = 'flex items-center gap-1 mt-1 text-xs text-[#059669] relative z-10';
  }

  return (
    <div className={containerClasses}>
      {variant === 'compliance' && (
        <div className="absolute bottom-0 right-0 opacity-10 translate-x-4 translate-y-4 pointer-events-none">
          <span className="material-symbols-outlined text-[80px] text-primary">verified</span>
        </div>
      )}
      <div className="flex justify-between items-start mb-2">
        <span className={titleClasses}>{title}</span>
        <span className={iconClasses}>{icon}</span>
      </div>
      <div>
        <div className={valueClasses}>{value}</div>
        {subtext && (
          <div className={subtextClasses}>
            {subIcon && <span className={subIconClasses}>{subIcon}</span>}
            <span>{subtext}</span>
          </div>
        )}
      </div>
    </div>
  );
}
