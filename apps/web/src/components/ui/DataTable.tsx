import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { EmptyState } from './EmptyState';

export interface ColumnDef<T> {
  header: string;
  accessorKey?: keyof T | string;
  cell?: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  keyExtractor: (item: T, index: number) => string | number;
  onRowClick?: (item: T) => void;
  className?: string;
  emptyState?: {
    title?: string;
    description?: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
  };
}

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  keyExtractor,
  onRowClick,
  className,
  emptyState,
}: DataTableProps<T>) {
  return (
    <div className={twMerge(clsx('glass-panel rounded-xl overflow-hidden border border-slate-900', className))}>
      {isLoading ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-900 bg-slate-950/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {columns.map((col, idx) => (
                  <th key={idx} className={clsx('p-4 font-semibold', col.className)}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-sm">
              {Array.from({ length: 6 }).map((_, rowIdx) => (
                <tr key={`skeleton-${rowIdx}`} className="animate-pulse">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={clsx('p-4', col.className)}>
                      <div className="h-4 w-3/4 rounded bg-slate-900/80" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : data.length === 0 ? (
        <div className="p-6 md:p-8">
          <EmptyState
            title={emptyState?.title || 'No records found'}
            description={
              emptyState?.description || 'There is currently no data available to display in this table.'
            }
            icon={emptyState?.icon}
            action={emptyState?.action}
            className="border-0 bg-transparent p-6"
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-900 bg-slate-950/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {columns.map((col, idx) => (
                  <th key={idx} className={clsx('p-4 font-semibold', col.className)}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-sm">
              {data.map((item, rowIdx) => {
                const rowKey = keyExtractor(item, rowIdx);
                return (
                  <tr
                    key={rowKey}
                    onClick={() => onRowClick && onRowClick(item)}
                    className={clsx(
                      'transition-all',
                      onRowClick ? 'cursor-pointer hover:bg-slate-900/40' : 'hover:bg-slate-900/20'
                    )}
                  >
                    {columns.map((col, colIdx) => {
                      let cellContent: React.ReactNode = null;
                      if (col.cell) {
                        cellContent = col.cell(item, rowIdx);
                      } else if (col.accessorKey) {
                        const val = (item as Record<string, unknown>)[col.accessorKey as string];
                        cellContent = val !== undefined && val !== null ? String(val) : '';
                      }
                      return (
                        <td key={colIdx} className={clsx('p-4 text-slate-200', col.className)}>
                          {cellContent}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
