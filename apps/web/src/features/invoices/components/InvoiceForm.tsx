'use client';

import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CustomerDto, ProductDto, InvoiceDto, InvoiceItemDto } from '@vyapaarai/shared-types';
import { Plus, Trash2, Receipt, AlertCircle, Calculator } from 'lucide-react';
import { GlassCard } from '../../../components/ui/GlassCard';
import { InputFormField } from '../../../components/ui/InputFormField';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useToast } from '../../../components/ui/Toast';

export interface InvoiceFormData {
  customerId: string;
  dueDate?: string;
  items: InvoiceItemDto[];
}

export interface InvoiceFormProps {
  customers: CustomerDto[];
  products: ProductDto[];
  initialData?: Partial<InvoiceDto>;
  onSubmit: (data: InvoiceFormData) => Promise<void> | void;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

interface FormLineItem {
  key: string;
  productId: string;
  quantity: number;
  unitPrice?: string;
  gstRate?: string;
}

export function InvoiceForm({
  customers,
  products,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  className,
}: InvoiceFormProps) {
  const { error } = useToast();
  const [customerId, setCustomerId] = useState(initialData?.customerId || '');
  const [dueDate, setDueDate] = useState(initialData?.dueDate || '');
  const [items, setItems] = useState<FormLineItem[]>(() => {
    if (initialData?.items && initialData.items.length > 0) {
      return initialData.items.map((it, idx) => ({
        key: it.id || `${idx}-${Date.now()}`,
        productId: it.productId,
        quantity: it.quantity,
        unitPrice: it.price,
        gstRate: it.gstRate,
      }));
    }
    return [{ key: `init-${Date.now()}`, productId: '', quantity: 1 }];
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Synchronize strictly on initialData.id changes
  useEffect(() => {
    setCustomerId(initialData?.customerId || '');
    setDueDate(initialData?.dueDate || '');
    if (initialData?.items && initialData.items.length > 0) {
      setItems(
        initialData.items.map((it, idx) => ({
          key: it.id || `${idx}-${Date.now()}`,
          productId: it.productId,
          quantity: it.quantity,
          unitPrice: it.price,
          gstRate: it.gstRate,
        }))
      );
    } else {
      setItems([{ key: `init-${Date.now()}`, productId: '', quantity: 1 }]);
    }
    setValidationErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData?.id]);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { key: `item-${Date.now()}-${prev.length}`, productId: '', quantity: 1 },
    ]);
  };

  const handleRemoveItem = (indexToRemove: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleItemChange = (
    index: number,
    field: keyof FormLineItem,
    value: string | number
  ) => {
    setItems((prev) => {
      const copy = [...prev];
      const target = { ...copy[index] };

      if (field === 'productId') {
        target.productId = String(value);
        // Auto-fill price and gst from selected product if unitPrice isn't overridden
        const prod = products.find((p) => p.id === String(value));
        if (prod) {
          target.unitPrice = prod.price;
          target.gstRate = prod.gstRate;
        }
      } else if (field === 'quantity') {
        const parsed = parseInt(String(value), 10);
        target.quantity = isNaN(parsed) || parsed < 1 ? 1 : parsed;
      } else if (field === 'unitPrice' || field === 'gstRate') {
        target[field] = String(value);
      }

      copy[index] = target;
      return copy;
    });
  };

  // Real-time computation of invoice totals
  const calculateTotals = () => {
    let subtotal = 0;
    let gstTotal = 0;

    items.forEach((item) => {
      if (!item.productId) return;
      const prod = products.find((p) => p.id === item.productId);
      const unitPriceVal = parseFloat(item.unitPrice ?? prod?.price ?? '0');
      const gstRateVal = parseFloat(item.gstRate ?? prod?.gstRate ?? '0');

      if (!isNaN(unitPriceVal) && item.quantity > 0) {
        const lineSubtotal = unitPriceVal * item.quantity;
        const lineGst = lineSubtotal * (!isNaN(gstRateVal) ? gstRateVal / 100 : 0);
        subtotal += lineSubtotal;
        gstTotal += lineGst;
      }
    });

    return {
      subtotal,
      gstTotal,
      grandTotal: subtotal + gstTotal,
    };
  };

  const totals = calculateTotals();

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!customerId.trim()) {
      errors.customerId = 'Please select a customer for this invoice';
    }

    const validItems = items.filter((it) => it.productId.trim() !== '' && it.quantity >= 1);
    if (validItems.length === 0) {
      errors.items = 'Add at least one valid line item with a selected product and quantity >= 1';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      error('Validation Error', 'Check the form for missing customer selection or line items.');
      return;
    }

