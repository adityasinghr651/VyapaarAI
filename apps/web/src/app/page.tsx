'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../store/useStore';

export default function RootPage() {
  const router = useRouter();
  const token = useStore((state) => state.token);

  useEffect(() => {
    // Check local storage directly on initial render to prevent flash
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token || storedToken) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground text-sm">
      Loading VyapaarAI...
    </div>
  );
}
