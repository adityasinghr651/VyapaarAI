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
    <div className={twMerge(clsx('bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant shadow-sm', className))}>
      {isLoading ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                {columns.map((col, idx) => (
                  <th key={idx} className={clsx('p-4 font-bold', col.className)}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-sm">
              {Array.from({ length: 6 }).map((_, rowIdx) => (
                <tr key={`skeleton-${rowIdx}`} className="animate-pulse">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={clsx('p-4', col.className)}>
                      <div className="h-4 w-3/4 rounded bg-surface-variant" />
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
              <tr className="border-b border-outline-variant bg-surface-container-low text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                {columns.map((col, idx) => (
                  <th key={idx} className={clsx('p-4 font-bold', col.className)}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-sm">
              {data.map((item, rowIdx) => {
                const rowKey = keyExtractor(item, rowIdx);
                return (
                  <tr
                    key={rowKey}
                    onClick={() => onRowClick && onRowClick(item)}
                    className={clsx(
                      'transition-colors h-[48px]',
                      onRowClick ? 'cursor-pointer hover:bg-surface-container-low' : 'hover:bg-surface-bright'
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
                        <td key={colIdx} className={clsx('p-4 text-on-surface font-medium', col.className)}>
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
