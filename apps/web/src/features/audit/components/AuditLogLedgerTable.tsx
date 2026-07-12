'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../../lib/api-client';
import { DataTable, ColumnDef } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { ModalDrawer } from '../../../components/ui/ModalDrawer';
import { AuditFilterValues } from './AuditFilterBar';

export interface AuditLogLedgerItem {
  id: string;
  tenantId: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  actorId?: string | null;
  actor?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  requestId?: string | null;
  traceId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface AuditLogResponse {
  message?: string;
  data?: {
    data?: AuditLogLedgerItem[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  } | AuditLogLedgerItem[];
}

export interface AuditLogLedgerTableProps {
  filters: AuditFilterValues;
}

export function AuditLogLedgerTable({ filters }: AuditLogLedgerTableProps) {
  const [page, setPage] = useState<number>(1);
  const limit = 15;
  const [selectedMetadata, setSelectedMetadata] = useState<{
    isOpen: boolean;
    data: Record<string, unknown> | null;
    action: string;
    id: string;
  }>({
    isOpen: false,
    data: null,
    action: '',
    id: '',
  });

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (filters.entityType && filters.entityType !== 'ALL') {
    queryParams.append('entityType', filters.entityType);
  }
  if (filters.startDate) {
    queryParams.append('startDate', filters.startDate);
  }
  if (filters.endDate) {
    queryParams.append('endDate', filters.endDate);
  }

  const { data: responseData, isLoading, isError } = useQuery<AuditLogResponse, Error>({
    queryKey: ['audit-logs', page, limit, filters.entityType, filters.startDate, filters.endDate],
    queryFn: () => api.get(`/audit?${queryParams.toString()}`),
  });

  let rawData: AuditLogLedgerItem[] = [];
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

  const columns: ColumnDef<AuditLogLedgerItem>[] = [
    {
      header: 'Timestamp',
      accessorKey: 'createdAt',
      cell: (item) => (
        <span className="text-xs font-mono text-on-surface-variant whitespace-nowrap">
          {new Date(item.createdAt).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </span>
      ),
    },
    {
      header: 'Entity Badge',
      accessorKey: 'entityType',
      cell: (item) => <StatusBadge status={item.entityType} variant="info" size="sm" label={item.entityType} />,
    },
    {
      header: 'Action',
      accessorKey: 'action',
      cell: (item) => (
        <div className="flex flex-col">
          <span className="font-medium text-on-surface text-sm">{item.action}</span>
          {item.entityId && (
            <span className="text-[10px] text-on-surface-variant font-mono">ID: {item.entityId.slice(0, 8)}...</span>
          )}
        </div>
      ),
    },
    {
      header: 'Actor',
      accessorKey: 'actor',
      cell: (item) => (
        <div className="flex flex-col">
          <span className="font-semibold text-on-surface text-xs">{item.actor?.name || 'System / Auto'}</span>
          {item.actor?.email && <span className="text-[10px] text-on-surface-variant">{item.actor.email}</span>}
        </div>
      ),
    },
    {
      header: 'IP Address',
      accessorKey: 'ipAddress',
      cell: (item) => (
        <span className="font-mono text-xs text-on-surface-variant">{item.ipAddress || 'Internal/CLI'}</span>
      ),
    },
    {
      header: 'Metadata',
      cell: (item) => (
        <button
          type="button"
          onClick={() =>
            setSelectedMetadata({
              isOpen: true,
              data: item.metadata || { note: 'No additional metadata attached.' },
              action: item.action,
              id: item.id,
            })
          }
          className="flex items-center gap-1.5 text-xs font-label-md text-[#004ac6] hover:bg-[#004ac6]/10 px-2.5 py-1 rounded-md transition-colors cursor-pointer border border-[#004ac6]/20"
        >
          <FileText size={13} />
          <span>View Metadata</span>
        </button>
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
          title: isError ? 'Error Loading Logs' : 'No Audit Events',
          description: isError
            ? 'Failed to fetch audit events from server.'
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

      {/* View Metadata ModalDrawer */}
      <ModalDrawer
        isOpen={selectedMetadata.isOpen}
        onClose={() => setSelectedMetadata((prev) => ({ ...prev, isOpen: false }))}
        title={`Metadata: ${selectedMetadata.action}`}
        description={`Event ID: ${selectedMetadata.id}`}
        maxWidth="max-w-xl"
        position="modal"
        footer={
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setSelectedMetadata((prev) => ({ ...prev, isOpen: false }))}
              className="bg-primary text-white font-label-md px-4 py-2 rounded-lg text-xs hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Close Metadata
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-on-surface-variant">
            Immutable structured JSON metadata payload captured for this audit event:
          </p>
          <pre className="bg-surface-container-low p-4 rounded-lg overflow-x-auto text-xs font-mono text-on-surface border border-outline-variant max-h-96">
            {JSON.stringify(selectedMetadata.data, null, 2)}
          </pre>
        </div>
      </ModalDrawer>
    </div>
  );
}
