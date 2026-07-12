'use client';

import React from 'react';

export function ExecutiveAiInsights() {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 sticky top-6">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-outline-variant">
        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
          smart_toy
        </span>
        <h3 className="font-label-md text-label-md text-on-surface-variant uppercase font-bold text-primary">AI Insights</h3>
      </div>
      <div className="space-y-4">
        <div className="p-3 bg-surface-container-low rounded border border-outline-variant/50 flex gap-3 items-start">
          <span className="material-symbols-outlined text-amber-600 text-[20px] mt-0.5">trending_up</span>
          <p className="font-body-md text-body-md text-on-surface text-sm">
            GST liability increased 12% this month due to higher interstate sales.
          </p>
        </div>
        <div className="p-3 bg-rose-50/50 rounded border border-rose-100 flex gap-3 items-start">
          <span className="material-symbols-outlined text-rose-600 text-[20px] mt-0.5">warning</span>
          <p className="font-body-md text-body-md text-on-surface text-sm">
            3 invoices are overdue. Would you like to send automated WhatsApp reminders?
          </p>
        </div>
        <div className="p-3 bg-surface-container-low rounded border border-outline-variant/50 flex gap-3 items-start">
          <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">inventory</span>
          <p className="font-body-md text-body-md text-on-surface text-sm">
            Stock of &apos;Product X&apos; is low (approx. 7 days remaining based on current run rate).
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          // Trigger insight refresh
        }}
        className="w-full mt-6 py-2 border border-outline-variant rounded text-on-surface font-label-md text-label-md hover:bg-surface-container-low transition-colors flex justify-center items-center gap-2 cursor-pointer"
      >
        <span className="material-symbols-outlined text-[16px]">refresh</span> Refresh Insights
      </button>
    </div>
  );
}
