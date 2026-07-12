'use client';

import React, { useState } from 'react';
import { ConversationCard, ConversationStatus } from './ConversationCard';

export interface ConversationItem {
  id: string;
  sender: string;
  time: string;
  message: string;
  status: ConversationStatus;
  rawItem?: unknown;
}

export interface ConversationListProps {
  items: ConversationItem[];
  selectedId: string | null;
  onSelectItem: (item: ConversationItem) => void;
}

export function ConversationList({
  items,
  selectedId,
  onSelectItem,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<ConversationStatus | 'ALL'>('ALL');

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'ALL' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <section className="lg:col-span-5 flex flex-col bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden h-full shadow-sm">
      <div className="p-4 border-b border-outline-variant bg-surface-container-low/50 flex justify-between items-center shrink-0">
        <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wider">
          Conversation History
        </h3>
        <button
          type="button"
          onClick={() => {
            setFilterStatus((prev) =>
              prev === 'ALL'
                ? 'Extracted'
                : prev === 'Extracted'
                ? 'Processing'
                : prev === 'Processing'
                ? 'No Actionable Data'
                : 'ALL'
            );
          }}
          className="material-symbols-outlined text-on-surface-variant text-[18px] hover:text-on-surface transition-colors p-1"
          title={`Filter: ${filterStatus}`}
        >
          filter_list
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-outline-variant/50 bg-surface-container-lowest shrink-0">
        <div className="relative flex items-center w-full h-9 rounded bg-surface-container-low border border-outline-variant focus-within:border-primary">
          <span className="material-symbols-outlined absolute left-2.5 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            className="w-full h-full pl-9 pr-3 bg-transparent border-none focus:ring-0 font-body-md text-xs text-on-surface placeholder:text-on-surface-variant"
            placeholder="Search WhatsApp activity..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <ConversationCard
              key={item.id}
              sender={item.sender}
              time={item.time}
              message={item.message}
              status={item.status}
              isSelected={item.id === selectedId}
              onClick={() => onSelectItem(item)}
            />
          ))
        ) : (
          <div className="text-center py-8 text-on-surface-variant text-xs">
            No WhatsApp activity matching your criteria.
          </div>
        )}
      </div>
    </section>
  );
}
