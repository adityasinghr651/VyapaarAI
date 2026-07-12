/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { useStore } from '../../store/useStore';

export interface TopNavigationProps {
  onOpenMobileNav?: () => void;
}

export function TopNavigation({ onOpenMobileNav }: TopNavigationProps) {
  const user = useStore((state) => state.user);

  const displayName = user?.name || 'Acme Corp';

  return (
    <header className="flex justify-between items-center w-full px-6 py-3 sticky top-0 bg-surface/95 backdrop-blur-sm z-40 border-b border-outline-variant">
      {/* Mobile Hamburger Trigger & Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        {onOpenMobileNav && (
          <button
            type="button"
            onClick={onOpenMobileNav}
            className="md:hidden p-2 rounded hover:bg-surface-container-low transition-colors text-on-surface-variant"
            aria-label="Open sidebar navigation"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        )}
        <div className="relative flex items-center w-full h-10 rounded bg-surface-container-low border border-outline-variant focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
          <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px]">search</span>
          <input
            className="w-full h-full pl-10 pr-4 bg-transparent border-none focus:ring-0 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant"
            placeholder="Search invoices, customers, GST..."
            type="text"
          />
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-4 ml-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-2 rounded hover:bg-surface-container-low transition-colors text-on-surface-variant relative"
          >
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>
          </button>
          <button
            type="button"
            className="p-2 rounded hover:bg-surface-container-low transition-colors text-on-surface-variant"
          >
            <span className="material-symbols-outlined">warning</span>
          </button>
        </div>
        <div className="h-6 w-px bg-outline-variant"></div>
        <div className="flex items-center gap-3 cursor-pointer hover:bg-surface-container-low p-1.5 rounded transition-colors">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="font-label-md text-label-md text-on-surface">{displayName}</span>
            <span className="font-body-md text-[11px] text-primary hover:underline">Switch Account</span>
          </div>
          <img
            alt="User profile"
            className="w-8 h-8 rounded-full object-cover border border-outline-variant"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMJP6b53idWZ3WaJbIF_A-wyAfiv9I9FE0SQx0KMeQFZ7j4BdjQvOEVtSZx66FplyMHNFTAXdnk-Wu8PYbY6oqXSNf1yuONiGVu56t-NI-BTny7hYRgKqfKQz6LLDarRKnJmIibp0hFAtQNtLWH5VwAseeSSU_5ZDyoWZbVgSQ4odnoXMJJsbv4BskyZOm7078M-zUQKrPLGAfJQ0WYImgy815iPkoSC_bBQWiKButZBbOIrbf3Xt4R03_CQitLpnwyKXN3DNoChup"
          />
        </div>
      </div>
    </header>
  );
}
