'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '../../store/useStore';

export interface SidebarProps {
  isMobileNavOpen?: boolean;
  onCloseMobileNav?: () => void;
}

export function Sidebar({
  isMobileNavOpen = false,
  onCloseMobileNav,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useStore((state) => state.logout);

  const navItems = [
    { name: 'Home', href: '/dashboard', icon: 'home', isHomeExact: true },
    { name: 'Dashboard', href: '/dashboard/executive', icon: 'analytics', alsoMatches: ['/executive-dashboard'] },
    { name: 'Invoices', href: '/invoices', icon: 'receipt_long' },
    { name: 'Customers', href: '/customers', icon: 'groups' },
    { name: 'Products', href: '/products', icon: 'inventory_2' },
    { name: 'Payments', href: '/dashboard#payments', icon: 'payments' },
    { name: 'GST Compliance', href: '/dashboard#gst', icon: 'account_balance' },
    { name: 'WhatsApp Activity', href: '/whatsapp-activity', icon: 'chat', alsoMatches: ['/approvals'] },
    { name: 'Reports', href: '/reports', icon: 'bar_chart' },
    { name: 'Audit Logs', href: '/audit', icon: 'history' },
    { name: 'Settings', href: '/settings', icon: 'settings' },
  ];

  const handleSignOut = () => {
    logout();
    router.replace('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 bg-on-surface/40 backdrop-blur-xs z-40 md:hidden"
          onClick={onCloseMobileNav}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-surface-container-lowest border-r border-outline-variant flex flex-col h-full shrink-0 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header Logo Typography */}
        <div className="px-6 py-6 mb-2 flex justify-between items-center">
          <Link href="/dashboard" className="flex flex-col">
            <h1 className="font-headline-md text-headline-md font-black text-primary">VyaparAI</h1>
            <p className="font-label-md text-label-md text-on-surface-variant font-normal tracking-normal text-[10px]">
              Institutional SMB Platform
            </p>
          </Link>
          {isMobileNavOpen && onCloseMobileNav && (
            <button
              type="button"
              onClick={onCloseMobileNav}
              className="md:hidden p-2 text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = item.isHomeExact
              ? pathname === '/dashboard'
              : pathname === item.href || (item.alsoMatches && item.alsoMatches.includes(pathname));

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onCloseMobileNav}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-label-md text-label-md transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface font-medium'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-outline-variant space-y-3">
          {/* File GST Now CTA */}
          <Link
            href="/approvals"
            onClick={onCloseMobileNav}
            className="w-full bg-primary hover:bg-primary/90 text-on-primary py-2.5 px-4 rounded-lg font-label-md text-label-md transition-colors flex items-center justify-center gap-2 shadow-sm font-bold"
          >
            <span className="material-symbols-outlined text-[18px]">gavel</span>
            File GST Now
          </Link>

          {/* Help Support */}
          <button
            type="button"
            onClick={() => {
              if (onCloseMobileNav) onCloseMobileNav();
              router.push('/settings');
            }}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">help</span>
            <span>Help Support</span>
          </button>

          {/* Sign Out */}
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg font-label-md text-label-md text-error hover:bg-error-container/20 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
