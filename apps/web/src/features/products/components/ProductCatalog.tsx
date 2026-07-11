'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProductDto } from '@vyapaarai/shared-types';
import { Plus, Trash2, Edit3, Layers, HelpCircle, Package } from 'lucide-react';
import api from '../../../lib/api-client';
import { DataTable, ColumnDef } from '../../../components/ui/DataTable';
import { ModalDrawer } from '../../../components/ui/ModalDrawer';
import { useToast } from '../../../components/ui/Toast';
import { ProductForm, ProductFormData } from './ProductForm';

interface ProductsApiResponse {
  message?: string;
  data?: ProductDto[];
}

interface SingleProductApiResponse {
  message?: string;
  data?: ProductDto;
}

export function ProductCatalog() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<ProductDto | null>(null);

  // Queries
  const { data: productsRes, isLoading } = useQuery<ProductsApiResponse | ProductDto[]>({
    queryKey: ['products'],
    queryFn: () => api.get('/products'),
  });

  const products: ProductDto[] = Array.isArray(productsRes)
    ? productsRes
    : (productsRes as ProductsApiResponse)?.data || [];

  // Mutations
  const createMutation = useMutation<SingleProductApiResponse | ProductDto, Error, ProductFormData>({
    mutationFn: (newProduct) => api.post('/products', newProduct),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsFormOpen(false);
      setActiveProduct(null);
      const createdName = (res as SingleProductApiResponse)?.data?.name || 'Product';
      success('Product Cataloged', `${createdName} has been successfully added to your inventory catalog.`);
    },
    onError: (err: Error) => {
      error('Creation Failed', err.message || 'Failed to add product to catalog');
    },
  });

  const updateMutation = useMutation<SingleProductApiResponse | ProductDto, Error, { id: string; data: ProductFormData }>({
    mutationFn: ({ id, data }) => api.patch(`/products/${id}`, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsFormOpen(false);
      setActiveProduct(null);
      const updatedName = (res as SingleProductApiResponse)?.data?.name || 'Product';
      success('Product Updated', `Specifications for ${updatedName} have been updated.`);
    },
    onError: (err: Error) => {
      error('Update Failed', err.message || 'Failed to update product details');
    },
  });

  const deleteMutation = useMutation<SingleProductApiResponse | ProductDto, Error, string>({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      success('Product Removed', 'Catalog item has been permanently deleted.');
    },
    onError: (err: Error) => {
      error('Deletion Failed', err.message || 'Failed to delete product from catalog');
    },
  });

  const handleOpenCreate = () => {
    setActiveProduct(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product: ProductDto) => {
    setActiveProduct(product);
    setIsFormOpen(true);
  };

  const handleCloseModal = () => {
    setIsFormOpen(false);
    setActiveProduct(null);
  };

  const handleFormSubmit = async (formData: ProductFormData) => {
    if (activeProduct) {
      await updateMutation.mutateAsync({ id: activeProduct.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleDeleteProduct = (product: ProductDto) => {
    if (window.confirm(`Are you sure you want to delete product "${product.name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(product.id);
    }
  };

  const columns: ColumnDef<ProductDto>[] = [
    {
      header: 'Product Details',
      accessorKey: 'name',
      cell: (prod) => (
        <div>
          <div className="font-bold text-white tracking-wide">{prod.name}</div>
          {prod.description && (
            <div className="flex items-center text-xs text-slate-400 mt-1 max-w-sm truncate">
              <HelpCircle size={12} className="mr-1 shrink-0 text-slate-500" />
              <span>{prod.description}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'SKU / Code',
      accessorKey: 'sku',
      cell: (prod) =>
        prod.sku ? (
          <div className="flex items-center space-x-1.5">
            <Layers size={14} className="text-slate-500 shrink-0" />
            <span className="font-mono text-xs font-semibold text-slate-300">{prod.sku}</span>
          </div>
        ) : (
          <span className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5 text-xs font-medium text-slate-500">
            None
          </span>
        ),
    },
    {
      header: 'Tax Rate',
      accessorKey: 'gstRate',
      cell: (prod) => (
        <span className="text-xs bg-indigo-950/40 text-indigo-300 border border-indigo-500/30 px-2 py-1 rounded-md font-semibold tracking-wide">
          {parseFloat(prod.gstRate).toFixed(1)}% GST
        </span>
      ),
    },
    {
      header: 'Unit Price',
      accessorKey: 'price',
      cell: (prod) => (
        <span className="font-mono font-bold text-white text-sm">
          ₹{parseFloat(prod.price).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (prod) => (
        <div className="flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={() => handleOpenEdit(prod)}
            disabled={updateMutation.isPending || deleteMutation.isPending}
            aria-label={`Edit ${prod.name}`}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-900 hover:text-white active:scale-95 disabled:opacity-50"
          >
            <Edit3 size={16} />
          </button>
          <button
            type="button"
            onClick={() => handleDeleteProduct(prod)}
            disabled={updateMutation.isPending || deleteMutation.isPending}
            aria-label={`Delete ${prod.name}`}
            className="rounded-lg p-2 text-rose-400 transition-colors hover:bg-rose-950/40 hover:text-rose-300 active:scale-95 disabled:opacity-50"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Package className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Products</h1>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Catalog inventory items, services, unit prices, and GST slab rates for invoicing.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center justify-center space-x-2 bg-primary hover:bg-violet-600 active:scale-95 transition-all text-white font-semibold py-2.5 px-5 rounded-xl text-sm shadow-md shrink-0"
        >
          <Plus size={16} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Products Data Table Component */}
      <DataTable<ProductDto>
        columns={columns}
        data={products}
        isLoading={isLoading}
        keyExtractor={(item) => item.id}
        emptyState={{
          title: 'No Products Cataloged',
          description:
            'Your catalog currently contains no inventory items or services. Add your first product to enable fast line-item selection during GST invoicing.',
          action: (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="mt-2 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow transition-all hover:bg-violet-600 active:scale-95"
            >
              <Plus size={14} />
              <span>Add First Product</span>
            </button>
          ),
        }}
      />

      {/* Create / Edit Product Modal Drawer Component */}
      <ModalDrawer
        isOpen={isFormOpen}
        onClose={handleCloseModal}
        title={activeProduct ? 'Edit Product Item' : 'New Product Item'}
        description={
          activeProduct
            ? `Update unit price, SKU, and GST specifications for ${activeProduct.name}.`
            : 'Add a new inventory item or service to your catalog for billing and GST calculation.'
        }
        maxWidth="max-w-xl"
        position="modal"
      >
        <div className="pt-2">
          <ProductForm
            initialData={activeProduct || undefined}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseModal}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </div>
      </ModalDrawer>
    </div>
  );
}
