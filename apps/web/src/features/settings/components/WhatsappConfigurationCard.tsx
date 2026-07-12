'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Save, Loader2, RefreshCw } from 'lucide-react';
import { Role } from '@vyapaarai/shared-types';
import api from '../../../lib/api-client';
import { useToast } from '../../../components/ui/Toast';
import { GlassCard } from '../../../components/ui/GlassCard';
import { InputFormField } from '../../../components/ui/InputFormField';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { useStore } from '../../../store/useStore';
import { OrganizationResponse } from './OrganizationProfileForm';

export interface WebhookStatusResponse {
  success?: boolean;
  message?: string;
  data?: {
    status: string;
    verified: boolean;
  };
}

export function WhatsappConfigurationCard() {
  const queryClient = useQueryClient();
  const { success: toastSuccess, error: toastError } = useToast();
  const user = useStore((state) => state.user);

  const isOwner = user?.role === Role.OWNER;
  const isReadOnly = !isOwner;

  // 1. Fetch current organization details to get existing whatsappPhoneNumberId
  const { data: orgResponse } = useQuery<OrganizationResponse, Error>({
    queryKey: ['organizations', 'current'],
    queryFn: () => api.get('/organizations/current'),
  });

  const orgData =
    orgResponse && typeof orgResponse === 'object' && 'data' in orgResponse
      ? orgResponse.data
      : (orgResponse as unknown as { whatsappPhoneNumberId?: string | null });

  // 2. Fetch webhook verification status from /webhooks/whatsapp
  const {
    data: webhookRes,
    isLoading: isWebhookLoading,
    refetch: refetchWebhookStatus,
  } = useQuery<WebhookStatusResponse, Error>({
    queryKey: ['webhooks', 'whatsapp'],
    queryFn: () => api.get('/webhooks/whatsapp'),
  });

  const webhookStatusData =
    webhookRes && typeof webhookRes === 'object' && 'data' in webhookRes && webhookRes.data
      ? webhookRes.data
      : { status: 'Verification Pending', verified: false };

  const [phoneNumberId, setPhoneNumberId] = useState<string>('');

  useEffect(() => {
    if (orgData && orgData.whatsappPhoneNumberId !== undefined) {
      setPhoneNumberId(orgData.whatsappPhoneNumberId || '');
    }
  }, [orgData]);

  const updateMutation = useMutation<OrganizationResponse, Error, { whatsappPhoneNumberId: string }>({
    mutationFn: (updated) => api.put('/organizations/current', updated),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations', 'current'] });
      queryClient.invalidateQueries({ queryKey: ['webhooks', 'whatsapp'] });
      toastSuccess(
        'WhatsApp Config Saved',
        'WhatsApp Phone Number ID has been updated successfully.'
      );
    },
    onError: (err: Error) => {
      toastError('Update Failed', err.message || 'Failed to update WhatsApp configuration.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    updateMutation.mutate({ whatsappPhoneNumberId: phoneNumberId });
  };

  const isVerified = webhookStatusData.verified || webhookStatusData.status === 'Verified';

  return (
    <GlassCard className="space-y-6">
      <div className="flex items-center justify-between border-b border-outline-variant pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#25D366]/15 rounded-xl text-[#128C7E] flex items-center justify-center">
            <MessageSquare size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                WhatsApp Configuration
              </h3>
              {isWebhookLoading ? (
                <div className="h-5 w-24 bg-surface-container rounded animate-pulse" />
              ) : (
                <StatusBadge
                  status={isVerified ? 'Verified' : 'Verification Pending'}
                  variant={isVerified ? 'success' : 'warning'}
                  label={isVerified ? '🟢 Verified' : '🟠 Verification Pending'}
                  size="sm"
                />
              )}
            </div>
            <p className="font-body-md text-xs text-on-surface-variant">
              Connect your Meta Cloud API phone number and verify real-time webhook extraction status.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => refetchWebhookStatus()}
          disabled={isWebhookLoading}
          className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer"
          title="Refresh Webhook Status"
        >
          <RefreshCw size={16} className={isWebhookLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <InputFormField
            label="WhatsApp Phone Number ID"
            value={phoneNumberId}
            onChange={(e) => setPhoneNumberId(e.target.value)}
            placeholder="104829104829102"
            disabled={isReadOnly || updateMutation.isPending}
            helperText="Obtained directly from your Facebook Meta Business Cloud API console dashboard under Phone Numbers."
          />

          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-on-surface uppercase tracking-wider block">
                Webhook Verification Status
              </span>
              <span className="text-xs text-on-surface-variant">
                Endpoint URL: <code className="font-mono bg-surface-container px-1.5 py-0.5 rounded text-[11px]">/webhooks/whatsapp</code>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge
                status={isVerified ? 'Verified' : 'Verification Pending'}
                variant={isVerified ? 'success' : 'warning'}
                label={isVerified ? 'Verified' : 'Verification Pending'}
                size="md"
              />
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-end pt-4 border-t border-outline-variant">
          <button
            type="submit"
            disabled={isReadOnly || updateMutation.isPending}
            className="flex items-center gap-2 bg-[#128C7E] text-white font-label-lg px-6 py-2.5 rounded-xl text-sm hover:bg-[#075E54] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Saving Configuration...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save WhatsApp Config</span>
              </>
            )}
          </button>
        </div>
      </form>
    </GlassCard>
  );
}
