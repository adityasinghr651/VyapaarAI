import React from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { CustomerManager } from '../../features/customers/components/CustomerManager';

export default function CustomersPage() {
  return (
    <DashboardLayout>
      <CustomerManager />
    </DashboardLayout>
  );
}
