import React from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { CustomerManager } from '../../features/customers/components/CustomerManager';

export default function CustomersPage() {
  return (
    <AppShell>
      <CustomerManager />
    </AppShell>
  );
}
