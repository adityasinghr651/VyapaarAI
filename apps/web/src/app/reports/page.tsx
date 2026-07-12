import React from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { ExecutiveDashboardOverview } from '../../features/dashboard/components/ExecutiveDashboardOverview';

export default function ReportsPage() {
  return (
    <AppShell>
      <ExecutiveDashboardOverview />
    </AppShell>
  );
}
