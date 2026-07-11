'use client';

import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CustomerDto } from '@vyapaarai/shared-types';
import { InputFormField } from '../../../components/ui/InputFormField';
import { useToast } from '../../../components/ui/Toast';

export interface CustomerFormData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  gstin?: string;
}

export interface CustomerFormProps {
  initialData?: Partial<CustomerDto>;
  onSubmit: (data: CustomerFormData) => Promise<void> | void;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export function CustomerForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  className,
}: CustomerFormProps) {
  const { error } = useToast();
  const [name, setName] = useState(initialData?.name || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [gstin, setGstin] = useState(initialData?.gstin || '');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setName(initialData?.name || '');
    setEmail(initialData?.email || '');
    setPhone(initialData?.phone || '');
    setAddress(initialData?.address || '');
    setGstin(initialData?.gstin || '');
    setValidationErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData?.id]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = 'Company name is required';
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Enter a valid email address';
    }

    if (gstin.trim() && !GSTIN_REGEX.test(gstin.trim().toUpperCase())) {
      errors.gstin = 'Invalid 15-character GSTIN format (e.g., 09AAACA1111A1Z1)';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      error('Validation Error', 'Please check the form for invalid fields before submitting.');
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        gstin: gstin.trim().toUpperCase() || undefined,
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to save customer details';
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
          label="Company Name"
          required
          placeholder="ACME Corporation"
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
          label="GSTIN (Optional)"
          placeholder="09AAACA1111A1Z1"
          value={gstin}
          onChange={(e) => {
            const val = e.target.value.toUpperCase();
            setGstin(val);
            if (validationErrors.gstin && (val === '' || GSTIN_REGEX.test(val))) {
              setValidationErrors((prev) => ({ ...prev, gstin: '' }));
            }
          }}
          error={validationErrors.gstin}
          helperText="Format: 2-digit state code + 10-char PAN + entity code + Z + check digit"
        />

        <InputFormField
          label="Email Address"
          type="email"
          placeholder="billing@acme.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (validationErrors.email) {
              setValidationErrors((prev) => ({ ...prev, email: '' }));
            }
          }}
          error={validationErrors.email}
        />

        <InputFormField
          label="Phone Number"
          placeholder="+91 99999 99999"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <div className="flex flex-col space-y-1.5">
        <label
          htmlFor="customer-billing-address"
          className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
        >
          Billing Address
        </label>
        <textarea
          id="customer-billing-address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="glass-input h-20 w-full rounded-lg p-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none transition-all border-slate-800/80 hover:border-slate-700"
          placeholder="123 Industrial Area, Sector 5..."
        />
      </div>

      <div className="flex items-center justify-end space-x-3 border-t border-slate-900/80 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-400 transition-colors hover:bg-slate-900 hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-white shadow-md transition-all hover:bg-violet-600 active:scale-95 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : initialData?.id ? 'Update Customer' : 'Create Customer'}
        </button>
      </div>
    </form>
  );
}
