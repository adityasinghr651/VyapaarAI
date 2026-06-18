'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/api-client';
import { DollarSign, FileText, Users, ShoppingBag } from 'lucide-react';

export function DashboardOverview() {
  const { data: invoicesRes } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => api.get('/invoices'),
  });

  const { data: customersRes } = useQuery({
    queryKey: ['customers'],
    queryFn: () => api.get('/customers'),
  });

  const { data: productsRes } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.get('/products'),
  });

  const invoices = (invoicesRes as any)?.data || [];
  const customers = (customersRes as any)?.data || [];
  const products = (productsRes as any)?.data || [];

  // Calculate statistics
  const totalRevenue = invoices
    .filter((inv: any) => inv.status === 'PAID')
    .reduce((sum: number, inv: any) => sum + parseFloat(inv.total), 0);

  const pendingInvoices = invoices.filter((inv: any) => inv.status !== 'PAID' && inv.status !== 'CANCELLED').length;

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
          <div className="text-2xl font-bold text-white mt-2">{invoices.length}</div>
          <p className="text-[10px] text-slate-500 mt-1">{pendingInvoices} draft or unpaid invoices</p>
        </div>

        {/* Customers Count */}
        <div className="glass-panel p-6 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Customers</span>
            <Users size={20} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{customers.length}</div>
          <p className="text-[10px] text-slate-500 mt-1">Registered SMB contacts</p>
        </div>

        {/* Products Count */}
        <div className="glass-panel p-6 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Inventory Items</span>
            <ShoppingBag size={20} className="text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{products.length}</div>
          <p className="text-[10px] text-slate-500 mt-1">Catalog items tracked</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-panel p-6 rounded-xl">
        <h3 className="text-lg font-bold text-white mb-4">Recent Invoices</h3>
        {invoices.length === 0 ? (
          <p className="text-sm text-slate-500">No invoices generated yet.</p>
        ) : (
          <div className="divide-y divide-slate-900">
            {invoices.slice(0, 5).map((inv: any) => (
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
