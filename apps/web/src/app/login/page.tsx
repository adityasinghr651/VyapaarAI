/* eslint-disable @next/next/no-page-custom-font */
import React from 'react';
import { LoginLeftPanel } from '../../components/auth/LoginLeftPanel';
import { StitchLoginForm } from '../../components/auth/StitchLoginForm';

export default function LoginPage() {
  return (
    <div className="bg-[#f7f9fb] min-h-screen font-body-md text-on-surface antialiased flex flex-col">
      {/* Google Material Symbols Outlined stylesheet for exact icon rendering */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
      />
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .halo-focus:focus-within {
              border-color: #004ac6 !important;
              box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1) !important;
            }
          `,
        }}
      />
      <main className="flex-1 flex flex-col md:flex-row min-h-screen w-full">
        <LoginLeftPanel />
        <StitchLoginForm />
      </main>
    </div>
  );
}
