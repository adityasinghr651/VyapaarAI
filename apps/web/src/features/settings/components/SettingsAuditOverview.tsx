'use client';

import React from 'react';
import { BusinessProfileCard } from './BusinessProfileCard';
import { TeamManagementTable } from './TeamManagementTable';
import { SubscriptionCard } from './SubscriptionCard';
import { AuditTimeline } from './AuditTimeline';

export function SettingsAuditOverview() {
  return (
    <div className="p-gutter lg:p-margin-page max-w-container-max mx-auto w-full space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface">Account Settings &amp; Audit</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
          Manage your business profile, team access, and view system activities.
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Business Profile & Team Management (2/3 width on XL) */}
        <div className="xl:col-span-2 space-y-6">
          <BusinessProfileCard />
          <TeamManagementTable />
        </div>

        {/* Right Column: Subscription & Audit Log (1/3 width on XL) */}
        <div className="space-y-6">
          <SubscriptionCard />
          <AuditTimeline />
        </div>
      </div>
    </div>
  );
}
