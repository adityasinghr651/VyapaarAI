'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/api-client';

export interface AuditLogEntry {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  icon: string;
  colorClass: string;
}

const DEFAULT_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-1',
    action: 'GSTR-1 Submitted',
    actor: 'by Admin',
    timestamp: 'Today, 10:42 AM',
    icon: 'task_alt',
    colorClass: 'bg-green-50 border-green-200 text-green-600',
  },
  {
    id: 'log-2',
    action: 'Invoice #402 edited',
    actor: 'by Accountant (Priya)',
    timestamp: 'Yesterday, 4:15 PM',
    icon: 'edit_document',
    colorClass: 'bg-blue-50 border-blue-200 text-blue-600',
  },
  {
    id: 'log-3',
    action: 'Successful Login',
    actor: 'from New IP (Mumbai)',
    timestamp: 'Yesterday, 9:00 AM',
    icon: 'security',
    colorClass: 'bg-amber-50 border-amber-200 text-amber-600',
  },
  {
    id: 'log-4',
    action: 'WhatsApp extraction approved',
    actor: 'by Owner',
    timestamp: 'Oct 24, 2:30 PM',
    icon: 'smart_toy',
    colorClass: 'bg-purple-50 border-purple-200 text-purple-600',
  },
  {
    id: 'log-5',
    action: 'GSTIN settings updated',
    actor: 'by Admin',
    timestamp: 'Oct 22, 11:15 AM',
    icon: 'settings',
    colorClass: 'bg-surface-variant border-outline-variant text-on-surface-variant',
  },
];

export function AuditTimeline() {
  const router = useRouter();
  const { data: logsRes } = useQuery<{ data?: AuditLogEntry[] } | AuditLogEntry[]>({
    queryKey: ['settings', 'audit'],
    queryFn: () => api.get('/settings/audit').catch(() => DEFAULT_AUDIT_LOGS),
  });

  const auditLogs: AuditLogEntry[] =
    (logsRes && 'data' in logsRes && Array.isArray(logsRes.data) && logsRes.data) ||
    (Array.isArray(logsRes) && logsRes) ||
    DEFAULT_AUDIT_LOGS;

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 flex flex-col h-[500px]">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface-variant">history</span>
          <h3 className="font-headline-md text-headline-md text-on-surface">Audit Log</h3>
        </div>
        <button
          type="button"
          onClick={() => {
            // Filter logs
          }}
          className="text-on-surface-variant hover:text-primary cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">filter_list</span>
        </button>
      </div>

      {/* Timeline Container */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-6 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-outline-variant before:to-transparent custom-scrollbar">
        {auditLogs.map((log) => {
          const parts = log.colorClass.split(' ');
          const bgBorder = parts.slice(0, 2).join(' ');
          const iconColor = parts[2] || 'text-on-surface-variant';

          return (
            <div key={log.id} className="relative flex items-start gap-4">
              <div
                className={`w-8 h-8 rounded-full ${bgBorder} border flex items-center justify-center z-10 shrink-0`}
              >
                <span className={`material-symbols-outlined ${iconColor} text-[16px]`}>{log.icon}</span>
              </div>
              <div className="pt-1">
                <p className="font-body-md text-body-md text-on-surface">
                  <span className="font-medium">{log.action}</span> {log.actor}
                </p>
                <p className="font-label-md text-label-md text-on-surface-variant mt-0.5 font-normal">
                  {log.timestamp}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => {
          router.push('/audit');
        }}
        className="w-full mt-4 py-2 text-center text-primary font-label-md text-label-md hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer"
      >
        View Full History
      </button>
    </div>
  );
}
