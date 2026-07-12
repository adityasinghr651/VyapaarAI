'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export function AssistantPanel() {
  const router = useRouter();

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded flex flex-col flex-1 relative overflow-hidden">
      {/* Subtle Background Shader/Gradient for AI vibe */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
      <div className="p-4 border-b border-outline-variant/50 flex items-center gap-2 relative z-10">
        <span className="material-symbols-outlined text-primary">smart_toy</span>
        <h3 className="font-headline-md text-headline-md text-on-surface text-[16px]">VyaparAI Assistant</h3>
      </div>
      <div className="p-4 flex-1 flex flex-col relative z-10">
        <p className="font-body-md text-[13px] text-on-surface-variant mb-4">
          Based on your recent activity, here are suggested next steps to keep your business running smoothly.
        </p>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => router.push('/invoices')}
            className="w-full text-left px-3 py-2.5 rounded bg-surface hover:bg-surface-container-low border border-outline-variant/50 flex items-center justify-between group transition-colors"
          >
            <span className="font-body-md text-body-md text-on-surface group-hover:text-primary transition-colors">
              Create Invoice for Gupta &amp; Sons
            </span>
            <span className="material-symbols-outlined text-[18px] text-outline-variant group-hover:text-primary transition-colors">
              arrow_forward
            </span>
          </button>
          <button
            type="button"
            onClick={() => router.push('/approvals')}
            className="w-full text-left px-3 py-2.5 rounded bg-surface hover:bg-surface-container-low border border-outline-variant/50 flex items-center justify-between group transition-colors"
          >
            <span className="font-body-md text-body-md text-on-surface group-hover:text-primary transition-colors">
              Check upcoming GST Due Dates
            </span>
            <span className="material-symbols-outlined text-[18px] text-outline-variant group-hover:text-primary transition-colors">
              arrow_forward
            </span>
          </button>
          <button
            type="button"
            onClick={() => router.push('/invoices')}
            className="w-full text-left px-3 py-2.5 rounded bg-surface hover:bg-surface-container-low border border-outline-variant/50 flex items-center justify-between group transition-colors"
          >
            <span className="font-body-md text-body-md text-on-surface group-hover:text-primary transition-colors">
              Generate September Sales Report
            </span>
            <span className="material-symbols-outlined text-[18px] text-outline-variant group-hover:text-primary transition-colors">
              arrow_forward
            </span>
          </button>
          <button
            type="button"
            onClick={() => router.push('/customers')}
            className="w-full text-left px-3 py-2.5 rounded bg-surface hover:bg-surface-container-low border border-[#FCA5A5]/50 flex items-center justify-between group transition-colors"
          >
            <span className="font-body-md text-body-md text-[#991B1B] group-hover:text-error transition-colors">
              Follow up on 3 overdue payments
            </span>
            <span className="material-symbols-outlined text-[18px] text-[#DC2626] group-hover:text-error transition-colors">
              arrow_forward
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
