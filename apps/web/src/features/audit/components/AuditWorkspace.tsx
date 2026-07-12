'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Role } from '@vyapaarai/shared-types';
import { History, ShieldAlert, CheckSquare, FileSearch } from 'lucide-react';
import { useStore } from '../../../store/useStore';
import { useToast } from '../../../components/ui/Toast';
import { AuditFilterBar, AuditFilterValues } from './AuditFilterBar';
import { AuditLogLedgerTable } from './AuditLogLedgerTable';
import { ApprovalHistoryTable } from './ApprovalHistoryTable';

export function AuditWorkspace() {
  const router = useRouter();
  const user = useStore((state) => state.user);
  const { error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState<'audit' | 'approvals'>('audit');
  const [filters, setFilters] = useState<AuditFilterValues>({
    entityType: 'ALL',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (user && user.role === Role.STAFF) {
      toastError('Access Denied (403)', 'You do not have permission to access the system audit workspace.');
      router.replace('/dashboard');
    }
  }, [user, router, toastError]);

  if (!user || user.role === Role.STAFF) {
    return null;
  }

  const isReadOnly = user.role === Role.ACCOUNTANT;

  return (
    <div className="p-gutter lg:p-margin-page max-w-container-max mx-auto w-full space-y-6 animate-in fade-in duration-300">
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">policy</span>
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">
              System Audit &amp; Compliance Ledger
            </h1>
          </div>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-1 max-w-3xl">
            Complete immutable record of all system events, workflow approvals, API requests, and user modifications across your organization.
          </p>
        </div>

        {isReadOnly && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0">
            <ShieldAlert size={15} className="text-amber-600" />
            <span>ACCOUNTANT ROLE (READ-ONLY)</span>
          </div>
        )}
      </div>

      {/* Workspace Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant">
        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-3 font-label-lg text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === 'audit'
              ? 'border-primary text-primary font-bold bg-primary/5'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <History size={16} />
          <span>System Audit Ledger</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('approvals')}
          className={`flex items-center gap-2 px-4 py-3 font-label-lg text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === 'approvals'
              ? 'border-primary text-primary font-bold bg-primary/5'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <CheckSquare size={16} />
          <span>Approval Decisions Ledger</span>
        </button>
      </div>

      {/* Tab 1: System Audit Ledger */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <AuditFilterBar
            filters={filters}
            onChange={(newFilters) => setFilters(newFilters)}
            onReset={() => setFilters({ entityType: 'ALL', startDate: '', endDate: '' })}
          />
          <AuditLogLedgerTable filters={filters} />
        </div>
      )}

      {/* Tab 2: Approval Decisions Ledger */}
      {activeTab === 'approvals' && (
        <div className="space-y-6">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex items-center gap-3 text-xs text-on-surface-variant">
            <FileSearch size={16} className="text-primary shrink-0" />
            <span>
              Displaying all historical compliance extraction and workflow decisions (<strong>APPROVED</strong> &amp;{' '}
              <strong>REJECTED</strong>) processed by organization officers.
            </span>
          </div>
          <ApprovalHistoryTable />
        </div>
      )}
    </div>
  );
}
