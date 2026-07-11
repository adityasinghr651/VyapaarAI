'use client';

import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { PendingApprovalDto, ApprovalStatus } from '@vyapaarai/shared-types';
import { Check, X, Eye, Clock, User, AlertCircle, Edit3 } from 'lucide-react';
import { GlassCard } from '../../../components/ui/GlassCard';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { ModalDrawer } from '../../../components/ui/ModalDrawer';
import { InputFormField } from '../../../components/ui/InputFormField';
import { useToast } from '../../../components/ui/Toast';

export interface ExtractionApprovalPanelProps {
  approval: PendingApprovalDto;
  onApprove?: (
    id: string,
    note?: string,
    modifiedPayload?: Record<string, unknown>
  ) => void | Promise<void>;
  onReject?: (id: string, note?: string) => void | Promise<void>;
  isLoading?: boolean;
  className?: string;
}

export function ExtractionApprovalPanel({
  approval,
  onApprove,
  onReject,
  isLoading = false,
  className,
}: ExtractionApprovalPanelProps) {
  const { success, error, info } = useToast();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'approve' | 'reject' | 'inspect'>('inspect');
  const [decisionNote, setDecisionNote] = useState(approval.decisionNote || '');
  const [editablePayload, setEditablePayload] = useState<Record<string, unknown>>({
    ...approval.payload,
  });

  // Synchronize state when switching between different approval workflow items (approval.id)
  useEffect(() => {
    setEditablePayload({ ...approval.payload });
    setDecisionNote(approval.decisionNote || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approval.id]);

  const isPending = approval.status === ApprovalStatus.PENDING;

  const handleOpenModal = (mode: 'approve' | 'reject' | 'inspect') => {
    // Take a fresh snapshot of the payload right before the reviewer begins inspecting/editing
    setEditablePayload({ ...approval.payload });
    setDecisionNote(approval.decisionNote || '');
    setModalMode(mode);
    setIsReviewModalOpen(true);
  };

  const handlePayloadFieldChange = (key: string, value: string) => {
    setEditablePayload((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleConfirmDecision = async () => {
    try {
      if (modalMode === 'reject') {
        if (!decisionNote.trim()) {
          error('Decision note required', 'Please provide a reason for rejecting this extraction.');
          return;
        }
        await onReject?.(approval.id, decisionNote);
        info('Extraction rejected', `Approval request ${approval.id} has been rejected.`);
      } else if (modalMode === 'approve') {
        // Parse back any stringified JSON objects or arrays edited in the inputs
        const finalPayload: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(editablePayload)) {
          if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
            try {
              finalPayload[key] = JSON.parse(val);
            } catch {
              finalPayload[key] = val;
            }
          } else {
            finalPayload[key] = val;
          }
        }

        await onApprove?.(approval.id, decisionNote || undefined, finalPayload);
        success('Extraction approved', `Approval request ${approval.id} has been signed off.`);
      }
      setIsReviewModalOpen(false);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'An error occurred during sign-off.';
      error('Decision failed', errMsg);
    }
  };

  return (
    <>
      <GlassCard
        className={twMerge(
          clsx('flex flex-col gap-5 border-slate-900 transition-all duration-300', className)
        )}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900/80 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-extrabold tracking-tight text-white uppercase">
                Workflow: {approval.workflowType.replace(/_/g, ' ')}
              </span>
              <StatusBadge status={approval.status} size="sm" />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <User size={12} className="text-slate-500" />
                <span>Requested by: {approval.requestedByName || approval.requestedById}</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} className="text-slate-500" />
                <span>Created: {new Date(approval.createdAt).toLocaleString()}</span>
              </span>
              {approval.entityType && (
                <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-mono text-slate-300 border border-slate-800">
                  {approval.entityType}
                  {approval.entityId ? `#${approval.entityId}` : ''}
                </span>
              )}
            </div>
          </div>

          {/* Quick actions for pending */}
          {isPending && (
            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                type="button"
                onClick={() => handleOpenModal('inspect')}
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-900 hover:text-white"
                disabled={isLoading}
              >
                <Eye size={14} />
                <span>Inspect</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenModal('reject')}
                className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-400 transition-colors hover:bg-rose-500/20 active:scale-95"
                disabled={isLoading}
              >
                <X size={14} />
                <span>Reject</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenModal('approve')}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-all hover:bg-emerald-500 active:scale-95 shadow-sm"
                disabled={isLoading}
              >
                <Check size={14} />
                <span>Approve</span>
              </button>
            </div>
          )}
        </div>

        {/* Payload Preview Section */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Extracted Payload Details
            </h4>
            {isPending && (
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Edit3 size={11} />
                <span>Inspect & edit before approval</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 rounded-xl border border-slate-900/80 bg-slate-950/40 p-4">
            {Object.entries(approval.payload).length === 0 ? (
              <div className="col-span-full py-4 text-center text-xs text-slate-500">
                No payload attributes provided in this request.
              </div>
            ) : (
              Object.entries(approval.payload).map(([key, value]) => {
                const displayValue =
                  typeof value === 'object' && value !== null
                    ? JSON.stringify(value)
                    : String(value ?? 'N/A');

                return (
                  <div key={key} className="space-y-0.5 rounded-lg bg-slate-900/40 p-2.5 border border-slate-900/50">
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 truncate">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="block font-mono text-xs font-medium text-slate-200 truncate">
                      {displayValue}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Decision details if already decided */}
        {!isPending && (approval.decidedByName || approval.decisionNote) && (
          <div
            className={clsx(
              'rounded-xl border p-3.5 text-xs space-y-1',
              approval.status === ApprovalStatus.APPROVED
                ? 'border-emerald-500/20 bg-emerald-950/10 text-emerald-300'
                : 'border-rose-500/20 bg-rose-950/10 text-rose-300'
            )}
          >
            <div className="flex items-center justify-between font-semibold">
              <span>
                Decision by: {approval.decidedByName || approval.decidedById || 'System Admin'}
              </span>
              <span>{approval.decidedAt ? new Date(approval.decidedAt).toLocaleString() : ''}</span>
            </div>
            {approval.decisionNote && (
              <p className="text-slate-300 italic mt-1">&quot;{approval.decisionNote}&quot;</p>
            )}
          </div>
        )}
      </GlassCard>

      {/* Review / Decision ModalDrawer */}
      <ModalDrawer
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title={
          modalMode === 'approve'
            ? 'Approve Data Extraction'
            : modalMode === 'reject'
            ? 'Reject Data Extraction'
            : 'Inspect Extracted Data'
        }
        description={`Reviewing workflow #${approval.id} (${approval.workflowType})`}
        position="modal"
        maxWidth="max-w-2xl"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(false)}
              className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-900 hover:text-white transition-colors"
            >
              Cancel
            </button>
            {modalMode !== 'inspect' && (
              <button
                type="button"
                onClick={handleConfirmDecision}
                disabled={isLoading}
                className={clsx(
                  'rounded-lg px-5 py-2 text-xs font-semibold text-white shadow-md transition-all active:scale-95 disabled:opacity-50',
                  modalMode === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-rose-600 hover:bg-rose-500'
                )}
              >
                {modalMode === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
            )}
          </div>
        }
      >
        <div className="space-y-6">
          {/* Note input */}
          <InputFormField
            label={modalMode === 'reject' ? 'Rejection Reason (Required)' : 'Decision Note (Optional)'}
            placeholder={
              modalMode === 'reject'
                ? 'State why the extraction is inaccurate or incomplete...'
                : 'Add optional sign-off remarks...'
            }
            value={decisionNote}
            onChange={(e) => setDecisionNote(e.target.value)}
            required={modalMode === 'reject'}
          />

          {/* Editable attributes when approving / inspecting */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Extracted Attributes {modalMode === 'approve' ? '(Editable)' : ''}
              </span>
              <span className="text-[11px] text-slate-500">
                {Object.keys(editablePayload).length} fields detected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[40vh] overflow-y-auto pr-1">
              {Object.entries(editablePayload).map(([key, val]) => (
                <div key={key} className="space-y-1">
                  <InputFormField
                    label={key.replace(/([A-Z])/g, ' $1').trim()}
                    value={typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val ?? '')}
                    onChange={(e) => handlePayloadFieldChange(key, e.target.value)}
                    readOnly={modalMode === 'reject'}
                  />
                </div>
              ))}
            </div>
          </div>

          {modalMode === 'approve' && (
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-300 flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-400" />
              <span>
                Any edits made to the attributes above will overwrite the raw extraction payload upon final approval.
              </span>
            </div>
          )}
        </div>
      </ModalDrawer>
    </>
  );
}
