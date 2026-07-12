'use client';

import React from 'react';

export type ConversationStatus = 'Extracted' | 'Processing' | 'No Actionable Data';

export interface ConversationCardProps {
  sender: string;
  time: string;
  message: string;
  status: ConversationStatus;
  isSelected?: boolean;
  onClick?: () => void;
}

export function ConversationCard({
  sender,
  time,
  message,
  status,
  isSelected = false,
  onClick,
}: ConversationCardProps) {
  let containerClasses =
    'p-3 rounded-lg border border-outline-variant hover:bg-surface-container-low cursor-pointer transition-colors opacity-80';
  let badgeContent = null;

  if (status === 'Extracted') {
    if (isSelected) {
      containerClasses =
        'p-3 rounded-lg border border-whatsapp-green bg-whatsapp-green-dim/10 cursor-pointer transition-colors relative';
    } else {
      containerClasses =
        'p-3 rounded-lg border border-outline-variant hover:border-whatsapp-green cursor-pointer transition-colors';
    }
    badgeContent = (
      <div className="mt-3 flex items-center gap-1 text-whatsapp-green">
        <span className="material-symbols-outlined text-[14px]">check_circle</span>
        <span className="font-label-md text-[10px] uppercase">Extracted</span>
      </div>
    );
  } else if (status === 'Processing') {
    containerClasses =
      'p-3 rounded-lg border border-outline-variant hover:bg-surface-container-low cursor-pointer transition-colors opacity-80';
    badgeContent = (
      <div className="mt-3 flex items-center gap-1 text-primary">
        <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
        <span className="font-label-md text-[10px] uppercase">AI Processing...</span>
      </div>
    );
  } else {
    containerClasses =
      'p-3 rounded-lg border border-outline-variant hover:bg-surface-container-low cursor-pointer transition-colors opacity-60';
    badgeContent = (
      <div className="mt-3 flex items-center gap-1 text-on-surface-variant">
        <span className="material-symbols-outlined text-[14px]">remove_done</span>
        <span className="font-label-md text-[10px] uppercase">No Actionable Data</span>
      </div>
    );
  }

  return (
    <div className={containerClasses} onClick={onClick}>
      <div className="flex justify-between items-start mb-2">
        <div className="font-label-md text-label-md text-on-surface">{sender}</div>
        <div className="font-label-md text-[10px] text-on-surface-variant">{time}</div>
      </div>
      <div className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/50 relative shadow-sm inline-block max-w-[85%]">
        <p className="font-body-md text-body-md text-on-surface">{message}</p>
        {/* Speech Tail */}
        <div className="absolute -left-2 top-0 w-4 h-4 text-surface-container-lowest">
          <svg className="fill-current drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]" height="13" viewBox="0 0 8 13" width="8">
            <path d="M1.533,3.568L8,12.193V1H2.812 C1.042,1,0.474,2.156,1.533,3.568z"></path>
          </svg>
        </div>
      </div>
      {badgeContent}
    </div>
  );
}
