'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { InvoiceDto } from '@vyapaarai/shared-types';
import { DollarSign, FileText, Users, ShoppingBag, Loader2, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import api from '../../../lib/api-client';
import { GlassCard } from '../../../components/ui/GlassCard';
import { DataTable, ColumnDef } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/ui/StatusBadge';

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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalRevenue = parseFloat(summary?.revenue || '0');
  const totalInvoices = summary?.invoiceCounts?.total || 0;
  const pendingInvoices = summary?.invoiceCounts?.unpaid || 0;
  const customerCount = summary?.customerCount || 0;
  const productCount = summary?.productCount || 0;

  const columns: ColumnDef<ExtendedRecentInvoiceDto>[] = [
    {
      header: 'Invoice #',
      accessorKey: 'invoiceNumber',
      cell: (inv) => (
        <span className="font-mono font-bold text-white tracking-wide">{inv.invoiceNumber}</span>
      ),
    },
    {
      header: 'Customer',
      accessorKey: 'customerName',
      cell: (inv) => {
        const custName = inv.customer?.name || inv.customerName || 'Unknown Customer';
        return <span className="font-semibold text-white">{custName}</span>;
      },
    },
    {
      header: 'Amount',
      accessorKey: 'total',
      className: 'text-right',
      cell: (inv) => (
        <span className="font-mono font-bold text-white text-right text-sm">
          ₹{parseFloat(inv.total).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (inv) => <StatusBadge status={inv.status} size="sm" showIndicator />,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Welcome to your VyapaarAI real-time business and compliance snapshot.
          </p>
        </div>
        <Link
          href="/invoices"
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white shadow-md transition-all hover:bg-violet-600 active:scale-95 w-fit"
        >
          <span>Issue New Invoice</span>
          <ArrowUpRight size={14} />
        </Link>
      </div>

      {/* Analytics Grid composing GlassCard */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <GlassCard hoverEffect className="relative overflow-hidden">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white mt-1">
            ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Paid commercial invoices only</p>
        </GlassCard>

        {/* Invoice Count */}
        <GlassCard hoverEffect className="relative overflow-hidden">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Invoices
            </span>
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
              <FileText size={18} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white mt-1">{totalInvoices}</div>
          <p className="text-[11px] text-slate-500 mt-1">
            <span className="text-amber-400 font-semibold">{pendingInvoices}</span> draft or unpaid invoices
          </p>
        </GlassCard>

        {/* Customers Count */}
        <GlassCard hoverEffect className="relative overflow-hidden">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Customers
            </span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
              <Users size={18} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white mt-1">{customerCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Registered SMB billing contacts</p>
        </GlassCard>

        {/* Products Count */}
        <GlassCard hoverEffect className="relative overflow-hidden">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Inventory Items
            </span>
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white mt-1">{productCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Catalog items tracked</p>
        </GlassCard>
      </div>

      {/* Recent Activity Section composing DataTable and StatusBadge */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white tracking-tight">Recent Invoices</h3>
          <Link
            href="/invoices"
            className="text-xs font-semibold text-primary hover:text-indigo-400 transition-colors"
          >
            View All →
          </Link>
        </div>

        <DataTable<ExtendedRecentInvoiceDto>
          columns={columns}
          data={recentInvoices}
          isLoading={isRecentLoading}
          keyExtractor={(item) => item.id}
          emptyState={{
            title: 'No Recent Invoices',
            description:
              'Your business snapshot currently has no recently generated invoices. Click below to issue your first commercial invoice.',
            action: (
              <Link
                href="/invoices"
                className="mt-2 flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow transition-all hover:bg-violet-600 active:scale-95"
              >
                <span>Issue First Invoice</span>
              </Link>
            ),
          }}
        />
      </div>
    </div>
  );
}
