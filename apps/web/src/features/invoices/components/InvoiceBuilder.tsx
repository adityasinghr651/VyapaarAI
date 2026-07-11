'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CustomerDto, ProductDto, InvoiceDto, InvoiceStatus } from '@vyapaarai/shared-types';
import { Plus, Eye, Receipt, Trash2, Calendar, FileText, User, IndianRupee } from 'lucide-react';
import api from '../../../lib/api-client';
import { DataTable, ColumnDef } from '../../../components/ui/DataTable';
import { ModalDrawer } from '../../../components/ui/ModalDrawer';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { useToast } from '../../../components/ui/Toast';
import { InvoiceForm, InvoiceFormData } from './InvoiceForm';

interface ExtendedInvoiceItemDto {
  id?: string;
  productId?: string;
  productName?: string;
  quantity: number;
  price: string;
  gstRate: string;
  gstAmount: string;
  total: string;
  product?: {
    name: string;
  };
}

interface ExtendedInvoiceDto extends Omit<InvoiceDto, 'items'> {
  customer?: {
    name: string;
    email?: string | null;
    gstin?: string | null;
  };
  items: ExtendedInvoiceItemDto[];
}

interface InvoicesApiResponse {
  message?: string;
  data?: ExtendedInvoiceDto[];
}

interface SingleInvoiceApiResponse {
  message?: string;
  data?: ExtendedInvoiceDto;
}

interface CustomersApiResponse {
  message?: string;
  data?: CustomerDto[];
}

interface ProductsApiResponse {
  message?: string;
  data?: ProductDto[];
}

