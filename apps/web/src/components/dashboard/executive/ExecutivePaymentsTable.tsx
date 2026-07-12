'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export function ExecutivePaymentsTable() {
  const router = useRouter();

  const outstandingRows = [
    {
      customer: 'Acme Corp India',
      invoice: 'INV-2024-089',
      amount: '45,000',
      dueDate: '12 May 2024',
      status: 'Overdue',
      statusClass: 'bg-rose-100 text-rose-800',
    },
    {
      customer: 'TechSolutions Pvt Ltd',
      invoice: 'INV-2024-092',
      amount: '1,12,500',
      dueDate: '18 May 2024',
      status: 'Pending',
      statusClass: 'bg-amber-100 text-amber-800',
    },
    {
      customer: 'Global Logistics',
      invoice: 'INV-2024-095',
      amount: '28,400',
      dueDate: '22 May 2024',
      status: 'Pending',
      statusClass: 'bg-amber-100 text-amber-800',
    },
  ];

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden">
      <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
        <h3 className="font-label-md text-label-md text-on-surface-variant uppercase">Outstanding Payments</h3>
        <button
          type="button"
          onClick={() => router.push('/invoices')}
          className="text-[12px] font-bold text-primary hover:underline cursor-pointer"
        >
          View All
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface border-b border-outline-variant">
              <th className="py-2 px-4 font-label-md text-label-md text-on-surface-variant uppercase font-medium">Customer Name</th>
              <th className="py-2 px-4 font-label-md text-label-md text-on-surface-variant uppercase font-medium">Invoice #</th>
              <th className="py-2 px-4 font-label-md text-label-md text-on-surface-variant uppercase font-medium text-right">Amount (₹)</th>
              <th className="py-2 px-4 font-label-md text-label-md text-on-surface-variant uppercase font-medium">Due Date</th>
              <th className="py-2 px-4 font-label-md text-label-md text-on-surface-variant uppercase font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="font-data-tabular text-data-tabular divide-y divide-outline-variant/50">
            {outstandingRows.map((row, idx) => (
              <tr key={idx} className="hover:bg-surface-container-low transition-colors h-12">
                <td className="py-2 px-4 text-on-surface">{row.customer}</td>
                <td className="py-2 px-4 text-outline">{row.invoice}</td>
                <td className="py-2 px-4 text-on-surface text-right">{row.amount}</td>
                <td className="py-2 px-4 text-outline">{row.dueDate}</td>
                <td className="py-2 px-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${row.statusClass}`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
