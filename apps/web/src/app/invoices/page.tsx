import React from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { InvoiceBuilder } from '../../features/invoices/components/InvoiceBuilder';

export default function InvoicesPage() {
  return (
    <AppShell>
      <InvoiceBuilder />
    </AppShell>
  );
}
