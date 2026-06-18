'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/api-client';
import { Plus, Trash2, Mail, Phone, MapPin, FileCheck } from 'lucide-react';

export function CustomerManager() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [gstin, setGstin] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Queries
  const { data: customersRes, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => api.get('/customers'),
  });

  const customers = (customersRes as any)?.data || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: (newCustomer: any) => api.post('/customers', newCustomer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setShowAddForm(false);
      // reset form
      setName('');
      setEmail('');
      setPhone('');
      setAddress('');
      setGstin('');
      setFormError(null);
    },
    onError: (err: any) => {
      setFormError(err.message || 'Failed to create customer');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/customers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Customer name is required');
      return;
    }
    createMutation.mutate({
      name,
      email: email || undefined,
      phone: phone || undefined,
      address: address || undefined,
      gstin: gstin || undefined,
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Customers</h1>
          <p className="text-muted-foreground text-sm">Register and manage SMB customer profiles.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2 bg-primary hover:bg-violet-600 active:scale-95 transition-all text-white font-semibold py-2 px-4 rounded-lg text-sm"
        >
          <Plus size={16} />
          <span>{showAddForm ? 'Cancel' : 'Add Customer'}</span>
        </button>
      </div>

      {showAddForm && (
        <div className="glass-panel p-6 rounded-xl animate-in fade-in slide-in-from-top-4 duration-200">
          <h3 className="text-lg font-bold text-white mb-4">New Customer Details</h3>
          {formError && (
            <div className="mb-4 p-3 bg-red-950/40 border border-red-900/60 rounded text-red-400 text-xs">
              {formError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Company Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="glass-input w-full p-2.5 rounded-lg text-sm text-white focus:outline-none"
                placeholder="ACME Corporation"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                GSTIN (Optional)
              </label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="glass-input w-full p-2.5 rounded-lg text-sm text-white focus:outline-none"
                placeholder="09AAACA1111A1Z1"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input w-full p-2.5 rounded-lg text-sm text-white focus:outline-none"
                placeholder="billing@acme.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="glass-input w-full p-2.5 rounded-lg text-sm text-white focus:outline-none"
                placeholder="+91 99999 99999"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Billing Address
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="glass-input w-full p-2.5 rounded-lg text-sm text-white focus:outline-none h-20"
                placeholder="123 Industrial Area, Sector 5..."
              />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="py-2.5 px-6 bg-primary hover:bg-violet-600 active:scale-95 transition-all text-white font-semibold rounded-lg text-sm"
              >
                {createMutation.isPending ? 'Saving...' : 'Save Customer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Customers List */}
      <div className="glass-panel rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading customers...</div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">No customers registered yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-900 bg-slate-950/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">GSTIN</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 text-sm">
                {customers.map((cust: any) => (
                  <tr key={cust.id} className="hover:bg-slate-900/20 transition-all">
                    <td className="p-4">
                      <div className="font-semibold text-white">{cust.name}</div>
                      {cust.address && (
                        <div className="flex items-center text-xs text-slate-500 mt-1 max-w-xs truncate">
                          <MapPin size={10} className="mr-1 shrink-0" />
                          <span>{cust.address}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-slate-300">
                      {cust.gstin ? (
                        <div className="flex items-center space-x-1">
                          <FileCheck size={14} className="text-emerald-400" />
                          <span className="font-mono text-xs">{cust.gstin}</span>
                        </div>
                      ) : (
                        <span className="text-slate-600 text-xs font-medium">Unregistered</span>
                      )}
                    </td>
                    <td className="p-4 space-y-1 text-xs text-slate-400">
                      {cust.email && (
                        <div className="flex items-center">
                          <Mail size={12} className="mr-1.5 text-slate-500" />
                          <span>{cust.email}</span>
                        </div>
                      )}
                      {cust.phone && (
                        <div className="flex items-center">
                          <Phone size={12} className="mr-1.5 text-slate-500" />
                          <span>{cust.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Delete customer ${cust.name}?`)) {
                            deleteMutation.mutate(cust.id);
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
