import React from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { AuditWorkspace } from '../../features/audit/components/AuditWorkspace';

export default function AuditPage() {
  return (
    <AppShell>
      <AuditWorkspace />
    </AppShell>
  );
}
