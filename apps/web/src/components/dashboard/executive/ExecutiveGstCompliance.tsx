'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export function ExecutiveGstCompliance() {
  const router = useRouter();

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4">
      <h3 className="font-label-md text-label-md text-on-surface-variant uppercase mb-4">GST Compliance Status</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* GSTR-1 */}
        <div className="flex items-center gap-3 p-3 border border-outline-variant rounded-lg bg-emerald-50/30">
          <div className="w-2 h-full bg-emerald-500 rounded-full"></div>
          <div className="flex-1">
            <div className="font-body-md text-body-md font-bold text-on-surface">GSTR-1</div>
            <div className="text-[12px] text-on-surface-variant">Filed on 10 May</div>
          </div>
          <span className="material-symbols-outlined text-emerald-600">check_circle</span>
        </div>

        {/* GSTR-3B */}
        <div className="flex items-center gap-3 p-3 border border-outline-variant rounded-lg bg-amber-50/30">
          <div className="w-2 h-full bg-amber-500 rounded-full"></div>
          <div className="flex-1">
            <div className="font-body-md text-body-md font-bold text-on-surface">GSTR-3B</div>
            <div className="text-[12px] text-on-surface-variant">Due in 5 Days</div>
          </div>
          <button
            type="button"
            onClick={() => router.push('/approvals')}
            className="text-[12px] font-bold text-primary hover:underline cursor-pointer"
          >
            Prepare
          </button>
        </div>

        {/* E-Invoice Sync */}
        <div className="flex items-center gap-3 p-3 border border-outline-variant rounded-lg bg-rose-50/30">
          <div className="w-2 h-full bg-rose-500 rounded-full"></div>
          <div className="flex-1">
            <div className="font-body-md text-body-md font-bold text-on-surface">E-Invoice Sync</div>
            <div className="text-[12px] text-on-surface-variant">2 Failed Pending</div>
          </div>
          <span className="material-symbols-outlined text-rose-600">error</span>
        </div>
      </div>
    </div>
  );
}
