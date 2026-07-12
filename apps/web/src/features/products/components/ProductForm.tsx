'use client';

import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ProductDto } from '@vyapaarai/shared-types';
import { InputFormField } from '../../../components/ui/InputFormField';
import { useToast } from '../../../components/ui/Toast';

export interface ProductFormData {
  name: string;
  price: number;
  gstRate: number;
  sku?: string;
  description?: string;
}

export interface ProductFormProps {
  initialData?: Partial<ProductDto>;
  onSubmit: (data: ProductFormData) => Promise<void> | void;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

const GST_SLABS = ['0.00', '5.00', '12.00', '18.00', '28.00'] as const;

export function ProductForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  className,
}: ProductFormProps) {
  const { error } = useToast();
  const [name, setName] = useState(initialData?.name || '');
  const [sku, setSku] = useState(initialData?.sku || '');
  const [price, setPrice] = useState(initialData?.price || '');
  const [gstRate, setGstRate] = useState(initialData?.gstRate || '18.00');
  const [description, setDescription] = useState(initialData?.description || '');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setName(initialData?.name || '');
    setSku(initialData?.sku || '');
    setPrice(initialData?.price || '');
    setGstRate(initialData?.gstRate || '18.00');
    setDescription(initialData?.description || '');
    setValidationErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData?.id]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = 'Product name is required';
    }

    const parsedPrice = parseFloat(price);
    if (!price.trim() || isNaN(parsedPrice) || parsedPrice < 0) {
      errors.price = 'Enter a valid non-negative base price (e.g., 500)';
    }

    const parsedGst = parseFloat(gstRate);
    if (isNaN(parsedGst) || parsedGst < 0 || parsedGst > 100) {
      errors.gstRate = 'Enter a valid GST slab percentage (0 - 100)';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      error('Validation Error', 'Please check the product form for invalid fields.');
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        price: parseFloat(price),
        gstRate: parseFloat(gstRate),
        sku: sku.trim().toUpperCase() || undefined,
        description: description.trim() || undefined,
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to save product details';
      error('Submission Failed', errMsg);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={twMerge(clsx('flex flex-col space-y-4', className))}
      noValidate
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputFormField
          label="Product Name"
          required
          placeholder="Enterprise Subscription / Wireless Mouse"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (validationErrors.name) {
              setValidationErrors((prev) => ({ ...prev, name: '' }));
            }
          }}
          error={validationErrors.name}
        />

        <InputFormField
          label="SKU / Item Code"
          placeholder="PROD-001"
          value={sku}
          onChange={(e) => setSku(e.target.value.toUpperCase())}
          helperText="Unique stock keeping identifier"
        />

        <InputFormField
          label="Base Price (INR)"
          required
          type="number"
          step="0.01"
          min="0"
          placeholder="1000.00"
          value={price}
          onChange={(e) => {
            setPrice(e.target.value);
            if (validationErrors.price) {
              setValidationErrors((prev) => ({ ...prev, price: '' }));
            }
          }}
          error={validationErrors.price}
        />

        <div className="flex flex-col space-y-1.5">
          <label
            htmlFor="product-gst-rate"
            className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant"
          >
            GST Slab Rate (%) *
          </label>
          <select
            id="product-gst-rate"
            value={gstRate}
            onChange={(e) => {
              setGstRate(e.target.value);
              if (validationErrors.gstRate) {
                setValidationErrors((prev) => ({ ...prev, gstRate: '' }));
              }
            }}
            className={clsx(
              'w-full rounded-lg bg-surface-container-lowest border border-outline-variant p-2.5 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:border-outline-variant/80',
              validationErrors.gstRate && 'border-error focus:border-error focus:ring-error/20'
            )}
          >
            {GST_SLABS.map((slab) => (
              <option key={slab} value={slab} className="bg-surface-container-lowest text-on-surface">
                {slab}% GST
              </option>
            ))}
          </select>
          {validationErrors.gstRate && (
            <p role="alert" className="text-xs font-semibold text-error">
              {validationErrors.gstRate}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col space-y-1.5">
        <label
          htmlFor="product-description"
          className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant"
        >
          Product Description
        </label>
        <textarea
          id="product-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="h-20 w-full rounded-lg bg-surface-container-lowest border border-outline-variant p-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:border-outline-variant/80"
          placeholder="Detailed specification or billing note for invoices..."
        />
      </div>

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
          disabled={isLoading}
          className="rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-white shadow-md transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : initialData?.id ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}
