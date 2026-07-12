'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CustomerDto } from '@vyapaarai/shared-types';
import { Plus, Trash2, Edit3, Mail, Phone, MapPin, FileCheck, Users } from 'lucide-react';
import api from '../../../lib/api-client';
import { DataTable, ColumnDef } from '../../../components/ui/DataTable';
import { ModalDrawer } from '../../../components/ui/ModalDrawer';
import { useToast } from '../../../components/ui/Toast';
import { CustomerForm, CustomerFormData } from './CustomerForm';

interface CustomersApiResponse {
  message?: string;
  data?: CustomerDto[];
}

interface SingleCustomerApiResponse {
  message?: string;
  data?: CustomerDto;
}

export function CustomerManager() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeCustomer, setActiveCustomer] = useState<CustomerDto | null>(null);

  // Queries
  const { data: customersRes, isLoading } = useQuery<CustomersApiResponse | CustomerDto[]>({
    queryKey: ['customers'],
    queryFn: () => api.get('/customers'),
  });

  const customers: CustomerDto[] = Array.isArray(customersRes)
    ? customersRes
    : (customersRes as CustomersApiResponse)?.data || [];

  // Mutations
  const createMutation = useMutation<SingleCustomerApiResponse | CustomerDto, Error, CustomerFormData>({
    mutationFn: (newCustomer) => api.post('/customers', newCustomer),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsFormOpen(false);
      setActiveCustomer(null);
      const createdName = (res as SingleCustomerApiResponse)?.data?.name || 'Customer';
      success('Customer Registered', `${createdName} profile has been successfully created.`);
    },
    onError: (err: Error) => {
      error('Registration Failed', err.message || 'Failed to create customer profile');
    },
  });

  const updateMutation = useMutation<SingleCustomerApiResponse | CustomerDto, Error, { id: string; data: CustomerFormData }>({
    mutationFn: ({ id, data }) => api.patch(`/customers/${id}`, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsFormOpen(false);
      setActiveCustomer(null);
      const updatedName = (res as SingleCustomerApiResponse)?.data?.name || 'Customer';
      success('Customer Updated', `Profile for ${updatedName} has been updated.`);
    },
    onError: (err: Error) => {
      error('Update Failed', err.message || 'Failed to update customer profile');
    },
  });

  const deleteMutation = useMutation<SingleCustomerApiResponse | CustomerDto, Error, string>({
    mutationFn: (id: string) => api.delete(`/customers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      success('Customer Removed', 'Customer profile has been permanently deleted.');
    },
    onError: (err: Error) => {
      error('Deletion Failed', err.message || 'Failed to delete customer profile');
    },
  });

  const handleOpenCreate = () => {
    setActiveCustomer(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (customer: CustomerDto) => {
    setActiveCustomer(customer);
    setIsFormOpen(true);
  };

  const handleCloseModal = () => {
    setIsFormOpen(false);
    setActiveCustomer(null);
  };

  const handleFormSubmit = async (formData: CustomerFormData) => {
    if (activeCustomer) {
      await updateMutation.mutateAsync({ id: activeCustomer.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleDeleteCustomer = (customer: CustomerDto) => {
    if (window.confirm(`Are you sure you want to delete customer "${customer.name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(customer.id);
    }
  };

  const columns: ColumnDef<CustomerDto>[] = [
    {
      header: 'Customer Details',
      accessorKey: 'name',
      cell: (cust) => (
        <div>
          <div className="font-bold text-on-surface tracking-wide">{cust.name}</div>
          {cust.address && (
            <div className="flex items-center text-xs text-on-surface-variant mt-1 max-w-xs truncate">
              <MapPin size={12} className="mr-1 shrink-0 text-on-surface-variant/60" />
              <span>{cust.address}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'GSTIN',
      accessorKey: 'gstin',
      cell: (cust) =>
        cust.gstin ? (
          <div className="flex items-center space-x-1.5 rounded-md bg-green-50 border border-green-200 px-2.5 py-1 w-fit">
            <FileCheck size={14} className="text-green-600 shrink-0" />
            <span className="font-mono text-xs font-semibold text-green-700">{cust.gstin}</span>
          </div>
        ) : (
          <span className="rounded bg-surface-container border border-outline-variant px-2 py-0.5 text-xs font-medium text-on-surface-variant">
            Unregistered
          </span>
        ),
    },
    {
      header: 'Contact Info',
      accessorKey: 'email',
      cell: (cust) => (
        <div className="space-y-1 text-xs text-on-surface">
          {cust.email && (
            <div className="flex items-center">
              <Mail size={12} className="mr-1.5 text-on-surface-variant/70 shrink-0" />
              <span className="truncate max-w-[180px]">{cust.email}</span>
            </div>
          )}
          {cust.phone && (
            <div className="flex items-center">
              <Phone size={12} className="mr-1.5 text-on-surface-variant/70 shrink-0" />
              <span className="font-mono">{cust.phone}</span>
            </div>
          )}
          {!cust.email && !cust.phone && (
            <span className="text-on-surface-variant/50 italic">No contact details</span>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (cust) => (
        <div className="flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={() => handleOpenEdit(cust)}
            disabled={updateMutation.isPending || deleteMutation.isPending}
            aria-label={`Edit ${cust.name}`}
            className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface active:scale-95 disabled:opacity-50"
          >
            <Edit3 size={16} />
          </button>
          <button
            type="button"
            onClick={() => handleDeleteCustomer(cust)}
            disabled={updateMutation.isPending || deleteMutation.isPending}
            aria-label={`Delete ${cust.name}`}
            className="rounded-lg p-2 text-error transition-colors hover:bg-error/10 hover:text-error active:scale-95 disabled:opacity-50"
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
            <Users className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Customers</h1>
          </div>
          <p className="text-on-surface-variant text-sm mt-1">
            Register, manage, and audit your SMB customer profiles and GSTIN records.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center justify-center space-x-2 bg-primary hover:bg-violet-600 active:scale-95 transition-all text-white font-semibold py-2.5 px-5 rounded-xl text-sm shadow-md shrink-0"
        >
          <Plus size={16} />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Customers Data Table Component */}
      <DataTable<CustomerDto>
        columns={columns}
        data={customers}
        isLoading={isLoading}
        keyExtractor={(item) => item.id}
        emptyState={{
          title: 'No Customers Registered',
          description:
            'Your business has no customer profiles recorded yet. Register your first SMB customer profile to enable GST invoicing and ledger tracking.',
          action: (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="mt-2 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow transition-all hover:bg-violet-600 active:scale-95"
            >
              <Plus size={14} />
              <span>Add First Customer</span>
            </button>
          ),
        }}
      />

      {/* Create / Edit Customer Modal Drawer Component */}
      <ModalDrawer
        isOpen={isFormOpen}
        onClose={handleCloseModal}
        title={activeCustomer ? 'Edit Customer Profile' : 'New Customer Profile'}
        description={
          activeCustomer
            ? `Update profile details and GSTIN records for ${activeCustomer.name}.`
            : 'Register a new SMB customer profile for GST compliance and automated invoicing.'
        }
        maxWidth="max-w-xl"
        position="modal"
      >
        <div className="pt-2">
          <CustomerForm
            initialData={activeCustomer || undefined}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseModal}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </div>
      </ModalDrawer>
    </div>
  );
}
