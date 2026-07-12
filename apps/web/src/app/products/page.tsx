import React from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { ProductCatalog } from '../../features/products/components/ProductCatalog';

export default function ProductsPage() {
  return (
    <AppShell>
      <ProductCatalog />
    </AppShell>
  );
}
