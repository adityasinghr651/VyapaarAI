'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PendingApprovalDto } from '@vyapaarai/shared-types';
import api from '../../../lib/api-client';
import { useToast } from '../../../components/ui/Toast';
import { ConversationList, ConversationItem } from './ConversationList';
import { ConfidenceBadge } from './ConfidenceBadge';
import { ExtractionForm, ExtractionFormData } from './ExtractionForm';
import { ActionToolbar } from './ActionToolbar';

interface ApprovalsApiResponse {
  message?: string;
  data?: PendingApprovalDto[];
}

interface SingleApprovalApiResponse {
  message?: string;
  data?: PendingApprovalDto;
}

const DEFAULT_ITEMS: ConversationItem[] = [
  {
    id: 'sample-1',
    sender: 'Rahul Traders',
    time: '10:42 AM',
    message: 'I need 50 bags of Cement, GST invoice please.',
    status: 'Extracted',
  },
  {
    id: 'sample-2',
    sender: 'Shri Ram Electronics',
    time: 'Yesterday',
    message: 'Attach invoice for 2 laptops bought last week.',
    status: 'Processing',
  },
  {
    id: 'sample-3',
    sender: '+91 98765 43210',
    time: 'Mon',
    message: 'Hello, what are your shop timings today?',
    status: 'No Actionable Data',
  },
];

export function ApprovalsQueue() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  // Query API
  const { data: approvalsRes, isLoading } = useQuery<ApprovalsApiResponse | PendingApprovalDto[]>({
    queryKey: ['approvals'],
    queryFn: () => api.get('/approvals'),
  });

  const approvals: PendingApprovalDto[] = Array.isArray(approvalsRes)
    ? approvalsRes
    : (approvalsRes as ApprovalsApiResponse)?.data || [];

  // Construct combined items
  const liveItems: ConversationItem[] = approvals.map((appr) => ({
    id: appr.id,
    sender: appr.requestedByName || `Entity #${appr.entityId || appr.id.slice(0, 6)}`,
    time: new Date(appr.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    message: typeof appr.payload === 'object' && appr.payload !== null && 'message' in appr.payload
      ? String((appr.payload as Record<string, unknown>).message)
      : `Extraction payload ready for ${appr.entityType} (${appr.workflowType})`,
    status: 'Extracted',
    rawItem: appr,
  }));

  const allItems = liveItems.length > 0 ? liveItems : DEFAULT_ITEMS;

  const [selectedItem, setSelectedItem] = useState<ConversationItem | null>(null);
  const [formData, setFormData] = useState<ExtractionFormData>({
    customerName: 'Rahul Traders',
    product: 'Cement',
    quantity: 50,
    gstRate: 18,
  });

  useEffect(() => {
    if (!selectedItem && allItems.length > 0) {
      setSelectedItem(allItems[0]);
    }
  }, [allItems, selectedItem]);

  useEffect(() => {
    if (selectedItem) {
      if (selectedItem.rawItem) {
        const raw = selectedItem.rawItem as PendingApprovalDto;
        const payload = (raw.payload || {}) as Record<string, unknown>;
        setFormData({
          customerName: String(payload.customerName || selectedItem.sender || 'Unknown Customer'),
          product: String(payload.product || 'Extracted Item'),
          quantity: Number(payload.quantity) || 1,
          gstRate: Number(payload.gstRate) || 18,
        });
      } else if (selectedItem.id === 'sample-1') {
        setFormData({
          customerName: 'Rahul Traders',
          product: 'Cement',
          quantity: 50,
          gstRate: 18,
        });
      } else if (selectedItem.id === 'sample-2') {
        setFormData({
          customerName: 'Shri Ram Electronics',
          product: 'Laptop',
          quantity: 2,
          gstRate: 18,
        });
      } else {
        setFormData({
          customerName: selectedItem.sender,
          product: 'General Service',
          quantity: 1,
          gstRate: 18,
        });
      }
    }
  }, [selectedItem]);

  // Mutations
  const approveMutation = useMutation<
    SingleApprovalApiResponse | PendingApprovalDto,
    Error,
    { id: string; note?: string; payload?: Record<string, unknown> }
  >({
    mutationFn: ({ id, note, payload }) => api.post(`/approvals/${id}/approve`, { note, payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      success('Extraction Approved', 'AI extraction data verified and invoice generated.');
    },
    onError: (err: Error) => {
      error('Approval Failed', err.message || 'Failed to approve extraction item');
    },
  });

  const rejectMutation = useMutation<
    SingleApprovalApiResponse | PendingApprovalDto,
    Error,
    { id: string; note?: string }
  >({
    mutationFn: ({ id, note }) => api.post(`/approvals/${id}/reject`, { note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      success('Extraction Deleted', 'Extraction record removed.');
    },
    onError: (err: Error) => {
      error('Deletion Failed', err.message || 'Failed to delete extraction item');
    },
  });

  const handleApprove = async () => {
    if (!selectedItem) return;
    if (selectedItem.rawItem) {
      const raw = selectedItem.rawItem as PendingApprovalDto;
      await approveMutation.mutateAsync({
        id: raw.id,
        payload: { ...formData },
      });
    } else {
      success('Approved & Invoice Generated', `Invoice created for ${formData.customerName} (${formData.product}).`);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    if (selectedItem.rawItem) {
      const raw = selectedItem.rawItem as PendingApprovalDto;
      await rejectMutation.mutateAsync({ id: raw.id, note: 'Deleted by user in WhatsApp Activity view' });
    } else {
      success('Record Removed', `Extraction item for ${selectedItem.sender} dismissed.`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-container-max mx-auto h-[calc(100vh-80px)] flex flex-col animate-in fade-in duration-300">
      {/* 2-Column Split */}
      <div className="flex-1 overflow-hidden py-4 grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
        {/* Left Column: Conversation History (40%) */}
        <ConversationList
          items={allItems}
          selectedId={selectedItem?.id || null}
          onSelectItem={(item) => setSelectedItem(item)}
        />

        {/* Right Column: Structured Extraction Preview (60%) */}
        <section className="lg:col-span-7 flex flex-col h-full space-y-6 overflow-hidden">
          <ConfidenceBadge sourceName={selectedItem?.sender || 'Unknown Sender'} score={96} />
          <ExtractionForm data={formData} onChange={(updated) => setFormData(updated)} />
          <ActionToolbar
            onApprove={handleApprove}
            onDelete={handleDelete}
            isSubmitting={approveMutation.isPending || rejectMutation.isPending}
          />
        </section>
      </div>
    </div>
  );
}
