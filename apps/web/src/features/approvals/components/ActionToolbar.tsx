'use client';

import React from 'react';

export interface ActionToolbarProps {
  onApprove: () => void;
  onEdit?: () => void;
  onDelete: () => void;
  isSubmitting?: boolean;
}

export function ActionToolbar({
  onApprove,
  onEdit,
  onDelete,
  isSubmitting = false,
}: ActionToolbarProps) {
  return (
    <div className="flex items-center gap-4 shrink-0 mt-auto pt-2">
      <button
        type="button"
        onClick={onApprove}
        disabled={isSubmitting}
        className="flex-1 bg-whatsapp-green hover:bg-whatsapp-green/90 text-white py-3 px-6 rounded-lg font-label-md text-label-md transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
      >
        <span className="material-symbols-outlined text-[20px]">receipt_long</span>
        {isSubmitting ? 'Processing...' : 'Approve & Generate Invoice'}
      </button>
      <button
        type="button"
        onClick={onEdit}
        disabled={isSubmitting}
        className="bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low text-on-surface py-3 px-6 rounded-lg font-label-md text-label-md transition-colors disabled:opacity-50 cursor-pointer"
      >
        Edit Details
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={isSubmitting}
        className="bg-surface-container-lowest border border-error/50 hover:bg-error-container text-error py-3 px-4 rounded-lg font-label-md text-label-md transition-colors flex items-center justify-center disabled:opacity-50 cursor-pointer"
        title="Delete extraction record"
      >
        <span className="material-symbols-outlined text-[20px]">delete</span>
      </button>
    </div>
  );
}
