'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export function ExecutiveHeader() {
  const router = useRouter();

  return (
    <div className="flex justify-between items-end mb-2">
      <div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface">Executive Overview</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Financial summary and compliance status for May 2024
        </p>
      </div>
      <div className="flex gap-2 hidden md:flex">
        <button
          type="button"
          onClick={() => {
            // Trigger export functionality
          }}
          className="px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded text-on-surface font-label-md text-label-md flex items-center gap-2 hover:bg-surface-container-low transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">download</span> Export
        </button>
        <button
          type="button"
          onClick={() => router.push('/invoices')}
          className="px-4 py-2 bg-primary text-on-primary rounded font-label-md text-label-md flex items-center gap-2 hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add</span> New Invoice
        </button>
      </div>
    </div>
  );
}
