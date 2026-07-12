import React from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { SettingsAuditOverview } from '../../features/settings/components/SettingsAuditOverview';

export default function SettingsPage() {
  return (
    <AppShell>
      <SettingsAuditOverview />
    </AppShell>
  );
}
