/* eslint-disable @next/next/no-page-custom-font */
'use client';

import React from 'react';
import { Navbar } from './Navbar';
import { Hero } from './Hero';
import { Features } from './Features';
import { HowItWorks } from './HowItWorks';
import { Pricing } from './Pricing';
import { Footer } from './Footer';

export function LandingPage() {
  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] font-body-md antialiased overflow-x-hidden min-h-screen flex flex-col">
      {/* Google Material Symbols Outlined stylesheet for exact icon rendering */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
      />
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
