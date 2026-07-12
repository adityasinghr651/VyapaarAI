'use client';

import React from 'react';
import { AppShell } from './layout/AppShell';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
