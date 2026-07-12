'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SearchBar } from './SearchBar';
import { NotificationMenu } from './NotificationMenu';
import { UserMenu } from './UserMenu';

export interface TopNavbarProps {
  onToggleMobileNav?: () => void;
}

export function TopNavbar({ onToggleMobileNav }: TopNavbarProps) {
  const router = useRouter();

  return (
    <header className="h-16 border-b border-outline-variant bg-surface-container-lowest px-6 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-sm">
      {/* Left: Mobile Menu Toggle & Search Bar */}
      <div className="flex items-center gap-4 flex-1">
        <button
          type="button"
          onClick={onToggleMobileNav}
          className="md:hidden p-2 text-on-surface-variant hover:text-on-surface rounded-lg cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>
        <SearchBar
          onSearch={(query) => {
            if (query.trim()) {
              router.push(`/invoices?search=${encodeURIComponent(query)}`);
            }
          }}
        />
      </div>

      {/* Right Actions: Compliance Alert, Switch Account, Notifications, User Profile */}
      <div className="flex items-center gap-2">
        {/* Compliance Alert Icon */}
        <button
          type="button"
          onClick={() => router.push('/approvals')}
          className="w-10 h-10 rounded-full flex items-center justify-center text-amber-600 bg-amber-50/80 hover:bg-amber-100 transition-colors relative cursor-pointer"
          title="GST Compliance Warnings & Approvals"
          aria-label="GST Compliance Warnings"
        >
          <span className="material-symbols-outlined text-[20px]">warning</span>
        </button>

        {/* Notifications Menu */}
        <NotificationMenu />

        {/* Switch Account Button */}
        <button
          type="button"
          onClick={() => router.push('/settings')}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-outline-variant hover:bg-surface-container-low transition-colors text-on-surface-variant font-label-md text-xs font-semibold cursor-pointer"
          title="Switch Institutional Account"
        >
          <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
          <span>Switch Account</span>
        </button>

        {/* Profile Avatar User Menu */}
        <UserMenu />
      </div>
    </header>
  );
}
