/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import Link from 'next/link';
import { BRANDING_ASSETS } from '../../config/branding';

export function Footer() {
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-surface-container-low border-t border-outline-variant py-12 px-6">
      <div className="max-w-[container-max] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-1 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <img
              src={BRANDING_ASSETS.logo}
              alt="VyaparAI Logo"
              className="h-10 w-auto object-contain"
            />
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">Institutional SMB Platform</p>
        </div>
        <div className="col-span-1">
          <h4 className="font-label-md text-label-md text-on-surface mb-4 uppercase tracking-wider">Product</h4>
          <ul className="flex flex-col gap-2">
            <li>
              <a
                className="font-body-md text-body-md text-on-surface-variant hover:text-[#004ac6] transition-colors"
                href="#features"
                onClick={(e) => scrollToSection(e, 'features')}
              >
                Features
              </a>
            </li>
            <li>
              <a
                className="font-body-md text-body-md text-on-surface-variant hover:text-[#004ac6] transition-colors"
                href="#pricing"
                onClick={(e) => scrollToSection(e, 'pricing')}
              >
                Pricing
              </a>
            </li>
            <li>
              <Link className="font-body-md text-body-md text-on-surface-variant hover:text-[#004ac6] transition-colors" href="/signup">
                Integration
              </Link>
            </li>
            <li>
              <Link className="font-body-md text-body-md text-on-surface-variant hover:text-[#004ac6] transition-colors" href="/signup">
                Changelog
              </Link>
            </li>
          </ul>
        </div>
        <div className="col-span-1">
          <h4 className="font-label-md text-label-md text-on-surface mb-4 uppercase tracking-wider">Resources</h4>
          <ul className="flex flex-col gap-2">
            <li>
              <Link className="font-body-md text-body-md text-on-surface-variant hover:text-[#004ac6] transition-colors" href="/signup">
                GST Guide
              </Link>
            </li>
            <li>
              <Link className="font-body-md text-body-md text-on-surface-variant hover:text-[#004ac6] transition-colors" href="/signup">
                Help Center
              </Link>
            </li>
            <li>
              <Link className="font-body-md text-body-md text-on-surface-variant hover:text-[#004ac6] transition-colors" href="/signup">
                Blog
              </Link>
            </li>
            <li>
              <Link className="font-body-md text-body-md text-on-surface-variant hover:text-[#004ac6] transition-colors" href="/signup">
                Contact Support
              </Link>
            </li>
          </ul>
        </div>
        <div className="col-span-1">
          <h4 className="font-label-md text-label-md text-on-surface mb-4 uppercase tracking-wider">Legal</h4>
          <ul className="flex flex-col gap-2">
            <li>
              <Link className="font-body-md text-body-md text-on-surface-variant hover:text-[#004ac6] transition-colors" href="/signup">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link className="font-body-md text-body-md text-on-surface-variant hover:text-[#004ac6] transition-colors" href="/signup">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-[container-max] mx-auto mt-12 pt-8 border-t border-outline-variant text-center">
        <p className="font-body-md text-body-md text-on-surface-variant">© 2024 VyaparAI. All rights reserved.</p>
      </div>
    </footer>
  );
}
