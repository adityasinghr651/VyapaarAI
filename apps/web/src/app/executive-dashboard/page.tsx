import React from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { ExecutiveDashboardOverview } from '../../features/dashboard/components/ExecutiveDashboardOverview';

export default function ExecutiveDashboardAliasPage() {
  return (
    <AppShell>
      <ExecutiveDashboardOverview />
    </AppShell>
  );
}
