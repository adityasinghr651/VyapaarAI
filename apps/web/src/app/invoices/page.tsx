import React from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { InvoiceBuilder } from '../../features/invoices/components/InvoiceBuilder';

export default function InvoicesPage() {
  return (
    <DashboardLayout>
      <InvoiceBuilder />
    </DashboardLayout>
  );
}
