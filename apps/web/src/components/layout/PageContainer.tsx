'use client';

import React from 'react';

export interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <div className={`max-w-container-max mx-auto w-full p-6 lg:p-8 space-y-6 pb-12 animate-in fade-in duration-300 ${className}`}>
      {children}
    </div>
  );
}
