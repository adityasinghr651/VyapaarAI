/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { BRANDING_ASSETS } from '../../config/branding';

export function LoginLeftPanel() {
  return (
    <div className="hidden md:flex md:w-[60%] bg-surface-container-low relative overflow-hidden flex-col items-center justify-center p-12 border-r border-outline-variant">
      <div className="absolute inset-0 bg-gradient-to-br from-surface-container-low to-surface-container-high opacity-50"></div>
      <div className="relative z-10 w-full max-w-lg flex flex-col items-center">
        <div className="mb-12 text-center">
          <img
            src={BRANDING_ASSETS.logo}
            alt="VyaparAI Logo"
            className="h-20 sm:h-24 w-auto mb-8 mx-auto object-contain transition-all"
          />
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            The digital infrastructure for Indian SMB compliance and operations.
          </p>
        </div>
        {/* Abstract Flow Illustration */}
        <div className="w-full relative flex flex-col items-center space-y-6">
          {/* WhatsApp Node */}
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm w-full max-w-xs flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-primary-container/10 flex items-center justify-center text-primary-container">
                <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  chat
                </span>
              </div>
              <span className="font-headline-md text-headline-md text-on-surface">WhatsApp Activity</span>
            </div>
          </div>
          {/* Connection Line */}
          <div className="h-8 w-px bg-outline-variant absolute top-[72px] z-0"></div>
          <span className="material-symbols-outlined text-outline-variant absolute top-[88px] bg-surface-container-low z-10 text-[20px]">
            arrow_downward
          </span>
          {/* Invoice Node */}
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm w-full max-w-xs flex items-center justify-between relative z-10 mt-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-[#004ac6]">
                <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  description
                </span>
              </div>
              <span className="font-headline-md text-headline-md text-on-surface">Smart Invoicing</span>
            </div>
          </div>
          {/* Connection Line */}
          <div className="h-8 w-px bg-outline-variant absolute top-[184px] z-0"></div>
          <span className="material-symbols-outlined text-outline-variant absolute top-[200px] bg-surface-container-low z-10 text-[20px]">
            arrow_downward
          </span>
          {/* GST Node */}
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm w-full max-w-xs flex items-center justify-between relative z-10 mt-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-tertiary-container/10 flex items-center justify-center text-[#004ac6]">
                <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  gavel
                </span>
              </div>
              <span className="font-headline-md text-headline-md text-on-surface">GST Compliance</span>
            </div>
          </div>
          {/* Connection Line */}
          <div className="h-8 w-px bg-outline-variant absolute top-[296px] z-0"></div>
          <span className="material-symbols-outlined text-outline-variant absolute top-[312px] bg-surface-container-low z-10 text-[20px]">
            arrow_downward
          </span>
          {/* Dashboard Node */}
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm w-full max-w-xs flex items-center justify-between relative z-10 mt-6 bg-gradient-to-r from-surface-container-lowest to-[#004ac6]/5">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-[#004ac6] flex items-center justify-center text-[#ffffff] shadow-sm">
                <span className="material-symbols-outlined text-[28px]">dashboard</span>
              </div>
              <span className="font-headline-md text-headline-md text-on-surface font-bold">Growth Dashboard</span>
            </div>
            <span className="material-symbols-outlined text-[#004ac6]">trending_up</span>
          </div>
        </div>
      </div>
    </div>
  );
}
