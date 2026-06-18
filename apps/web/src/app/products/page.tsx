import React from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { ProductCatalog } from '../../features/products/components/ProductCatalog';

export default function ProductsPage() {
  return (
    <DashboardLayout>
      <ProductCatalog />
    </DashboardLayout>
  );
}
