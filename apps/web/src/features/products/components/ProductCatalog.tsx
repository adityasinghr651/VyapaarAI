'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/api-client';
import { Plus, Trash2, Layers, HelpCircle } from 'lucide-react';

export function ProductCatalog() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [gstRate, setGstRate] = useState('18.00'); // default to 18% static GST
  const [formError, setFormError] = useState<string | null>(null);

  // Queries
  const { data: productsRes, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.get('/products'),
  });

  const products = (productsRes as any)?.data || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: (newProduct: any) => api.post('/products', newProduct),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowAddForm(false);
      setName('');
      setDescription('');
      setSku('');
      setPrice('');
      setGstRate('18.00');
      setFormError(null);
    },
    onError: (err: any) => {
      setFormError(err.message || 'Failed to create product');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Product name is required');
      return;
    }
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setFormError('Please enter a valid price (>= 0)');
      return;
    }
    createMutation.mutate({
      name,
      description: description || undefined,
      sku: sku || undefined,
      price: parsedPrice,
      gstRate: parseFloat(gstRate),
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Products</h1>
          <p className="text-muted-foreground text-sm">Inventory stock items catalog for invoicing.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2 bg-primary hover:bg-violet-600 active:scale-95 transition-all text-white font-semibold py-2 px-4 rounded-lg text-sm"
        >
          <Plus size={16} />
          <span>{showAddForm ? 'Cancel' : 'Add Product'}</span>
        </button>
      </div>

      {showAddForm && (
        <div className="glass-panel p-6 rounded-xl animate-in fade-in slide-in-from-top-4 duration-200">
          <h3 className="text-lg font-bold text-white mb-4">New Product Details</h3>
          {formError && (
            <div className="mb-4 p-3 bg-red-950/40 border border-red-900/60 rounded text-red-400 text-xs">
              {formError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Item Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="glass-input w-full p-2.5 rounded-lg text-sm text-white focus:outline-none"
                placeholder="Enterprise Developer Laptop"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                SKU / Part Number
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="glass-input w-full p-2.5 rounded-lg text-sm text-white focus:outline-none"
                placeholder="PROD-LAPTOP-01"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Unit Price (INR) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="glass-input w-full p-2.5 rounded-lg text-sm text-white focus:outline-none"
                placeholder="85000.00"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                GST Rate (%)
              </label>
              <select
                value={gstRate}
                onChange={(e) => setGstRate(e.target.value)}
                className="glass-input w-full p-2.5 rounded-lg text-sm text-white focus:outline-none bg-slate-900"
              >
                <option value="18.00">18% (Standard Services/Goods)</option>
                <option value="12.00">12% (IT Accessories/Hardware)</option>
                <option value="28.00">28% (Luxury Goods)</option>
                <option value="5.00">5% (Essential Goods)</option>
                <option value="0.00">0% (Exempt)</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Item Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="glass-input w-full p-2.5 rounded-lg text-sm text-white focus:outline-none h-20"
                placeholder="Details of the product specifications..."
              />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="py-2.5 px-6 bg-primary hover:bg-violet-600 active:scale-95 transition-all text-white font-semibold rounded-lg text-sm"
              >
                {createMutation.isPending ? 'Saving...' : 'Save Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products list */}
      <div className="glass-panel rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">No products cataloged yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-900 bg-slate-950/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">Product details</th>
                  <th className="p-4">SKU / Code</th>
                  <th className="p-4">Tax rate</th>
                  <th className="p-4">Unit price</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 text-sm">
                {products.map((prod: any) => (
                  <tr key={prod.id} className="hover:bg-slate-900/20 transition-all">
                    <td className="p-4">
                      <div className="font-semibold text-white">{prod.name}</div>
                      {prod.description && (
                        <div className="flex items-center text-xs text-slate-500 mt-1 max-w-sm truncate">
                          <HelpCircle size={10} className="mr-1 shrink-0" />
                          <span>{prod.description}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      {prod.sku ? (
                        <div className="flex items-center space-x-1">
                          <Layers size={14} className="text-slate-500" />
                          <span className="font-mono text-xs text-slate-300">{prod.sku}</span>
                        </div>
                      ) : (
                        <span className="text-slate-600 text-xs font-medium">None</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="text-xs bg-indigo-950/40 text-indigo-400 border border-indigo-900/60 px-1.5 py-0.5 rounded font-medium">
                        {parseFloat(prod.gstRate).toFixed(1)}% GST
                      </span>
                    </td>
                    <td className="p-4 font-mono font-semibold text-white">
                      ₹{parseFloat(prod.price).toFixed(2)}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Delete product ${prod.name}?`)) {
                            deleteMutation.mutate(prod.id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                        className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-950/20 active:scale-90 transition-all disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
