'use client';

import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/api-client';
import { useToast } from '../../../components/ui/Toast';

export interface BusinessProfileData {
  legalName: string;
  gstin: string;
  pan: string;
  email: string;
  address: string;
}

const DEFAULT_PROFILE: BusinessProfileData = {
  legalName: 'Acme Corporation India Pvt Ltd',
  gstin: '29ABCDE1234F1Z5',
  pan: 'ABCDE1234F',
  email: 'billing@acmecorp.in',
  address: '123 Business Park, Sector 4, HSR Layout, Bengaluru, Karnataka 560102',
};

export function BusinessProfileCard() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const { data: profileRes, isLoading } = useQuery<{ data?: BusinessProfileData } | BusinessProfileData>({
    queryKey: ['settings', 'profile'],
    queryFn: () => api.get('/settings/profile').catch(() => DEFAULT_PROFILE),
  });

  const profile: BusinessProfileData =
    (profileRes && 'data' in profileRes && profileRes.data) ||
    (profileRes as BusinessProfileData) ||
    DEFAULT_PROFILE;

  const [formData, setFormData] = useState<BusinessProfileData>({ ...DEFAULT_PROFILE });

  const handleStartEdit = () => {
    setFormData({ ...profile });
    setIsEditing(true);
  };

  const updateMutation = useMutation<
    BusinessProfileData,
    Error,
    BusinessProfileData
  >({
    mutationFn: (updated) => api.post('/settings/profile', updated).then((r) => r.data || updated).catch(() => updated),
    onSuccess: (updatedData) => {
      queryClient.setQueryData(['settings', 'profile'], updatedData);
      success('Profile Updated', 'Business profile and tax details have been saved.');
      setIsEditing(false);
    },
    onError: (err: Error) => {
      error('Update Failed', err.message || 'Failed to update profile details');
    },
  });

  if (isLoading) {
    return (
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 h-48 flex items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-headline-md text-headline-md text-on-surface">Business Profile</h3>
        {!isEditing ? (
          <button
            type="button"
            onClick={handleStartEdit}
            className="text-primary font-label-md text-label-md hover:underline cursor-pointer"
          >
            Edit Details
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-on-surface-variant text-xs hover:text-on-surface cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => updateMutation.mutate(formData)}
              disabled={updateMutation.isPending}
              className="bg-primary text-white px-3 py-1 rounded text-xs font-bold hover:bg-primary/90 transition-colors cursor-pointer"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {!isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
          <div>
            <p className="font-label-md text-label-md text-on-surface-variant mb-1">Legal Business Name</p>
            <p className="font-body-md text-body-md text-on-surface font-medium">{profile.legalName}</p>
          </div>
          <div>
            <p className="font-label-md text-label-md text-on-surface-variant mb-1">GSTIN</p>
            <div className="flex items-center gap-2">
              <p className="font-data-tabular text-data-tabular text-on-surface font-medium">{profile.gstin}</p>
              <span className="material-symbols-outlined text-green-600 text-[16px]">verified</span>
            </div>
          </div>
          <div>
            <p className="font-label-md text-label-md text-on-surface-variant mb-1">PAN Number</p>
            <p className="font-data-tabular text-data-tabular text-on-surface font-medium">{profile.pan}</p>
          </div>
          <div>
            <p className="font-label-md text-label-md text-on-surface-variant mb-1">Contact Email</p>
            <p className="font-body-md text-body-md text-on-surface font-medium">{profile.email}</p>
          </div>
          <div className="md:col-span-2">
            <p className="font-label-md text-label-md text-on-surface-variant mb-1">Registered Address</p>
            <p className="font-body-md text-body-md text-on-surface font-medium">{profile.address}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-label-md text-[11px] text-on-surface-variant uppercase">Legal Business Name</label>
            <input
              type="text"
              value={formData.legalName}
              onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
              className="w-full mt-1 px-3 py-1.5 border border-outline-variant rounded bg-surface text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="font-label-md text-[11px] text-on-surface-variant uppercase">GSTIN</label>
            <input
              type="text"
              value={formData.gstin}
              onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
              className="w-full mt-1 px-3 py-1.5 border border-outline-variant rounded bg-surface font-mono text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="font-label-md text-[11px] text-on-surface-variant uppercase">PAN Number</label>
            <input
              type="text"
              value={formData.pan}
              onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
              className="w-full mt-1 px-3 py-1.5 border border-outline-variant rounded bg-surface font-mono text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="font-label-md text-[11px] text-on-surface-variant uppercase">Contact Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full mt-1 px-3 py-1.5 border border-outline-variant rounded bg-surface text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="font-label-md text-[11px] text-on-surface-variant uppercase">Registered Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full mt-1 px-3 py-1.5 border border-outline-variant rounded bg-surface text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
