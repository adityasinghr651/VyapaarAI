'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  LogOut,
  User,
  ShieldCheck,
  Menu,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { ModalDrawer } from './ui/ModalDrawer';
import { StatusBadge } from './ui/StatusBadge';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useStore((state) => state.user);
  const token = useStore((state) => state.token);
  const logout = useStore((state) => state.logout);

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token && !storedToken) {
      router.replace('/login');
    }
  }, [token, router]);

  // Close mobile navigation drawer automatically when route changes
  useEffect(() => {
    if (isMobileNavOpen) {
      setIsMobileNavOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-muted-foreground text-sm">
        Authenticating session...
      </div>
    );
  }

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Invoices', href: '/invoices', icon: FileText },
    { name: 'Approvals', href: '/approvals', icon: ShieldCheck },
  ];

  const renderNavLinks = () => (
    <nav className="space-y-1">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
              isActive
                ? 'bg-primary/15 text-primary border-l-4 border-primary shadow-sm'
                : 'text-slate-400 hover:bg-slate-900/60 hover:text-white'
            }`}
          >
            <Icon size={18} className={isActive ? 'text-primary' : 'text-slate-400'} />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );

  const renderUserProfile = () => (
    <div className="border-t border-slate-900 pt-4">
      <div className="flex items-center justify-between px-2 mb-3 gap-2">
        <div className="flex items-center space-x-2 min-w-0">
          <div className="bg-slate-800/80 p-2 rounded-full text-slate-300 shrink-0">
            <User size={16} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-white truncate">{user.name}</span>
            <span className="text-[10px] text-slate-500 truncate">{user.email}</span>
          </div>
        </div>
        <div className="shrink-0">
          <StatusBadge status={user.role} size="sm" />
        </div>
      </div>

      <button
        type="button"
        onClick={logout}
        className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/30 active:scale-95 rounded-lg transition-all cursor-pointer"
      >
        <LogOut size={14} />
        <span>Sign Out</span>
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#030712]">
      {/* Desktop Sidebar Panel */}
      <aside className="w-64 border-r border-slate-900 bg-slate-950/60 backdrop-blur-md flex flex-col justify-between p-4 hidden md:flex shrink-0">
        <div>
          {/* Logo */}
          <div className="flex items-center space-x-2 px-3 py-4 mb-6">
            <div className="bg-primary p-2 rounded-xl text-white shadow-md shadow-violet-900/40">
              <Package size={20} />
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              VyapaarAI
            </span>
          </div>

          {/* Nav Links */}
          {renderNavLinks()}
        </div>

        {/* Footer User Profile composing StatusBadge */}
        {renderUserProfile()}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Mobile Header Nav with Hamburger Trigger */}
        <header className="md:hidden border-b border-slate-900 bg-slate-950/60 backdrop-blur-md p-4 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              aria-label="Open navigation menu"
              className="p-1.5 rounded-lg bg-slate-900 text-slate-300 hover:text-white active:scale-95 transition-all"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center space-x-2">
              <div className="bg-primary p-1.5 rounded-lg text-white">
                <Package size={16} />
              </div>
              <span className="text-base font-extrabold text-white">VyapaarAI</span>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            aria-label="Sign out"
            className="text-rose-400 p-1.5 hover:bg-rose-950/30 rounded-lg transition-all"
          >
            <LogOut size={18} />
          </button>
        </header>

        {/* Mobile Navigation Drawer composing ModalDrawer (drawer-left) */}
        <ModalDrawer
          isOpen={isMobileNavOpen}
          onClose={() => setIsMobileNavOpen(false)}
          title="Navigation Menu"
          description="Switch between active SMB operations domains."
          position="drawer-left"
          maxWidth="max-w-xs"
        >
          <div className="flex flex-col justify-between h-full pt-4 min-h-[calc(100vh-140px)]">
            {renderNavLinks()}
            <div className="mt-6">{renderUserProfile()}</div>
          </div>
        </ModalDrawer>

        {/* Render Views */}
        <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full flex-1">{children}</main>
      </div>
    </div>
  );
}
