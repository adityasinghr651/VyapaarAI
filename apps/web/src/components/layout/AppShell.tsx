/* eslint-disable @next/next/no-page-custom-font */
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useStore } from '../../store/useStore';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';

export interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useStore((state) => state.user);
  const token = useStore((state) => state.token);

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token && !storedToken) {
      router.replace('/login');
    }
  }, [token, router]);

  useEffect(() => {
    if (isMobileNavOpen) {
      setIsMobileNavOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-on-surface-variant font-body-md text-sm">
        Authenticating session...
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden antialiased font-body-md text-body-md bg-[#FAFBFD] text-on-surface">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
      />
      <style
        dangerouslySetInnerHTML={{
          __html: `
            body { background-color: #FAFBFD; color: #191c1e; }
            .material-symbols-outlined {
              font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            }
            .material-symbols-outlined.filled {
              font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            }
            .custom-scrollbar::-webkit-scrollbar { width: 4px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #e0e3e5; border-radius: 4px; }
          `,
        }}
      />

      {/* Global Navigation Sidebar */}
      <Sidebar
        isMobileNavOpen={isMobileNavOpen}
        onCloseMobileNav={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#FAFBFD]">
        <TopNavbar onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)} />
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#FAFBFD]">{children}</main>
      </div>
    </div>
  );
}
