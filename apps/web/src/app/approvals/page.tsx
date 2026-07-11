import React from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { ApprovalsQueue } from '../../features/approvals/components/ApprovalsQueue';

export default function ApprovalsPage() {
  return (
    <DashboardLayout>
      <ApprovalsQueue />
    </DashboardLayout>
  );
}
