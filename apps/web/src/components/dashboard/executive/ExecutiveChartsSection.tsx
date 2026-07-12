'use client';

import React from 'react';

export function ExecutiveChartsSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Sales Trend Chart */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 h-72 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-label-md text-label-md text-on-surface-variant uppercase">Sales Trends</h3>
          <select className="bg-surface text-on-surface text-[12px] border-none focus:ring-0 p-0 cursor-pointer">
            <option>Last 6 Months</option>
          </select>
        </div>
        <div className="flex-1 bg-surface-container-low/30 rounded border border-dashed border-outline-variant flex items-center justify-center text-outline text-[12px]">
          [Area Chart Visualization]
        </div>
      </div>

      {/* Revenue vs Expenses */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 h-72 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-label-md text-label-md text-on-surface-variant uppercase">Revenue vs Expenses</h3>
          <span className="material-symbols-outlined text-outline-variant text-[18px]">more_vert</span>
        </div>
        <div className="flex-1 bg-surface-container-low/30 rounded border border-dashed border-outline-variant flex items-center justify-center text-outline text-[12px]">
          [Grouped Bar Chart Visualization]
        </div>
      </div>
    </div>
  );
}
