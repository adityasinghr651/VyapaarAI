'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Settings as SettingsIcon } from 'lucide-react';
import { Role } from '@vyapaarai/shared-types';
import { useStore } from '../../../store/useStore';
import { useToast } from '../../../components/ui/Toast';
import { OrganizationProfileForm } from './OrganizationProfileForm';
import { WhatsappConfigurationCard } from './WhatsappConfigurationCard';
import { SubscriptionCard } from './SubscriptionCard';
import { AuditTimeline } from './AuditTimeline';

export function SettingsWorkspace() {
  const router = useRouter();
  const user = useStore((state) => state.user);
  const { error: toastError } = useToast();

  useEffect(() => {
    if (user && user.role === Role.STAFF) {
      toastError('Access Denied (403)', 'You do not have permission to access the organization settings workspace.');
      router.replace('/dashboard');
    }
  }, [user, router, toastError]);

  if (!user || user.role === Role.STAFF) {
    return null;
  }

  const isReadOnly = user.role === Role.ACCOUNTANT;

  return (
    <div className="p-gutter lg:p-margin-page max-w-container-max mx-auto w-full space-y-8 animate-in fade-in duration-300">
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-primary/10 rounded-lg text-primary flex items-center justify-center">
              <SettingsIcon size={24} />
            </span>
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">
              Organization Settings &amp; Configuration
            </h1>
          </div>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-1.5 max-w-3xl">
            Configure your legal business profile, manage Meta Cloud API WhatsApp integration endpoints, and review active billing plans.
          </p>
        </div>

        {isReadOnly && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 shadow-sm">
            <ShieldAlert size={16} className="text-amber-600" />
            <span>ACCOUNTANT ROLE (READ-ONLY)</span>
          </div>
        )}
      </div>

      {/* Main Configuration Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Left / Main Column (2/3 width on XL): Profile Form + WhatsApp Configuration */}
        <div className="xl:col-span-2 space-y-6">
          <OrganizationProfileForm />
          <WhatsappConfigurationCard />
        </div>

        {/* Right / Secondary Column (1/3 width on XL): Subscription + Audit Overview */}
        <div className="space-y-6">
          <SubscriptionCard />
          <AuditTimeline />
        </div>
      </div>
    </div>
  );
}
