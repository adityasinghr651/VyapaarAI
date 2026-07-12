'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export function QuickActionGrid() {
  const router = useRouter();

  return (
    <div className="grid grid-cols-3 gap-2 h-24 shrink-0">
      <button
        type="button"
        onClick={() => router.push('/invoices')}
        className="bg-surface-container-lowest border border-outline-variant rounded flex flex-col items-center justify-center gap-1 hover:bg-surface-container-low hover:border-primary/50 transition-all group"
      >
        <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">post_add</span>
        <span className="font-label-md text-[10px] text-on-surface text-center px-1">
          Create<br />Invoice
        </span>
      </button>
      <button
        type="button"
        onClick={() => router.push('/customers')}
        className="bg-surface-container-lowest border border-outline-variant rounded flex flex-col items-center justify-center gap-1 hover:bg-surface-container-low hover:border-primary/50 transition-all group"
      >
        <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">person_add</span>
        <span className="font-label-md text-[10px] text-on-surface text-center px-1">
          Add<br />Customer
        </span>
      </button>
      <button
        type="button"
        onClick={() => router.push('/approvals')}
        className="bg-surface-container-lowest border border-outline-variant rounded flex flex-col items-center justify-center gap-1 hover:bg-surface-container-low hover:border-primary/50 transition-all group"
      >
        <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">upload_file</span>
        <span className="font-label-md text-[10px] text-on-surface text-center px-1">
          Upload<br />Document
        </span>
      </button>
    </div>
  );
}
