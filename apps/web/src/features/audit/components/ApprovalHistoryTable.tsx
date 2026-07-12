'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../../lib/api-client';
import { DataTable, ColumnDef } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/ui/StatusBadge';

export interface ApprovalHistoryLedgerItem {
  id: string;
  tenantId: string;
  entityType: string;
  entityId: string;
  workflowType: string;
  status: string;
  requestedBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
  decidedBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
  decisionNote?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalHistoryResponse {
  message?: string;
  data?: {
    data?: ApprovalHistoryLedgerItem[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  } | ApprovalHistoryLedgerItem[];
}

export function ApprovalHistoryTable() {
  const [page, setPage] = useState<number>(1);
  const limit = 15;

  const { data: responseData, isLoading, isError } = useQuery<ApprovalHistoryResponse, Error>({
    queryKey: ['approval-history-ledger', page, limit],
    queryFn: () => api.get(`/approvals?status=APPROVED,REJECTED&page=${page}&limit=${limit}`),
  });

  let rawData: ApprovalHistoryLedgerItem[] = [];
  let totalPages = 1;

  if (responseData && typeof responseData === 'object' && 'data' in responseData && responseData.data) {
    if (Array.isArray(responseData.data)) {
      rawData = responseData.data;
    } else if (typeof responseData.data === 'object' && 'data' in responseData.data && Array.isArray(responseData.data.data)) {
      rawData = responseData.data.data;
      if (responseData.data.pagination?.totalPages) {
        totalPages = responseData.data.pagination.totalPages;
      }
    }
  }

  const columns: ColumnDef<ApprovalHistoryLedgerItem>[] = [
    {
      header: 'Decision Date',
      accessorKey: 'updatedAt',
      cell: (item) => (
        <span className="text-xs font-mono text-on-surface-variant whitespace-nowrap">
          {new Date(item.updatedAt || item.createdAt).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </span>
      ),
    },
    {
      header: 'Decision Badge',
      accessorKey: 'status',
      cell: (item) => (
        <StatusBadge
          status={item.status}
          variant={item.status === 'APPROVED' ? 'success' : item.status === 'REJECTED' ? 'danger' : 'neutral'}
          size="sm"
          label={item.status}
        />
      ),
    },
    {
      header: 'Workflow Type',
      accessorKey: 'workflowType',
      cell: (item) => <span className="font-semibold text-xs text-on-surface uppercase tracking-wide">{item.workflowType}</span>,
    },
    {
      header: 'Target Entity',
      accessorKey: 'entityType',
      cell: (item) => (
        <div className="flex flex-col">
          <span className="font-medium text-on-surface text-sm">{item.entityType}</span>
          <span className="text-[10px] text-on-surface-variant font-mono">ID: {item.entityId.slice(0, 8)}...</span>
        </div>
      ),
    },
    {
      header: 'Requested By',
      accessorKey: 'requestedBy',
      cell: (item) => (
        <div className="flex flex-col">
          <span className="font-medium text-on-surface text-xs">{item.requestedBy?.name || 'Unknown'}</span>
          {item.requestedBy?.email && <span className="text-[10px] text-on-surface-variant">{item.requestedBy.email}</span>}
        </div>
      ),
    },
    {
      header: 'Decided By & Note',
      accessorKey: 'decidedBy',
      cell: (item) => (
        <div className="flex flex-col max-w-xs">
          <span className="font-semibold text-on-surface text-xs">{item.decidedBy?.name || 'System / Auto'}</span>
          {item.decisionNote && (
            <span className="text-[11px] text-on-surface-variant italic truncate mt-0.5">&ldquo;{item.decisionNote}&rdquo;</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={rawData}
        isLoading={isLoading}
        keyExtractor={(item) => item.id}
        emptyState={{
          title: isError ? 'Error Loading Approvals' : 'No Approval History',
          description: isError
            ? 'Failed to fetch approval history from server.'
            : 'No audit events recorded for the selected filter range.',
        }}
      />

      {/* Pagination Controls */}
      {!isLoading && rawData.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl text-xs font-label-md text-on-surface-variant">
          <span>
            Page <strong className="text-on-surface">{page}</strong> of <strong className="text-on-surface">{totalPages}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded border border-outline-variant hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded border border-outline-variant hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
