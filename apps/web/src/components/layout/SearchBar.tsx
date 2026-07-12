'use client';

import React, { useState } from 'react';

export interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

export function SearchBar({
  placeholder = 'Search transactions, invoices, or customers (Ctrl+K)...',
  onSearch,
  className = '',
}: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(query);
    }
  };

  return (
    <div className={`relative flex items-center w-full max-w-[480px] h-10 bg-surface-container-low rounded-lg px-3 ${className}`}>
      <span className="material-symbols-outlined text-on-surface-variant text-[20px] mr-2">
        search
      </span>
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full bg-transparent border-none focus:outline-none focus:ring-0 font-body-md text-xs text-on-surface placeholder:text-on-surface-variant/80"
      />
    </div>
  );
}
