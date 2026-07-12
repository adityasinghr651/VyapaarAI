import React from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { ApprovalsQueue } from '../../features/approvals/components/ApprovalsQueue';

export default function WhatsAppActivityPage() {
  return (
    <AppShell>
      <ApprovalsQueue />
    </AppShell>
  );
}
