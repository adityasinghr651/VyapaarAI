'use client';

import React from 'react';
import { ExecutiveSummaryCard } from './ExecutiveSummaryCard';

export function ExecutiveSummaryGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <ExecutiveSummaryCard
        title="Monthly Sales"
        value="₹14,50,000"
        badgeText="12%"
        badgeIcon="arrow_upward"
        badgeVariant="emerald"
      />
      <ExecutiveSummaryCard
        title="Purchases"
        value="₹8,20,000"
        badgeText="4%"
        badgeIcon="arrow_downward"
        badgeVariant="rose"
      />
      <ExecutiveSummaryCard
        title="Net Profit"
        value="₹6,30,000"
        badgeText="8%"
        badgeIcon="arrow_upward"
        badgeVariant="emerald"
      />
      <ExecutiveSummaryCard
        title="GST Liability"
        value="₹1,13,400"
        badgeIcon="info"
        badgeVariant="info"
      />
      <ExecutiveSummaryCard
        title="ITC Available"
        value="₹42,500"
        badgeIcon="info"
        badgeVariant="info"
      />
      <ExecutiveSummaryCard
        title="Cash Flow"
        value="₹2,45,000"
        badgeText="2%"
        badgeIcon="arrow_upward"
        badgeVariant="emerald"
      />
    </div>
  );
}
