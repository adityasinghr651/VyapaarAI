import React from 'react';
import './globals.css';
import { Providers } from '../components/providers';

export const metadata = {
  title: 'VyapaarAI - SMB Operations Platform',
  description: 'Compliance-led invoicing, product inventory, and customer management for SMBs.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#FAFBFD] text-[#191c1e]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
