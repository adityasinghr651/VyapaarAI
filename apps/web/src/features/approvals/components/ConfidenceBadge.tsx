'use client';

import React from 'react';

export interface ConfidenceBadgeProps {
  sourceName: string;
  score?: number;
}

export function ConfidenceBadge({
  sourceName,
  score = 96,
}: ConfidenceBadgeProps) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6 shadow-sm shrink-0">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Extracted Record</h3>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Source: {sourceName} (WhatsApp)
          </p>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-whatsapp-green text-[18px]">verified</span>
            <span className="font-label-md text-label-md text-on-surface">AI Confidence Score</span>
          </div>
          <div className="flex items-center gap-3 w-full">
            <div className="h-2 w-32 bg-surface-container-high rounded-full overflow-hidden">
              <div className="h-full bg-whatsapp-green" style={{ width: `${score}%` }}></div>
            </div>
            <span className="font-data-tabular text-data-tabular text-whatsapp-green font-bold">{score}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
