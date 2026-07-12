'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export function DashboardHeader() {
  const router = useRouter();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface">Financial Overview</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Real-time snapshot of your business operations and compliance.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => {
            // Placeholder for export triggering
          }}
          className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded hover:bg-surface-container-low transition-colors font-label-md text-label-md text-on-surface"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          Export Report
        </button>
        <button
          type="button"
          onClick={() => router.push('/invoices')}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded hover:bg-surface-tint transition-colors font-label-md text-label-md"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Create Invoice
        </button>
      </div>
    </div>
  );
}
