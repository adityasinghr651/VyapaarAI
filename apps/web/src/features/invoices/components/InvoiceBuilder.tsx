'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/api-client';
import { Plus, Eye, Receipt, Trash2, Calendar } from 'lucide-react';

export function InvoiceBuilder() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  // Form state
  const [customerId, setCustomerId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState<{ productId: string; quantity: number }[]>([
    { productId: '', quantity: 1 },
  ]);
  const [formError, setFormError] = useState<string | null>(null);

  // Queries
  const { data: invoicesRes, isLoading: loadingInvs } = useQuery({
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

  // Mutations
  const createMutation = useMutation({
    mutationFn: (newInvoice: any) => api.post('/invoices', newInvoice),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setShowAddForm(false);
      setCustomerId('');
      setDueDate('');
      setItems([{ productId: '', quantity: 1 }]);
      setFormError(null);
    },
    onError: (err: any) => {
      setFormError(err.message || 'Failed to create invoice');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/invoices/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      if (selectedInvoice) {
        // Refresh details modal
        setSelectedInvoice(null);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/invoices/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });

  // Calculations for UI estimation only
  const calculatedTotals = () => {
    let subtotal = 0;
    let gstAmount = 0;
    let total = 0;

    items.forEach((item) => {
      const prod = products.find((p: any) => p.id === item.productId);
      if (prod) {
        const itemSub = parseFloat(prod.price) * item.quantity;
        const itemGst = itemSub * (parseFloat(prod.gstRate) / 100);
        subtotal += itemSub;
        gstAmount += itemGst;
        total += itemSub + itemGst;
      }
    });

    return { subtotal, gstAmount, total };
  };

  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleItemChange = (index: number, key: string, value: any) => {
    const newItems = [...items] as any;
    newItems[index][key] = value;
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      setFormError('Please select a customer');
      return;
    }
    const filteredItems = items.filter((it) => it.productId !== '');
    if (filteredItems.length === 0) {
      setFormError('Please add at least one product line item');
      return;
    }
    createMutation.mutate({
      customerId,
      dueDate: dueDate || undefined,
      items: filteredItems,
    });
  };

  const { subtotal, gstAmount, total } = calculatedTotals();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Invoices</h1>
          <p className="text-muted-foreground text-sm">Issue and compile compliance invoices.</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setSelectedInvoice(null);
          }}
          className="flex items-center space-x-2 bg-primary hover:bg-violet-600 active:scale-95 transition-all text-white font-semibold py-2 px-4 rounded-lg text-sm"
        >
          <Plus size={16} />
          <span>{showAddForm ? 'Cancel' : 'Create Invoice'}</span>
        </button>
      </div>

      {showAddForm && (
        <div className="glass-panel p-6 rounded-xl animate-in fade-in slide-in-from-top-4 duration-200">
          <h3 className="text-lg font-bold text-white mb-4">Invoice Details</h3>
          <p className="text-xs text-indigo-400 mb-4 font-semibold uppercase tracking-wider">
            ⚡ Recalculated and validated on the backend.
          </p>
          {formError && (
            <div className="mb-4 p-3 bg-red-950/40 border border-red-900/60 rounded text-red-400 text-xs">
              {formError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Customer Name *
                </label>
                <select
                  required
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="glass-input w-full p-2.5 rounded-lg text-sm text-white focus:outline-none bg-slate-900"
                >
                  <option value="">-- Select Customer --</option>
                  {customers.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.gstin ? `(${c.gstin})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Payment Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="glass-input w-full p-2.5 rounded-lg text-sm text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Line Items
              </label>
              {items.map((item, idx) => {
                const prod = products.find((p: any) => p.id === item.productId);
                return (
                  <div key={idx} className="flex gap-4 items-end flex-wrap sm:flex-nowrap border-b border-slate-900 pb-4 sm:border-0 sm:pb-0">
                    <div className="flex-1 min-w-[200px]">
                      <select
                        required
                        value={item.productId}
                        onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                        className="glass-input w-full p-2.5 rounded-lg text-sm text-white focus:outline-none bg-slate-900"
                      >
                        <option value="">-- Select Product --</option>
                        {products.map((p: any) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (₹{parseFloat(p.price).toFixed(2)})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-24">
                      <input
                        type="number"
                        min="1"
                        required
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                        className="glass-input w-full p-2.5 rounded-lg text-sm text-white focus:outline-none text-center"
                      />
                    </div>
                    {prod && (
                      <div className="w-32 py-2 text-right font-mono text-xs text-slate-400">
                        ₹{parseFloat(prod.price) * item.quantity} + GST
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      disabled={items.length === 1}
                      className="text-red-400 hover:text-red-300 p-2.5 rounded-lg disabled:opacity-30 shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs text-primary font-bold hover:underline"
              >
                + Add Another Line Item
              </button>
            </div>

            {/* Calculations Summary */}
            <div className="border-t border-slate-900 pt-4 flex flex-col items-end space-y-2 text-sm">
              <div className="flex justify-between w-64 text-slate-400">
                <span>Subtotal estimate:</span>
                <span className="font-mono">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-64 text-slate-400">
                <span>GST total estimate:</span>
                <span className="font-mono">₹{gstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-64 text-white font-bold text-base border-t border-slate-900 pt-2">
                <span>Grand Total estimate:</span>
                <span className="font-mono">₹{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-900">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="py-2.5 px-6 bg-primary hover:bg-violet-600 active:scale-95 transition-all text-white font-semibold rounded-lg text-sm"
              >
                {createMutation.isPending ? 'Generating...' : 'Save & Issue Invoice'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Invoice List */}
      <div className="glass-panel rounded-xl overflow-hidden">
        {loadingInvs ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading invoices...</div>
        ) : invoices.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">No invoices generated yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-900 bg-slate-950/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">Invoice #</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Dates</th>
                  <th className="p-4 text-right">Total Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 text-sm">
                {invoices.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-slate-900/20 transition-all">
                    <td className="p-4 font-mono font-semibold text-white">{inv.invoiceNumber}</td>
                    <td className="p-4">
                      <div className="font-semibold text-white">{inv.customer?.name}</div>
                    </td>
                    <td className="p-4 space-y-1 text-xs text-slate-400">
                      <div className="flex items-center">
                        <Calendar size={12} className="mr-1 text-slate-500" />
                        <span>Issued: {new Date(inv.issueDate).toLocaleDateString()}</span>
                      </div>
                      {inv.dueDate && (
                        <div className="flex items-center text-slate-500">
                          <Calendar size={12} className="mr-1" />
                          <span>Due: {new Date(inv.dueDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-mono font-semibold text-white text-right">
                      ₹{parseFloat(inv.total).toFixed(2)}
                    </td>
                    <td className="p-4">
                      <select
                        value={inv.status}
                        onChange={(e) =>
                          updateStatusMutation.mutate({ id: inv.id, status: e.target.value })
                        }
                        className={`text-xs px-2 py-1 rounded font-bold uppercase cursor-pointer border ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/60'
                            : inv.status === 'SENT'
                            ? 'bg-blue-950/40 text-blue-400 border-blue-900/60'
                            : inv.status === 'CANCELLED'
                            ? 'bg-red-950/40 text-red-400 border-red-900/60'
                            : 'bg-amber-950/40 text-amber-400 border-amber-900/60'
                        }`}
                      >
                        <option value="DRAFT">DRAFT</option>
                        <option value="SENT">SENT</option>
                        <option value="PAID">PAID</option>
                        <option value="OVERDUE">OVERDUE</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="text-primary hover:text-indigo-400 p-2 rounded-lg hover:bg-slate-900 transition-all"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete invoice ${inv.invoiceNumber}?`)) {
                            deleteMutation.mutate(inv.id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                        className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-950/20 transition-all disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="glass-panel max-w-2xl w-full p-6 rounded-xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Receipt className="text-primary" /> Invoice Summary
                </h3>
                <span className="font-mono text-sm text-slate-400 mt-1 block">
                  {selectedInvoice.invoiceNumber}
                </span>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b border-slate-900 pb-4 text-sm text-slate-300">
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
                  Billed To
                </p>
                <p className="font-semibold text-white">{selectedInvoice.customer?.name}</p>
                <p className="text-xs text-slate-400">{selectedInvoice.customer?.email}</p>
                <p className="text-xs text-slate-400">{selectedInvoice.customer?.gstin}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
                  Invoice Dates
                </p>
                <p>Issued: {new Date(selectedInvoice.issueDate).toLocaleDateString()}</p>
                {selectedInvoice.dueDate && (
                  <p className="text-slate-400 text-xs">
                    Due: {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Line Items
              </h4>
              <div className="divide-y divide-slate-900 border border-slate-900 rounded-lg overflow-hidden bg-slate-950/20">
                {selectedInvoice.items?.map((item: any, idx: number) => (
                  <div key={idx} className="p-3 flex justify-between items-center text-sm">
                    <div>
                      <span className="font-semibold text-white">{item.product?.name}</span>
                      <span className="text-slate-500 text-xs ml-2">
                        x{item.quantity} @ ₹{parseFloat(item.price).toFixed(2)}
                      </span>
                    </div>
                    <div className="font-mono text-slate-300 text-right">
                      ₹{parseFloat(item.total).toFixed(2)}
                      <span className="text-[10px] text-slate-500 block">
                        incl. {parseFloat(item.gstRate).toFixed(0)}% GST
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5 text-sm border-t border-slate-900 pt-4">
              <div className="flex justify-between w-64 text-slate-400">
                <span>Subtotal:</span>
                <span className="font-mono">₹{parseFloat(selectedInvoice.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-64 text-slate-400">
                <span>GST Tax:</span>
                <span className="font-mono">₹{parseFloat(selectedInvoice.gstAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-64 text-white font-extrabold text-base border-t border-slate-900 pt-2">
                <span>Grand Total:</span>
                <span className="font-mono text-primary">
                  ₹{parseFloat(selectedInvoice.total).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
