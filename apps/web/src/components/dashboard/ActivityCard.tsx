'use client';

import React from 'react';

export interface ActivityCardProps {
  icon: string;
  iconHoverClass?: string;
  titleNode: React.ReactNode;
  timestamp: string;
  subtitleNode: React.ReactNode;
}

export function ActivityCard({
  icon,
  iconHoverClass = 'group-hover:bg-primary-container group-hover:text-on-primary',
  titleNode,
  timestamp,
  subtitleNode,
}: ActivityCardProps) {
  return (
    <div className="flex gap-4 relative z-10 pb-6 group">
      <div
        className={`w-8 h-8 rounded-full bg-surface-container-low border border-outline-variant flex items-center justify-center shrink-0 transition-colors mt-0.5 ${iconHoverClass}`}
      >
        <span className="material-symbols-outlined text-[16px]">{icon}</span>
      </div>
      <div className="flex-1 bg-surface border border-outline-variant/50 rounded p-3 group-hover:bg-surface-container-low transition-colors">
        <div className="flex justify-between items-start">
          <div className="font-body-md text-body-md text-on-surface">{titleNode}</div>
          <span className="font-body-md text-xs text-on-surface-variant ml-2 whitespace-nowrap">{timestamp}</span>
        </div>
        <div className="font-body-md text-[13px] text-on-surface-variant mt-1">{subtitleNode}</div>
      </div>
    </div>
  );
}
