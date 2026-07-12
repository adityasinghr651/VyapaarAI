import React from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { DashboardOverview } from '../../features/dashboard/components/DashboardOverview';

export default function DashboardPage() {
  return (
    <AppShell>
      <DashboardOverview />
    </AppShell>
  );
}
