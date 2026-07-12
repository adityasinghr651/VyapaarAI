import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  InvoiceStatus,
  ApprovalStatus,
  ConversationMessageStatus,
  ConversationDirection,
} from '@vyapaarai/shared-types';

export type StatusBadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: string | InvoiceStatus | ApprovalStatus | ConversationMessageStatus | ConversationDirection;
  variant?: StatusBadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIndicator?: boolean;
  label?: string;
}

const variantStyles: Record<StatusBadgeVariant, { container: string; indicator: string }> = {
  success: {
    container: 'bg-green-50 text-green-700 border-green-200',
    indicator: 'bg-green-600',
  },
  warning: {
    container: 'bg-amber-50 text-amber-700 border-amber-200',
    indicator: 'bg-amber-600',
  },
  danger: {
    container: 'bg-error-container text-error border-error/20',
    indicator: 'bg-error',
  },
  info: {
    container: 'bg-primary/10 text-primary border-primary/20',
    indicator: 'bg-primary',
  },
  neutral: {
    container: 'bg-surface-container text-on-surface-variant border-outline-variant',
    indicator: 'bg-on-surface-variant',
  },
};

const sizeStyles: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'px-2 py-0.5 text-[10px] gap-1',
  md: 'px-2.5 py-0.5 text-xs gap-1.5',
  lg: 'px-3 py-1 text-sm gap-2',
};

export function getStatusVariant(status: string): StatusBadgeVariant {
  const normalized = status.toUpperCase();
  switch (normalized) {
    case InvoiceStatus.PAID:
    case ApprovalStatus.APPROVED:
    case ConversationMessageStatus.DELIVERED:
    case ConversationMessageStatus.READ:
    case 'ACTIVE':
    case 'SUCCESS':
    case 'COMPLETED':
      return 'success';

    case InvoiceStatus.SENT:
    case ConversationMessageStatus.SENT:
    case ApprovalStatus.PENDING:
    case 'PENDING_REVIEW':
    case 'NEEDS_HUMAN_REVIEW':
    case 'WARNING':
    case 'IN_PROGRESS':
      return 'warning';

    case InvoiceStatus.OVERDUE:
    case InvoiceStatus.CANCELLED:
    case ApprovalStatus.REJECTED:
    case ApprovalStatus.EXPIRED:
    case ConversationMessageStatus.FAILED:
    case 'ERROR':
    case 'FAILED':
      return 'danger';

    case ConversationMessageStatus.RECEIVED:
    case ConversationDirection.INBOUND:
    case ConversationDirection.OUTBOUND:
    case 'INFO':
    case 'NEW':
      return 'info';

    case InvoiceStatus.DRAFT:
    case 'DRAFT':
    case 'INACTIVE':
    default:
      return 'neutral';
  }
}

export function formatStatusLabel(status: string, customLabel?: string): string {
  if (customLabel) {
    return customLabel;
  }
  const normalized = status.toUpperCase();
  switch (normalized) {
    case ApprovalStatus.PENDING:
    case 'PENDING_REVIEW':
      return 'Pending Review';
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'NEEDS_HUMAN_REVIEW':
      return 'Needs Review';
    case ConversationDirection.INBOUND:
      return 'Inbound';
    case ConversationDirection.OUTBOUND:
      return 'Outbound';
    default:
      return String(status).toLowerCase().replace(/_/g, ' ');
  }
}

export function StatusBadge({
  status,
  variant,
  size = 'md',
  className,
  showIndicator = true,
  label,
  ...props
}: StatusBadgeProps) {
  const resolvedVariant = variant || getStatusVariant(String(status));
  const styles = variantStyles[resolvedVariant];
  const displayLabel = formatStatusLabel(String(status), label);

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center font-medium rounded-full border transition-colors',
          styles.container,
          sizeStyles[size],
          className
        )
      )}
      {...props}
    >
      {showIndicator && (
        <span className={clsx('h-1.5 w-1.5 rounded-full flex-shrink-0', styles.indicator)} />
      )}
      <span className="capitalize">{displayLabel}</span>
    </span>
  );
}
