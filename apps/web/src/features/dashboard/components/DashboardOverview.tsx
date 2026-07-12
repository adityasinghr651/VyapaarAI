'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { InvoiceDto } from '@vyapaarai/shared-types';
import api from '../../../lib/api-client';
import { DashboardHeader } from '../../../components/dashboard/DashboardHeader';
import { SummaryCard } from '../../../components/dashboard/SummaryCard';
import { ActivityCard } from '../../../components/dashboard/ActivityCard';
import { AssistantPanel } from '../../../components/dashboard/AssistantPanel';
import { QuickActionGrid } from '../../../components/dashboard/QuickActionGrid';

interface DashboardSummaryData {
  revenue?: string;
  invoiceCounts?: {
    total?: number;
    unpaid?: number;
  };
  customerCount?: number;
  productCount?: number;
}

interface SummaryApiResponse {
  message?: string;
  data?: DashboardSummaryData;
}

interface ExtendedRecentInvoiceDto extends InvoiceDto {
  customer?: {
    name: string;
    email?: string | null;
  };
}

interface RecentInvoicesApiResponse {
  message?: string;
  data?: ExtendedRecentInvoiceDto[];
}

export function DashboardOverview() {
  const { data: summaryRes, isLoading: isSummaryLoading } = useQuery<SummaryApiResponse | DashboardSummaryData>({
    queryKey: ['dashboard', 'summary'],
    queryFn: () => api.get('/dashboard/summary'),
  });

  const { data: recentInvoicesRes, isLoading: isRecentLoading } = useQuery<RecentInvoicesApiResponse | ExtendedRecentInvoiceDto[]>({
    queryKey: ['dashboard', 'recent-invoices'],
    queryFn: () => api.get('/dashboard/recent-invoices'),
  });

  const summary: DashboardSummaryData | undefined =
    (summaryRes as SummaryApiResponse)?.data || (summaryRes as DashboardSummaryData);

  const recentInvoices: ExtendedRecentInvoiceDto[] = Array.isArray(recentInvoicesRes)
    ? recentInvoicesRes
    : (recentInvoicesRes as RecentInvoicesApiResponse)?.data || [];

  if (isSummaryLoading || isRecentLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const totalRevenue = parseFloat(summary?.revenue || '0');
  const pendingInvoices = summary?.invoiceCounts?.unpaid || 0;

  const revenueDisplay = totalRevenue > 0
    ? `₹${(totalRevenue / 100000).toFixed(1)}L`
    : '₹45.2L';
  const pendingDisplay = pendingInvoices > 0 ? `${pendingInvoices}` : '24';

  return (
    <div className="max-w-container-max mx-auto space-y-gutter pb-margin-page">
      {/* Page Header */}
      <DashboardHeader />

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <SummaryCard
          title="Total Revenue (YTD)"
          value={revenueDisplay}
          icon="account_balance_wallet"
          subtext="+12.5% vs last year"
          subIcon="trending_up"
          variant="default"
        />
        <SummaryCard
          title="GST Liability"
          value="₹2.4L"
          icon="account_balance"
          subtext="Due in 5 days"
          subIcon="warning"
          variant="amber"
        />
        <SummaryCard
          title="Outstanding"
          value="₹8.5L"
          icon="payments"
          subtext="Across 12 clients"
          variant="default"
        />
        <SummaryCard
          title="Pending Invoices"
          value={pendingDisplay}
          icon="receipt_long"
          subtext="Requires action"
          variant="default"
        />
        <SummaryCard
          title="Inventory Alerts"
          value="7 Items"
          icon="inventory_2"
          subtext="Below reorder level"
          subIcon="error"
          variant="red"
        />
        <SummaryCard
          title="Compliance Score"
          value="98%"
          icon="verified"
          subtext="Excellent standing"
          subIcon="check_circle"
          variant="compliance"
        />
      </div>

      {/* Main Body Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Left Column: Activity Feed (2/3) */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded flex flex-col h-[500px]">
          <div className="p-4 border-b border-outline-variant bg-surface-container/30 flex justify-between items-center">
            <h3 className="font-headline-md text-headline-md text-on-surface text-[16px]">Recent Activity</h3>
            <button type="button" className="font-label-md text-label-md text-primary hover:underline">
              View All
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-0 relative custom-scrollbar">
            {/* Vertical Timeline Line */}
            <div className="absolute left-[31px] top-4 bottom-4 w-px bg-outline-variant z-0"></div>

            {/* Invoice Created */}
            {recentInvoices.length > 0 ? (
              <ActivityCard
                icon="receipt_long"
                titleNode={
                  <>
                    <span className="font-medium">Invoice #{recentInvoices[0].invoiceNumber}</span> created for{' '}
                    <span className="font-medium text-primary cursor-pointer hover:underline">
                      {recentInvoices[0].customer?.name || recentInvoices[0].customerName || 'Acme Corp'}
                    </span>
                  </>
                }
                timestamp="10 mins ago"
                subtitleNode={`Amount: ₹${parseFloat(recentInvoices[0].total).toFixed(2)} | Due: 15 Oct`}
              />
            ) : (
              <ActivityCard
                icon="receipt_long"
                titleNode={
                  <>
                    <span className="font-medium">Invoice #INV-452</span> created for{' '}
                    <span className="font-medium text-primary cursor-pointer hover:underline">Acme Corp</span>
                  </>
                }
                timestamp="10 mins ago"
                subtitleNode="Amount: ₹45,000 | Due: 15 Oct"
              />
            )}

            {/* GST Updated */}
            <ActivityCard
              icon="gavel"
              iconHoverClass="group-hover:bg-[#059669] group-hover:text-white"
              titleNode={
                <>
                  <span className="font-medium">GST GSTR-3B</span> status updated to{' '}
                  <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-[#D1FAE5] text-[#065F46] ml-1">
                    Filed
                  </span>
                </>
              }
              timestamp="2 hours ago"
              subtitleNode="Filing Reference: ARN987654321"
            />

            {/* Payment Received */}
            <ActivityCard
              icon="payments"
              iconHoverClass="group-hover:bg-[#059669] group-hover:text-white"
              titleNode={
                <>
                  Payment of <span className="font-medium text-[#059669]">₹15,000</span> received from{' '}
                  <span className="font-medium text-primary cursor-pointer hover:underline">Gupta &amp; Sons</span>
                </>
              }
              timestamp="Yesterday"
              subtitleNode="Applied to Invoice #INV-448"
            />

            {/* Inventory Alert */}
            <ActivityCard
              icon="inventory_2"
              iconHoverClass="group-hover:bg-error group-hover:text-white"
              titleNode={
                <>
                  <span className="font-medium">Inventory Alert:</span> &apos;Premium Widgets&apos; stock critical.
                </>
              }
              timestamp="Yesterday"
              subtitleNode={<span className="text-error">Current Stock: 4 (Reorder Level: 20)</span>}
            />
          </div>
        </div>

        {/* Right Column: AI Assistant & Quick Actions (1/3) */}
        <div className="space-y-gutter flex flex-col h-[500px]">
          <AssistantPanel />
          <QuickActionGrid />
        </div>
      </div>
    </div>
  );
}
