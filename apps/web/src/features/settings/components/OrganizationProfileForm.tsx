'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Save, Loader2, ShieldCheck } from 'lucide-react';
import { Role } from '@vyapaarai/shared-types';
import api from '../../../lib/api-client';
import { useToast } from '../../../components/ui/Toast';
import { GlassCard } from '../../../components/ui/GlassCard';
import { InputFormField } from '../../../components/ui/InputFormField';
import { useStore } from '../../../store/useStore';

export interface OrganizationData {
  id?: string;
  name: string;
  slug?: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  gstin?: string | null;
  pan?: string | null;
  stateCode?: string | null;
  whatsappPhoneNumberId?: string | null;
}

export interface OrganizationResponse {
  message?: string;
  data?: OrganizationData;
}

export function OrganizationProfileForm() {
  const queryClient = useQueryClient();
  const { success: toastSuccess, error: toastError } = useToast();
  const user = useStore((state) => state.user);

  const isOwner = user?.role === Role.OWNER;
  const isReadOnly = !isOwner;

  const { data: responseData, isLoading, isError } = useQuery<OrganizationResponse, Error>({
    queryKey: ['organizations', 'current'],
    queryFn: () => api.get('/organizations/current'),
  });

  const orgData: OrganizationData | undefined =
    responseData && typeof responseData === 'object' && 'data' in responseData
      ? responseData.data
      : (responseData as unknown as OrganizationData);

  const [formData, setFormData] = useState<OrganizationData>({
    name: '',
    gstin: '',
    pan: '',
    address: '',
    stateCode: '',
  });

  useEffect(() => {
    if (orgData) {
      setFormData({
        name: orgData.name || '',
        gstin: orgData.gstin || '',
        pan: orgData.pan || '',
        address: orgData.address || '',
        stateCode: orgData.stateCode || '',
      });
    }
  }, [orgData]);

  const handleChange = (field: keyof OrganizationData, value: string) => {
    if (isReadOnly) return;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateMutation = useMutation<OrganizationResponse, Error, OrganizationData>({
    mutationFn: (updated) => api.put('/organizations/current', updated),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['organizations', 'current'] });
      const updatedOrg = res?.data || formData;
      queryClient.setQueryData(['organizations', 'current'], {
        message: 'Organization details retrieved successfully',
        data: updatedOrg,
      });
      toastSuccess(
        'Profile Updated',
        'Organization legal profile and tax details have been updated successfully.'
      );
    },
    onError: (err: Error) => {
      toastError('Save Failed', err.message || 'Failed to update organization profile.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <GlassCard className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Building2 className="text-primary animate-pulse" size={24} />
          <div className="space-y-1.5 w-full">
            <div className="h-5 bg-surface-container w-1/3 rounded animate-pulse" />
            <div className="h-3 bg-surface-container w-2/3 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-16 bg-surface-container-low rounded-lg animate-pulse" />
          <div className="h-16 bg-surface-container-low rounded-lg animate-pulse" />
          <div className="h-16 bg-surface-container-low rounded-lg animate-pulse md:col-span-2" />
        </div>
      </GlassCard>
    );
  }

  if (isError && !orgData) {
    return (
      <GlassCard className="p-6 border-error/30 bg-error-container/10">
        <p className="text-error font-semibold text-sm">Failed to load organization details from server.</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="space-y-6">
      <div className="flex items-center justify-between border-b border-outline-variant pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary flex items-center justify-center">
            <Building2 size={22} />
          </div>
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
              Organization Legal Profile
            </h3>
            <p className="font-body-md text-xs text-on-surface-variant">
              Manage legal business name, GSTIN compliance, PAN, and registered headquarters address.
            </p>
          </div>
        </div>

        {isReadOnly && (
          <div className="flex items-center gap-1.5 bg-surface-container text-on-surface-variant px-3 py-1 rounded-full text-xs font-semibold">
            <ShieldCheck size={14} className="text-amber-600" />
            <span>Read-Only (Accountant)</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Organization Name */}
          <InputFormField
            label="Organization Legal Name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Acme Enterprises India Pvt Ltd"
            disabled={isReadOnly || updateMutation.isPending}
            required
            containerClassName="md:col-span-2"
          />

          {/* GSTIN */}
          <InputFormField
            label="GSTIN (15-Digit Tax Number)"
            value={formData.gstin || ''}
            onChange={(e) => handleChange('gstin', e.target.value.toUpperCase())}
            placeholder="29ABCDE1234F1Z5"
            disabled={isReadOnly || updateMutation.isPending}
            maxLength={15}
            helperText="Automates GST returns and smart invoicing verification."
          />

          {/* PAN */}
          <InputFormField
            label="Permanent Account Number (PAN)"
            value={formData.pan || ''}
            onChange={(e) => handleChange('pan', e.target.value.toUpperCase())}
            placeholder="ABCDE1234F"
            disabled={isReadOnly || updateMutation.isPending}
            maxLength={10}
            helperText="Company permanent identifier registered with income tax."
          />

          {/* Registered Address */}
          <InputFormField
            label="Registered Office Address"
            value={formData.address || ''}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Sector 4, HSR Layout, Bengaluru, Karnataka 560102"
            disabled={isReadOnly || updateMutation.isPending}
            containerClassName="md:col-span-2"
          />

          {/* State Code */}
          <InputFormField
            label="GST State Code"
            value={formData.stateCode || ''}
            onChange={(e) => handleChange('stateCode', e.target.value)}
            placeholder="29 (Karnataka)"
            disabled={isReadOnly || updateMutation.isPending}
            helperText="2-digit state code used for CGST / SGST / IGST calculation."
          />
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-end pt-4 border-t border-outline-variant">
          <button
            type="submit"
            disabled={isReadOnly || updateMutation.isPending}
            className="flex items-center gap-2 bg-primary text-white font-label-lg px-6 py-2.5 rounded-xl text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </GlassCard>
  );
}
