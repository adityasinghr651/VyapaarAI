'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/api-client';
import { useToast } from '../../../components/ui/Toast';

export interface SubscriptionData {
  planName: string;
  billingCycle: string;
  renewalDate: string;
  usersUsed: number;
  usersLimit: number;
}

const DEFAULT_SUBSCRIPTION: SubscriptionData = {
  planName: 'Growth Plan',
  billingCycle: '/ Annual',
  renewalDate: 'Renews Oct 12, 2024',
  usersUsed: 3,
  usersLimit: 5,
};

export function SubscriptionCard() {
  const { success } = useToast();
  const { data: subRes } = useQuery<{ data?: SubscriptionData } | SubscriptionData>({
    queryKey: ['settings', 'subscription'],
    queryFn: () => api.get('/settings/subscription').catch(() => DEFAULT_SUBSCRIPTION),
  });

  const subscription: SubscriptionData =
    (subRes && 'data' in subRes && subRes.data) ||
    (subRes as SubscriptionData) ||
    DEFAULT_SUBSCRIPTION;

  const progressPct = Math.min(
    100,
    Math.round((subscription.usersUsed / subscription.usersLimit) * 100)
  );

  return (
    <div className="bg-gradient-to-br from-surface-container-lowest to-surface-container-low rounded-xl border border-outline-variant p-6 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full blur-xl"></div>
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
          stars
        </span>
        <h3 className="font-headline-md text-headline-md text-on-surface">Subscription</h3>
      </div>
      <div className="mb-6">
        <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wide">Current Plan</p>
        <div className="flex items-end gap-2 mt-1">
          <p className="font-headline-lg text-headline-lg text-on-surface font-bold">{subscription.planName}</p>
          <p className="font-body-md text-body-md text-on-surface-variant pb-1">{subscription.billingCycle}</p>
        </div>
      </div>
      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center text-sm">
          <span className="text-on-surface-variant font-body-md">Billing Cycle</span>
          <span className="text-on-surface font-data-tabular font-medium">{subscription.renewalDate}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-on-surface-variant font-body-md">Users</span>
          <span className="text-on-surface font-data-tabular font-medium">
            {subscription.usersUsed} / {subscription.usersLimit} Included
          </span>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-surface-variant rounded-full h-1.5 mt-1">
          <div className="bg-primary h-1.5 rounded-full" style={{ width: `${progressPct}%` }}></div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => success('Plan Options', 'Our institutional growth team will contact you regarding tier upgrades.')}
        className="w-full py-2 bg-white border border-outline-variant text-on-surface rounded-lg font-label-md text-label-md hover:bg-surface-container-low transition-colors shadow-sm cursor-pointer"
      >
        Upgrade Plan
      </button>
    </div>
  );
}