    const validItems: InvoiceItemDto[] = items
      .filter((it) => it.productId.trim() !== '')
      .map((it) => {
        const prod = products.find((p) => p.id === it.productId);
        const unitPriceVal = parseFloat(it.unitPrice ?? prod?.price ?? '0');
        const gstRateVal = parseFloat(it.gstRate ?? prod?.gstRate ?? '0');
        const lineSub = unitPriceVal * it.quantity;
        const lineGst = lineSub * (gstRateVal / 100);
        const lineTotal = lineSub + lineGst;

        return {
          id: it.key,
          productId: it.productId,
          productName: prod?.name || 'Unknown Item',
          quantity: it.quantity,
          price: unitPriceVal.toFixed(2),
          gstRate: gstRateVal.toFixed(2),
          gstAmount: lineGst.toFixed(2),
          total: lineTotal.toFixed(2),
        };
      });

    try {
      await onSubmit({
        customerId,
        dueDate: dueDate || undefined,
        items: validItems,
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to save invoice details';
      error('Submission Failed', errMsg);
    }
  };

  const selectedCustomer = customers.find((c) => c.id === customerId);

  return (
    <form
      onSubmit={handleSubmit}
      className={twMerge(clsx('flex flex-col space-y-6', className))}
      noValidate
    >
      {/* Top Details Header */}
      <GlassCard className="p-5 border-outline-variant space-y-4">
        <div className="flex items-center justify-between border-b border-outline-variant pb-3">
          <div className="flex items-center gap-2">
            <Receipt className="text-primary h-5 w-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
              Billing Information
            </h3>
          </div>
          {selectedCustomer?.gstin && (
            <span className="rounded bg-green-50 border border-green-200 px-2.5 py-1 text-[11px] font-mono text-green-700 font-semibold">
              Customer GSTIN: {selectedCustomer.gstin}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Customer Selector */}
          <div className="flex flex-col space-y-1.5">
            <label
              htmlFor="invoice-customer-select"
              className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant"
            >
              Select Customer *
            </label>
            <select
              id="invoice-customer-select"
              value={customerId}
              onChange={(e) => {
                setCustomerId(e.target.value);
                if (validationErrors.customerId) {
                  setValidationErrors((prev) => ({ ...prev, customerId: '' }));
                }
              }}
              aria-invalid={Boolean(validationErrors.customerId)}
              aria-describedby={validationErrors.customerId ? 'invoice-customer-error' : undefined}
              className={clsx(
                'w-full rounded-lg bg-surface-container-lowest border border-outline-variant p-2.5 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:border-outline-variant/80',
                validationErrors.customerId && 'border-error focus:border-error focus:ring-error/20'
              )}
            >
              <option value="" className="bg-surface-container-lowest text-on-surface-variant">
                -- Choose a registered customer --
              </option>
              {customers.map((c) => (
                <option key={c.id} value={c.id} className="bg-surface-container-lowest text-on-surface">
                  {c.name} {c.gstin ? `(${c.gstin})` : ''}
                </option>
              ))}
            </select>
            {validationErrors.customerId && (
              <p id="invoice-customer-error" role="alert" className="text-xs font-semibold text-error">
                {validationErrors.customerId}
              </p>
            )}
          </div>

          {/* Due Date Picker */}
          <InputFormField
            label="Due Date (Optional)"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </GlassCard>

      {/* Line Items Section */}
      <GlassCard className="p-5 border-outline-variant space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant pb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
              Invoice Line Items
            </h3>
            <p className="text-xs text-on-surface-variant">Add products and adjust quantities for billing.</p>
          </div>
          <button
            type="button"
            onClick={handleAddItem}
            disabled={isLoading}
            className="flex items-center gap-1.5 self-start sm:self-auto rounded-lg bg-surface-container border border-outline-variant px-3 py-1.5 text-xs font-semibold text-on-surface transition-all hover:bg-surface-container-high active:scale-95 disabled:opacity-50"
          >
            <Plus size={14} className="text-primary" />
            <span>Add Line Item</span>
          </button>
        </div>

        {validationErrors.items && (
          <div className="rounded-lg bg-error-container border border-error/30 p-3 text-xs text-error flex items-center gap-2">
            <AlertCircle size={16} className="text-error shrink-0" />
            <span>{validationErrors.items}</span>
          </div>
        )}

        {items.length === 0 ? (
          <EmptyState
            title="No Line Items Added"
            description="Your invoice currently has no items. Click the button above or below to add products from your catalog."
            action={
              <button
                type="button"
                onClick={handleAddItem}
                disabled={isLoading}
                className="mt-2 flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50"
              >
                <Plus size={14} />
                <span>Add Line Item</span>
              </button>
            }
          />
        ) : (
          <div className="space-y-3">
            {items.map((item, idx) => {
              const selectedProduct = products.find((p) => p.id === item.productId);
              const unitPrice = parseFloat(item.unitPrice ?? selectedProduct?.price ?? '0');
              const gstRate = parseFloat(item.gstRate ?? selectedProduct?.gstRate ?? '0');
              const lineTotal = !isNaN(unitPrice) ? unitPrice * item.quantity * (1 + (!isNaN(gstRate) ? gstRate / 100 : 0)) : 0;

              return (
                <div
                  key={item.key}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 rounded-xl bg-surface-container-low p-3.5 border border-outline-variant items-start md:items-center transition-all hover:border-outline-variant/80"
                >
                  {/* Product Dropdown */}
                  <div className="md:col-span-5 flex flex-col space-y-1">
                    <label className="block md:hidden text-[10px] font-bold uppercase text-on-surface-variant">
                      Product / Item
                    </label>
                    <select
                      value={item.productId}
                      onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                      className="w-full rounded-lg bg-surface-container-lowest border border-outline-variant p-2 text-xs text-on-surface focus:border-primary focus:outline-none"
                    >
                      <option value="" className="bg-surface-container-lowest text-on-surface-variant">
                        -- Select Product --
                      </option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id} className="bg-surface-container-lowest text-on-surface">
                          {p.name} (₹{parseFloat(p.price).toFixed(2)} - {p.gstRate}% GST)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div className="md:col-span-2 flex flex-col space-y-1">
                    <label className="block md:hidden text-[10px] font-bold uppercase text-on-surface-variant">
                      Qty
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      className="w-full rounded-lg bg-surface-container-lowest border border-outline-variant p-2 text-xs text-on-surface font-mono focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* Unit Price Override */}
                  <div className="md:col-span-2 flex flex-col space-y-1">
                    <label className="block md:hidden text-[10px] font-bold uppercase text-on-surface-variant">
                      Unit Price (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder={selectedProduct ? selectedProduct.price : '0.00'}
                      value={item.unitPrice ?? ''}
                      onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                      className="w-full rounded-lg bg-surface-container-lowest border border-outline-variant p-2 text-xs text-on-surface font-mono focus:border-primary focus:outline-none placeholder:text-on-surface-variant/60"
                    />
                  </div>

                  {/* Line Total Summary */}
                  <div className="md:col-span-2 flex flex-col md:text-right space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant">Line Total</span>
                    <span className="text-xs font-mono font-bold text-green-700">
                      ₹{lineTotal.toFixed(2)}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <div className="md:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      disabled={items.length === 1 && !item.productId}
                      aria-label="Remove line item"
                      className="rounded-lg p-2 text-error transition-colors hover:bg-error/10 hover:text-error disabled:opacity-30"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>

      {/* Totals Summary Footer */}
      <GlassCard className="p-5 border-outline-variant bg-surface-container flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-on-surface-variant text-xs">
          <Calculator size={18} className="text-primary" />
          <span>Calculated automatically based on unit prices and GST slab percentages.</span>
        </div>

        <div className="flex flex-col sm:items-end space-y-1 text-sm">
          <div className="flex justify-between sm:justify-start gap-8 text-xs text-on-surface-variant">
            <span>Subtotal:</span>
            <span className="font-mono font-semibold text-on-surface">
              ₹{totals.subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between sm:justify-start gap-8 text-xs text-on-surface-variant">
            <span>Total GST:</span>
            <span className="font-mono font-semibold text-on-surface">
              ₹{totals.gstTotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between sm:justify-start gap-8 text-base font-extrabold text-on-surface border-t border-outline-variant pt-1.5 mt-1">
            <span>Grand Total:</span>
            <span className="font-mono text-primary font-extrabold">₹{totals.grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </GlassCard>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-3 border-t border-outline-variant pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-lg px-4 py-2 text-xs font-semibold text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading || items.length === 0}
          className="rounded-lg bg-primary px-6 py-2.5 text-xs font-semibold text-white shadow-md transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50"
        >
          {isLoading ? 'Generating Invoice...' : initialData?.id ? 'Update Invoice' : 'Create & Issue Invoice'}
        </button>
      </div>
    </form>
  );
}
