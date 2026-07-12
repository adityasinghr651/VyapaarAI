'use client';

import React from 'react';

export interface ExtractionFormData {
  customerName: string;
  product: string;
  quantity: number;
  gstRate: number;
}

export interface ExtractionFormProps {
  data: ExtractionFormData;
  onChange: (updated: ExtractionFormData) => void;
}

export function ExtractionForm({ data, onChange }: ExtractionFormProps) {
  const baseAmount = data.quantity * 738; // Default/Calculated unit rate base amount
  const taxAmount = (baseAmount * data.gstRate) / 100;
  const totalAmount = baseAmount + taxAmount;

  const handleTextChange = (field: keyof ExtractionFormData, value: string | number) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6 shadow-sm flex-1 overflow-y-auto custom-scrollbar">
      <div className="grid grid-cols-2 gap-6">
        {/* Customer Name */}
        <div className="col-span-2 sm:col-span-1 space-y-1">
          <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wide">
            Customer Name
          </label>
          <input
            className="w-full px-3 py-2 bg-surface-bright border border-outline-variant rounded font-data-tabular text-data-tabular text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
            type="text"
            value={data.customerName}
            onChange={(e) => handleTextChange('customerName', e.target.value)}
          />
        </div>

        {/* Product */}
        <div className="col-span-2 sm:col-span-1 space-y-1">
          <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wide">
            Product
          </label>
          <div className="relative">
            <input
              className="w-full px-3 py-2 bg-surface-bright border border-outline-variant rounded font-data-tabular text-data-tabular text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all pr-10"
              type="text"
              value={data.product}
              onChange={(e) => handleTextChange('product', e.target.value)}
            />
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary text-[18px]">
              magic_button
            </span>
          </div>
        </div>

        {/* Quantity */}
        <div className="col-span-1 space-y-1">
          <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wide">
            Quantity
          </label>
          <input
            className="w-full px-3 py-2 bg-surface-bright border border-outline-variant rounded font-data-tabular text-data-tabular text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-right"
            type="number"
            value={data.quantity}
            onChange={(e) => handleTextChange('quantity', parseInt(e.target.value, 10) || 0)}
          />
        </div>

        {/* GST Rate (%) */}
        <div className="col-span-1 space-y-1">
          <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wide">
            GST Rate (%)
          </label>
          <select
            className="w-full px-3 py-2 bg-surface-bright border border-outline-variant rounded font-data-tabular text-data-tabular text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
            value={`${data.gstRate}%`}
            onChange={(e) => handleTextChange('gstRate', parseInt(e.target.value.replace('%', ''), 10) || 18)}
          >
            <option value="5%">5%</option>
            <option value="12%">12%</option>
            <option value="18%">18%</option>
            <option value="28%">28%</option>
          </select>
        </div>

        {/* Financial Summary Section */}
        <div className="col-span-2 mt-4 pt-6 border-t border-outline-variant space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-outline-variant/30">
            <span className="font-body-md text-body-md text-on-surface-variant">Base Amount</span>
            <span className="font-data-tabular text-data-tabular text-on-surface">
              ₹{baseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-outline-variant/30">
            <span className="font-body-md text-body-md text-on-surface-variant">Tax Amount ({data.gstRate}%)</span>
            <span className="font-data-tabular text-data-tabular text-on-surface">
              ₹{taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 bg-surface-container-low px-4 rounded">
            <span className="font-headline-md text-headline-md font-bold text-on-surface">Total Amount</span>
            <span className="font-headline-md text-headline-md font-bold text-on-surface">
              ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
