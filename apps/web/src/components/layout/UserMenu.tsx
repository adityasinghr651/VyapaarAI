'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../store/useStore';

export function UserMenu() {
  const router = useRouter();
  const user = useStore((state) => state.user);
  const logout = useStore((state) => state.logout);
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const name = user ? user.name : 'System Admin';
  const email = user ? user.email : 'admin@vyapaarai.in';
  const initials = user && user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'AS';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1 rounded-full hover:bg-surface-container-low transition-colors cursor-pointer"
        aria-label="User account menu"
      >
        <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs">
          {initials}
        </div>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 rounded-xl bg-surface-container-lowest border border-outline-variant shadow-lg py-2 z-50 animate-in fade-in duration-150">
            <div className="px-4 py-3 border-b border-outline-variant/50">
              <p className="font-label-md text-label-md text-on-surface font-bold truncate">{name}</p>
              <p className="font-body-md text-xs text-on-surface-variant truncate mt-0.5">{email}</p>
            </div>
            <div className="py-1">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  router.push('/settings');
                }}
                className="w-full px-4 py-2 text-left text-xs text-on-surface hover:bg-surface-container-low flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">person</span>
                Profile &amp; Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  router.push('/settings');
                }}
                className="w-full px-4 py-2 text-left text-xs text-on-surface hover:bg-surface-container-low flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
                Team Management
              </button>
            </div>
            <div className="border-t border-outline-variant/50 pt-1">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-xs text-error hover:bg-error-container/20 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
