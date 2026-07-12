/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '../../store/useStore';

export interface SidebarProps {
  isMobileNavOpen?: boolean;
  setIsMobileNavOpen?: (open: boolean) => void;
}

export function Sidebar({ isMobileNavOpen = false, setIsMobileNavOpen }: SidebarProps) {
  const pathname = usePathname();
  const logout = useStore((state) => state.logout);

  const navItems = [
    { name: 'Home', href: '/dashboard', icon: 'home', isMain: true },
    { name: 'Dashboard', href: '/dashboard/executive', icon: 'dashboard' },
    { name: 'Invoices', href: '/invoices', icon: 'description' },
    { name: 'Customers', href: '/customers', icon: 'group' },
    { name: 'Products', href: '/products', icon: 'inventory_2' },
    { name: 'Payments', href: '/payments', icon: 'payments' },
    { name: 'GST Compliance', href: '/approvals', icon: 'gavel' },
    { name: 'WhatsApp Activity', href: '/approvals', icon: 'chat' },
    { name: 'Reports', href: '/reports', icon: 'assessment' },
    { name: 'Audit Logs', href: '/audit', icon: 'history' },
    { name: 'Settings', href: '/settings', icon: 'settings' },
  ];

  const sidebarContent = (
    <>
      {/* Header Typography */}
      <div className="px-6 py-6 mb-2 flex justify-between items-center">
        <div className="flex flex-col">
          <h1 className="font-headline-md text-headline-md font-black text-primary">VyaparAI</h1>
          <p className="font-label-md text-label-md text-on-surface-variant font-normal tracking-normal text-[10px]">
            Institutional SMB Platform
          </p>
        </div>
        {isMobileNavOpen && setIsMobileNavOpen && (
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(false)}
            className="md:hidden p-2 text-on-surface-variant hover:text-on-surface"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item, idx) => {
          const isActive = pathname === item.href && (item.isMain || (pathname !== '/dashboard' && idx > 0));
          if (isActive) {
            return (
              <Link
                key={`${item.name}-${idx}`}
                href={item.href}
                onClick={() => setIsMobileNavOpen && setIsMobileNavOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded bg-secondary-container text-primary border-l-4 border-primary font-bold hover:bg-surface-container transition-all duration-200"
              >
                <span className="material-symbols-outlined filled">{item.icon}</span>
                <span className="font-label-md text-label-md">{item.name}</span>
              </Link>
            );
          }
          return (
            <Link
              key={`${item.name}-${idx}`}
              href={item.href}
              onClick={() => setIsMobileNavOpen && setIsMobileNavOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded text-on-surface-variant hover:bg-surface-container-low transition-all duration-200"
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-label-md text-label-md">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* CTA & Footer */}
      <div className="p-4 mt-auto">
        <button
          type="button"
          onClick={() => {
            // Trigger GST filing flow
          }}
          className="w-full bg-primary text-on-primary py-2.5 rounded font-label-md text-label-md mb-4 hover:bg-surface-tint transition-colors cursor-pointer"
        >
          File GST Now
        </button>
        <div className="border-t border-outline-variant pt-4 space-y-1">
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 rounded text-on-surface-variant hover:bg-surface-container-low transition-all duration-200"
          >
            <span className="material-symbols-outlined text-sm">help</span>
            <span className="font-label-md text-label-md">Help Support</span>
          </a>
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded text-on-surface-variant hover:bg-surface-container-low transition-all duration-200 text-left cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            <span className="font-label-md text-label-md">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar Panel */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-sidebar-width z-50 bg-surface-container-lowest border-r border-outline-variant overflow-y-auto custom-scrollbar">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileNavOpen && setIsMobileNavOpen(false)}
          ></div>
          <aside className="relative flex flex-col h-full w-72 max-w-[80vw] bg-surface-container-lowest border-r border-outline-variant z-10 overflow-y-auto custom-scrollbar shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
