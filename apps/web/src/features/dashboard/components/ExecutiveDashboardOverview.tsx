'use client';

import React from 'react';
import { ExecutiveHeader } from '../../../components/dashboard/executive/ExecutiveHeader';
import { ExecutiveSummaryGrid } from '../../../components/dashboard/executive/ExecutiveSummaryGrid';
import { ExecutiveChartsSection } from '../../../components/dashboard/executive/ExecutiveChartsSection';
import { ExecutiveGstCompliance } from '../../../components/dashboard/executive/ExecutiveGstCompliance';
import { ExecutivePaymentsTable } from '../../../components/dashboard/executive/ExecutivePaymentsTable';
import { ExecutiveAiInsights } from '../../../components/dashboard/executive/ExecutiveAiInsights';

export function ExecutiveDashboardOverview() {
  return (
    <div className="max-w-container-max mx-auto space-y-gutter pb-margin-page animate-in fade-in duration-300">
      {/* Executive Overview Header */}
      <ExecutiveHeader />

      {/* Row 1: KPI Summary Cards */}
      <ExecutiveSummaryGrid />

      {/* Main Split: Left Column (3/4) & Right AI Insights Panel (1/4) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-gutter">
        {/* Main Left Column (Charts, Compliance & Tables) */}
        <div className="lg:col-span-3 space-y-gutter">
          {/* Row 2: Charts */}
          <ExecutiveChartsSection />

          {/* Row 3: GST Compliance Panel */}
          <ExecutiveGstCompliance />

          {/* Row 4: Outstanding Payments Table */}
          <ExecutivePaymentsTable />
        </div>

        {/* Right Sidebar: AI Insights Panel */}
        <div className="lg:col-span-1">
          <ExecutiveAiInsights />
        </div>
      </div>
    </div>
  );
}
