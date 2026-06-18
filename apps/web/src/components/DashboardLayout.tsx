'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '../store/useStore';
import { LayoutDashboard, Users, Package, FileText, LogOut, User } from 'lucide-react';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useStore((state) => state.user);
  const token = useStore((state) => state.token);
  const logout = useStore((state) => state.logout);

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token && !storedToken) {
      router.replace('/login');
    }
  }, [token, router]);

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
  ];

  return (
    <div className="flex min-h-screen bg-[#030712]">
      {/* Sidebar Panel */}
      <aside className="w-64 border-r border-slate-900 bg-slate-950/60 backdrop-blur-md flex flex-col justify-between p-4 hidden md:flex">
        <div>
          {/* Logo */}
          <div className="flex items-center space-x-2 px-3 py-4 mb-6">
            <div className="bg-primary p-2 rounded-lg text-white">
              <Package size={20} />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              VyapaarAI
            </span>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary/10 text-primary border-l-2 border-primary'
                      : 'text-slate-400 hover:bg-slate-900/60 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer User Profile */}
        <div className="border-t border-slate-900 pt-4">
          <div className="flex items-center justify-between px-2 mb-3">
            <div className="flex items-center space-x-2">
              <div className="bg-slate-800 p-2 rounded-full text-slate-300">
                <User size={16} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-white truncate">{user.name}</span>
                <span className="text-[10px] text-slate-500 truncate">{user.email}</span>
              </div>
            </div>
            <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold uppercase">
              {user.role}
            </span>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-red-400 hover:bg-red-950/20 rounded-lg transition-all"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Mobile Header Nav */}
        <header className="md:hidden border-b border-slate-900 bg-slate-950/40 p-4 flex items-center justify-between">
          <span className="text-lg font-bold text-white">VyapaarAI</span>
          <button onClick={logout} className="text-red-400 p-1">
            <LogOut size={18} />
          </button>
        </header>

        {/* Render Views */}
        <main className="p-6 md:p-8 max-w-7xl mx-auto w-full flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
