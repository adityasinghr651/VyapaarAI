'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PendingApprovalDto } from '@vyapaarai/shared-types';
import { ShieldCheck, Eye, Clock, User, Layers } from 'lucide-react';
import api from '../../../lib/api-client';
import { DataTable, ColumnDef } from '../../../components/ui/DataTable';
import { ModalDrawer } from '../../../components/ui/ModalDrawer';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { useToast } from '../../../components/ui/Toast';
import { ExtractionApprovalPanel } from './ExtractionApprovalPanel';

interface ApprovalsApiResponse {
  message?: string;
  data?: PendingApprovalDto[];
}

interface SingleApprovalApiResponse {
  message?: string;
  data?: PendingApprovalDto;
}

export function ApprovalsQueue() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const [selectedApproval, setSelectedApproval] = useState<PendingApprovalDto | null>(null);

  // Query
  const { data: approvalsRes, isLoading } = useQuery<ApprovalsApiResponse | PendingApprovalDto[]>({
    queryKey: ['approvals'],
    queryFn: () => api.get('/approvals'),
  });

  const approvals: PendingApprovalDto[] = Array.isArray(approvalsRes)
    ? approvalsRes
    : (approvalsRes as ApprovalsApiResponse)?.data || [];

  // Mutations
  const approveMutation = useMutation<
    SingleApprovalApiResponse | PendingApprovalDto,
    Error,
    { id: string; note?: string; payload?: Record<string, unknown> }
  >({
    mutationFn: ({ id, note, payload }) => api.post(`/approvals/${id}/approve`, { note, payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      setSelectedApproval(null);
      success('Extraction Approved', 'AI extraction data verified and committed to records.');
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
      setSelectedApproval(null);
      success('Extraction Rejected', 'Extraction item returned for correction or dismissal.');
    },
    onError: (err: Error) => {
      error('Rejection Failed', err.message || 'Failed to reject extraction item');
    },
  });

  const handleApproveItem = async (
    id: string,
    note?: string,
    modifiedPayload?: Record<string, unknown>
  ) => {
    await approveMutation.mutateAsync({ id, note, payload: modifiedPayload });
  };

  const handleRejectItem = async (id: string, note?: string) => {
    await rejectMutation.mutateAsync({ id, note });
  };

  const columns: ColumnDef<PendingApprovalDto>[] = [
    {
      header: 'Workflow & Entity',
      accessorKey: 'entityType',
      cell: (item) => (
        <div>
          <div className="flex items-center space-x-1.5 font-bold text-white tracking-wide">
            <Layers size={14} className="text-primary shrink-0" />
            <span>{item.entityType}</span>
          </div>
          <div className="text-xs text-slate-400 mt-0.5 font-mono">
            {item.workflowType} {item.entityId ? `(#${item.entityId.slice(0, 8)})` : ''}
          </div>
        </div>
      ),
    },
    {
      header: 'Requested By',
      accessorKey: 'requestedByName',
      cell: (item) => (
        <div className="space-y-1 text-xs text-slate-300">
          <div className="flex items-center font-semibold text-white">
            <User size={12} className="mr-1.5 text-slate-500 shrink-0" />
            <span>{item.requestedByName || 'System AI Service'}</span>
          </div>
          <div className="flex items-center text-slate-400">
            <Clock size={12} className="mr-1.5 text-slate-500 shrink-0" />
            <span>{new Date(item.createdAt).toLocaleString()}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Payload Summary',
      accessorKey: 'payload',
      cell: (item) => {
        const keys = item.payload ? Object.keys(item.payload) : [];
        return (
          <div className="flex flex-wrap gap-1 max-w-xs">
            {keys.slice(0, 4).map((k) => (
              <span
                key={k}
                className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300 truncate max-w-[120px]"
              >
                {k}
              </span>
            ))}
            {keys.length > 4 && (
              <span className="rounded bg-slate-900 border border-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-500">
                +{keys.length - 4} more
              </span>
            )}
            {keys.length === 0 && (
              <span className="text-xs text-slate-600 italic">Empty payload</span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Review Status',
      accessorKey: 'status',
      cell: (item) => <StatusBadge status={item.status} size="sm" showIndicator />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (item) => (
        <div className="flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={() => setSelectedApproval(item)}
            disabled={approveMutation.isPending || rejectMutation.isPending}
            aria-label={`Review ${item.entityType} extraction`}
            className="flex items-center space-x-1.5 rounded-lg bg-primary/10 border border-primary/30 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-white active:scale-95 disabled:opacity-50"
          >
            <Eye size={14} />
            <span>Review</span>
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
            <ShieldCheck className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Approvals Queue</h1>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Human-in-the-loop verification queue for AI-extracted invoice and document payloads.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-950/60 border border-slate-900 px-3.5 py-2 rounded-xl">
          <Clock size={14} className="text-amber-400 shrink-0" />
          <span>Pending verification items requiring audit sign-off</span>
        </div>
      </div>

      {/* Approvals Data Table Component */}
      <DataTable<PendingApprovalDto>
        columns={columns}
        data={approvals}
        isLoading={isLoading}
        keyExtractor={(item) => item.id}
        emptyState={{
          title: 'No Pending Approvals',
          description:
            'All AI document extraction items have been reviewed and verified. When new scanned receipts or invoices require human audit verification, they will appear here automatically.',
        }}
      />

      {/* Human-in-the-Loop Extraction Approval Modal Drawer */}
      <ModalDrawer
        isOpen={!!selectedApproval}
        onClose={() => setSelectedApproval(null)}
        title={selectedApproval ? `Extraction Audit (${selectedApproval.entityType})` : 'Extraction Audit'}
        description="Inspect AI-extracted document fields, verify accuracy against source files, and approve or reject."
        maxWidth="max-w-3xl"
        position="modal"
      >
        {selectedApproval && (
          <div className="pt-2">
            <ExtractionApprovalPanel
              approval={selectedApproval}
              onApprove={handleApproveItem}
              onReject={handleRejectItem}
              isLoading={approveMutation.isPending || rejectMutation.isPending}
            />
          </div>
        )}
      </ModalDrawer>
    </div>
  );
}