export function InvoiceBuilder() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<ExtendedInvoiceDto | null>(null);

  // Queries
  const { data: invoicesRes, isLoading: loadingInvs } = useQuery<InvoicesApiResponse | ExtendedInvoiceDto[]>({
    queryKey: ['invoices'],
    queryFn: () => api.get('/invoices'),
  });

  const { data: customersRes } = useQuery<CustomersApiResponse | CustomerDto[]>({
    queryKey: ['customers'],
    queryFn: () => api.get('/customers'),
  });

  const { data: productsRes } = useQuery<ProductsApiResponse | ProductDto[]>({
    queryKey: ['products'],
    queryFn: () => api.get('/products'),
  });

  const invoices: ExtendedInvoiceDto[] = Array.isArray(invoicesRes)
    ? invoicesRes
    : (invoicesRes as InvoicesApiResponse)?.data || [];

  const customers: CustomerDto[] = Array.isArray(customersRes)
    ? customersRes
    : (customersRes as CustomersApiResponse)?.data || [];

  const products: ProductDto[] = Array.isArray(productsRes)
    ? productsRes
    : (productsRes as ProductsApiResponse)?.data || [];

  // Mutations
  const createMutation = useMutation<SingleInvoiceApiResponse | ExtendedInvoiceDto, Error, InvoiceFormData>({
    mutationFn: (newInvoice) => api.post('/invoices', newInvoice),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setIsFormOpen(false);
      const createdNumber = (res as SingleInvoiceApiResponse)?.data?.invoiceNumber || 'New Invoice';
      success('Invoice Issued', `Invoice ${createdNumber} has been successfully generated and saved to your records.`);
    },
    onError: (err: Error) => {
      error('Creation Failed', err.message || 'Failed to generate and save invoice');
    },
  });

  const updateStatusMutation = useMutation<SingleInvoiceApiResponse | ExtendedInvoiceDto, Error, { id: string; status: InvoiceStatus }>({
    mutationFn: ({ id, status }) => api.patch(`/invoices/${id}/status`, { status }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      if (selectedInvoice) {
        setSelectedInvoice(null);
      }
      const updatedNum = (res as SingleInvoiceApiResponse)?.data?.invoiceNumber || 'Invoice';
      success('Status Updated', `${updatedNum} lifecycle status has been successfully updated.`);
    },
    onError: (err: Error) => {
      error('Update Failed', err.message || 'Failed to update invoice lifecycle status');
    },
  });

  const deleteMutation = useMutation<SingleInvoiceApiResponse | ExtendedInvoiceDto, Error, string>({
    mutationFn: (id: string) => api.delete(`/invoices/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      if (selectedInvoice) {
        setSelectedInvoice(null);
      }
      success('Invoice Removed', 'Invoice record has been permanently deleted from your billing history.');
    },
    onError: (err: Error) => {
      error('Deletion Failed', err.message || 'Failed to delete invoice record');
    },
  });

  const handleCreateInvoice = async (formData: InvoiceFormData) => {
    await createMutation.mutateAsync(formData);
  };

  const handleDeleteInvoice = (inv: ExtendedInvoiceDto) => {
    if (window.confirm(`Are you sure you want to delete invoice #${inv.invoiceNumber}? This action cannot be undone.`)) {
      deleteMutation.mutate(inv.id);
    }
  };

  const handleStatusChange = (invId: string, newStatusString: string) => {
    const statusEnum = Object.values(InvoiceStatus).find((s) => s === newStatusString) || InvoiceStatus.DRAFT;
    updateStatusMutation.mutate({ id: invId, status: statusEnum });
  };

  const columns: ColumnDef<ExtendedInvoiceDto>[] = [
    {
      header: 'Invoice #',
      accessorKey: 'invoiceNumber',
      cell: (inv) => (
        <div className="flex items-center space-x-2">
          <FileText size={16} className="text-primary shrink-0" />
          <span className="font-mono font-bold text-white tracking-wide">{inv.invoiceNumber}</span>
        </div>
      ),
    },
    {
      header: 'Customer',
      accessorKey: 'customerName',
      cell: (inv) => {
        const custName = inv.customer?.name || inv.customerName || 'Unknown Customer';
        return (
          <div className="flex items-center space-x-2">
            <User size={14} className="text-slate-500 shrink-0" />
            <span className="font-semibold text-white">{custName}</span>
          </div>
        );
      },
    },
    {
      header: 'Dates',
      accessorKey: 'issueDate',
      cell: (inv) => (
        <div className="space-y-1 text-xs text-slate-400">
          <div className="flex items-center">
            <Calendar size={12} className="mr-1.5 text-slate-500 shrink-0" />
            <span>Issued: {new Date(inv.issueDate).toLocaleDateString()}</span>
          </div>
          {inv.dueDate && (
            <div className="flex items-center text-slate-500">
              <Calendar size={12} className="mr-1.5 shrink-0" />
              <span>Due: {new Date(inv.dueDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Total Amount',
      accessorKey: 'total',
      className: 'text-right',
      cell: (inv) => (
        <div className="font-mono font-extrabold text-white text-right text-sm">
          ₹{parseFloat(inv.total).toFixed(2)}
        </div>
      ),
    },
    {
      header: 'Lifecycle Status',
      accessorKey: 'status',
      cell: (inv) => (
        <div className="flex items-center space-x-2">
          <StatusBadge status={inv.status} size="sm" showIndicator />
          <select
            value={inv.status}
            onChange={(e) => handleStatusChange(inv.id, e.target.value)}
            disabled={updateStatusMutation.isPending}
            aria-label={`Change status for invoice ${inv.invoiceNumber}`}
            className="bg-slate-900 text-slate-300 border border-slate-800 rounded px-2 py-1 text-xs font-semibold focus:outline-none focus:border-primary disabled:opacity-50 cursor-pointer"
          >
            {Object.values(InvoiceStatus).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (inv) => (
        <div className="flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={() => setSelectedInvoice(inv)}
            aria-label={`View summary for ${inv.invoiceNumber}`}
            className="rounded-lg p-2 text-primary transition-colors hover:bg-slate-900 hover:text-indigo-400 active:scale-95"
          >
            <Eye size={16} />
          </button>
          <button
            type="button"
            onClick={() => handleDeleteInvoice(inv)}
            disabled={deleteMutation.isPending}
            aria-label={`Delete ${inv.invoiceNumber}`}
            className="rounded-lg p-2 text-rose-400 transition-colors hover:bg-rose-950/40 hover:text-rose-300 active:scale-95 disabled:opacity-50"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Receipt className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Invoices</h1>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Issue, manage, and audit GST-compliant invoices and customer payment lifecycle records.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSelectedInvoice(null);
            setIsFormOpen(true);
          }}
          className="flex items-center justify-center space-x-2 bg-primary hover:bg-violet-600 active:scale-95 transition-all text-white font-semibold py-2.5 px-5 rounded-xl text-sm shadow-md shrink-0"
        >
          <Plus size={16} />
          <span>Create Invoice</span>
        </button>
      </div>

      {/* Invoices Data Table Component */}
      <DataTable<ExtendedInvoiceDto>
        columns={columns}
        data={invoices}
        isLoading={loadingInvs}
        keyExtractor={(item) => item.id}
        emptyState={{
          title: 'No Invoices Generated',
          description:
            'Your billing history currently contains no invoices. Click the button below to issue your first GST-compliant commercial invoice.',
          action: (
            <button
              type="button"
              onClick={() => {
                setSelectedInvoice(null);
                setIsFormOpen(true);
              }}
              className="mt-2 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow transition-all hover:bg-violet-600 active:scale-95"
            >
              <Plus size={14} />
              <span>Create First Invoice</span>
            </button>
          ),
        }}
      />

      {/* Create Invoice Modal Drawer Component */}
      <ModalDrawer
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Create & Issue Invoice"
        description="Select a customer and add product line items. Subtotals, GST slabs, and grand totals are validated on the server."
        maxWidth="max-w-4xl"
        position="modal"
      >
        <div className="pt-2">
          <InvoiceForm
            customers={customers}
            products={products}
            onSubmit={handleCreateInvoice}
            onCancel={() => setIsFormOpen(false)}
            isLoading={createMutation.isPending}
          />
        </div>
      </ModalDrawer>

      {/* Invoice Details Summary Modal Drawer Component */}
      <ModalDrawer
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        title={selectedInvoice ? `Invoice Summary (#${selectedInvoice.invoiceNumber})` : 'Invoice Summary'}
        description="Detailed breakdown of customer details, line items, and audit totals."
        maxWidth="max-w-2xl"
        position="modal"
      >
        {selectedInvoice && (
          <div className="space-y-6 pt-2">
            {/* Customer & Status Header */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl bg-slate-950/40 p-4 border border-slate-900">
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
                  Billed To
                </p>
                <p className="font-semibold text-white text-base">
                  {selectedInvoice.customer?.name || selectedInvoice.customerName || 'Customer'}
                </p>
                {selectedInvoice.customer?.email && (
                  <p className="text-xs text-slate-400 mt-0.5">{selectedInvoice.customer.email}</p>
                )}
                {selectedInvoice.customer?.gstin && (
                  <p className="font-mono text-xs text-emerald-400 mt-1">
                    GSTIN: {selectedInvoice.customer.gstin}
                  </p>
                )}
              </div>
              <div className="sm:text-right flex flex-col sm:items-end justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
                    Dates & Status
                  </p>
                  <p className="text-xs text-slate-300">
                    Issued: {new Date(selectedInvoice.issueDate).toLocaleDateString()}
                  </p>
                  {selectedInvoice.dueDate && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      Due: {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="mt-2">
                  <StatusBadge status={selectedInvoice.status} size="md" showIndicator />
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Billed Line Items ({selectedInvoice.items?.length || 0})
              </h4>
              <div className="divide-y divide-slate-900 border border-slate-900 rounded-xl overflow-hidden bg-slate-950/20">
                {selectedInvoice.items?.map((item, idx) => {
                  const itemName = item.productName || item.product?.name || `Product #${item.productId}`;
                  return (
                    <div key={idx} className="p-3.5 flex justify-between items-center text-sm">
                      <div>
                        <div className="font-semibold text-white">{itemName}</div>
                        <div className="text-slate-500 text-xs mt-0.5">
                          Quantity: {item.quantity} × ₹{parseFloat(item.price).toFixed(2)}
                        </div>
                      </div>
                      <div className="font-mono text-right">
                        <div className="font-bold text-slate-200">
                          ₹{parseFloat(item.total).toFixed(2)}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          incl. {parseFloat(item.gstRate).toFixed(0)}% GST (₹{parseFloat(item.gstAmount).toFixed(2)})
                        </div>
                      </div>
                    </div>
                  );
                })}
                {(!selectedInvoice.items || selectedInvoice.items.length === 0) && (
                  <div className="p-4 text-center text-xs text-slate-500 italic">
                    No line item details available for this invoice record.
                  </div>
                )}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="flex flex-col items-end space-y-2 text-sm rounded-xl bg-slate-950/60 p-4 border border-slate-900">
              <div className="flex justify-between w-full sm:w-72 text-slate-400">
                <span>Subtotal (Excl. GST):</span>
                <span className="font-mono text-slate-300">₹{parseFloat(selectedInvoice.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-full sm:w-72 text-slate-400">
                <span>Total GST Amount:</span>
                <span className="font-mono text-slate-300">₹{parseFloat(selectedInvoice.gstAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-full sm:w-72 text-white font-extrabold text-base border-t border-slate-900 pt-3 mt-1">
                <span className="flex items-center gap-1">
                  <IndianRupee size={16} className="text-primary" /> Grand Total:
                </span>
                <span className="font-mono text-primary text-lg">
                  ₹{parseFloat(selectedInvoice.total).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </ModalDrawer>
    </div>
  );
}
