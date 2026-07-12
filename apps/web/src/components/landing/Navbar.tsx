/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import Link from 'next/link';
import { BRANDING_ASSETS } from '../../config/branding';

export function Navbar() {
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="flex justify-between items-center w-full px-6 py-4 sticky top-0 bg-surface-container-lowest/95 backdrop-blur-sm z-40 border-b border-outline-variant">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center">
          <img
            src={BRANDING_ASSETS.logo}
            alt="VyaparAI Logo"
            className="h-10 sm:h-12 w-auto object-contain"
          />
        </Link>
      </div>
      <div className="hidden md:flex gap-6 items-center">
        <a
          className="font-label-md text-label-md text-on-surface-variant hover:text-[#004ac6] transition-colors"
          href="#features"
          onClick={(e) => scrollToSection(e, 'features')}
        >
          Features
        </a>
        <a
          className="font-label-md text-label-md text-on-surface-variant hover:text-[#004ac6] transition-colors"
          href="#how-it-works"
          onClick={(e) => scrollToSection(e, 'how-it-works')}
        >
          How it Works
        </a>
        <a
          className="font-label-md text-label-md text-on-surface-variant hover:text-[#004ac6] transition-colors"
          href="#pricing"
          onClick={(e) => scrollToSection(e, 'pricing')}
        >
          Pricing
        </a>
      </div>
      <div className="flex items-center gap-4">
        <Link
          className="hidden md:block font-label-md text-label-md text-on-surface-variant hover:text-[#004ac6] transition-colors"
          href="/login"
        >
          Login
        </Link>
        <Link
          href="/signup"
          className="bg-[#004ac6] text-[#ffffff] font-label-md text-label-md px-4 py-2 rounded hover:bg-[#004ac6]/90 transition-colors inline-block"
        >
          Start Free Trial
        </Link>
      </div>
    </nav>
  );
}
