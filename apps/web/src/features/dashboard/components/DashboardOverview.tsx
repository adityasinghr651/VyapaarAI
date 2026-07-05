'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/api-client';
import { DollarSign, FileText, Users, ShoppingBag, Loader2 } from 'lucide-react';

export function DashboardOverview() {
  const { data: summaryRes, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: () => api.get('/dashboard/summary'),
  });

  const { data: recentInvoicesRes, isLoading: isRecentLoading } = useQuery({
    queryKey: ['dashboard', 'recent-invoices'],
    queryFn: () => api.get('/dashboard/recent-invoices'),
  });

  const summary = (summaryRes as any)?.data;
  const recentInvoices = (recentInvoicesRes as any)?.data || [];

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Welcome to your VyapaarAI business snapshot.</p>
      </div>

      {/* Analytics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <div className="glass-panel p-6 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Revenue</span>
            <DollarSign size={20} className="text-primary" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Paid invoices only</p>
        </div>

        {/* Invoice Count */}
        <div className="glass-panel p-6 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Invoices</span>
            <FileText size={20} className="text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{totalInvoices}</div>
          <p className="text-[10px] text-slate-500 mt-1">{pendingInvoices} draft or unpaid invoices</p>
        </div>

        {/* Customers Count */}
        <div className="glass-panel p-6 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Customers</span>
            <Users size={20} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{customerCount}</div>
          <p className="text-[10px] text-slate-500 mt-1">Registered SMB contacts</p>
        </div>

        {/* Products Count */}
        <div className="glass-panel p-6 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Inventory Items</span>
            <ShoppingBag size={20} className="text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{productCount}</div>
          <p className="text-[10px] text-slate-500 mt-1">Catalog items tracked</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-panel p-6 rounded-xl">
        <h3 className="text-lg font-bold text-white mb-4">Recent Invoices</h3>
        {recentInvoices.length === 0 ? (
          <p className="text-sm text-slate-500">No invoices generated yet.</p>
        ) : (
          <div className="divide-y divide-slate-900">
            {recentInvoices.map((inv: any) => (
              <div key={inv.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{inv.invoiceNumber}</p>
                  <p className="text-xs text-slate-500">{inv.customer?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">₹{parseFloat(inv.total).toFixed(2)}</p>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    inv.status === 'PAID' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/60' : 'bg-amber-950/40 text-amber-400 border border-amber-900/60'
                  }`}>
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
