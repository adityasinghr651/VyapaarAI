'use client';

import React from 'react';
import { Filter, Calendar, RotateCcw } from 'lucide-react';

export interface AuditFilterValues {
  entityType: string;
  startDate: string;
  endDate: string;
}

export interface AuditFilterBarProps {
  filters: AuditFilterValues;
  onChange: (filters: AuditFilterValues) => void;
  onReset: () => void;
}

const ENTITY_TYPES = [
  { label: 'All Entity Types', value: 'ALL' },
  { label: 'Invoice / Ledger', value: 'Invoice' },
  { label: 'Customer', value: 'Customer' },
  { label: 'Product / Catalog', value: 'Product' },
  { label: 'Pending Approval', value: 'PendingApproval' },
  { label: 'WhatsApp / OCR', value: 'WhatsApp' },
  { label: 'Auth / Security', value: 'Auth' },
  { label: 'Settings / Tenant', value: 'Tenant' },
];

export function AuditFilterBar({ filters, onChange, onReset }: AuditFilterBarProps) {
  const hasActiveFilters =
    filters.entityType !== 'ALL' || filters.startDate !== '' || filters.endDate !== '';

  const handleEntityTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, entityType: e.target.value });
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, startDate: e.target.value });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, endDate: e.target.value });
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
      <div className="flex flex-wrap items-center gap-4">
        {/* Entity Type Filter */}
        <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 focus-within:border-primary transition-colors">
          <Filter size={16} className="text-on-surface-variant shrink-0" />
          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
            Entity:
          </span>
          <select
            value={filters.entityType}
            onChange={handleEntityTypeChange}
            className="bg-transparent border-0 text-sm font-medium text-on-surface focus:outline-none focus:ring-0 pr-6 cursor-pointer"
          >
            {ENTITY_TYPES.map((type) => (
              <option key={type.value} value={type.value} className="bg-surface-container-lowest text-on-surface">
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Filters */}
        <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5">
          <Calendar size={16} className="text-on-surface-variant shrink-0" />
          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
            From:
          </span>
          <input
            type="date"
            value={filters.startDate}
            onChange={handleStartDateChange}
            className="bg-transparent border-0 text-sm font-medium text-on-surface focus:outline-none focus:ring-0"
          />
        </div>

        <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5">
          <Calendar size={16} className="text-on-surface-variant shrink-0" />
          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
            To:
          </span>
          <input
            type="date"
            value={filters.endDate}
            onChange={handleEndDateChange}
            className="bg-transparent border-0 text-sm font-medium text-on-surface focus:outline-none focus:ring-0"
          />
        </div>
      </div>

      {/* Reset Action */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onReset}
          className="flex items-center justify-center gap-1.5 text-xs font-label-md text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/15 px-3 py-2 rounded-lg transition-colors shrink-0 cursor-pointer"
        >
          <RotateCcw size={14} />
          <span>Reset Filters</span>
        </button>
      )}
    </div>
  );
}
