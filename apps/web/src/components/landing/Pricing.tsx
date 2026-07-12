'use client';

import React from 'react';
import Link from 'next/link';

export function Pricing() {
  return (
    <section className="py-24 px-6 max-w-[container-max] mx-auto" id="pricing">
      <div className="text-center mb-16">
        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">Simple, transparent pricing</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant">Choose the plan that fits your business needs.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {/* Starter */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 flex flex-col">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Starter</h3>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6">For small businesses starting out.</p>
          <div className="mb-6">
            <span className="font-display text-display text-on-surface">₹499</span>
            <span className="font-body-md text-body-md text-on-surface-variant">/mo</span>
          </div>
          <ul className="flex flex-col gap-3 mb-8 flex-grow">
            <li className="flex items-center gap-2 text-on-surface">
              <span className="material-symbols-outlined text-[#004ac6] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                check
              </span>
              <span className="font-body-md text-body-md">Up to 100 Invoices/mo</span>
            </li>
            <li className="flex items-center gap-2 text-on-surface">
              <span className="material-symbols-outlined text-[#004ac6] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                check
              </span>
              <span className="font-body-md text-body-md">WhatsApp Integration</span>
            </li>
            <li className="flex items-center gap-2 text-on-surface">
              <span className="material-symbols-outlined text-[#004ac6] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                check
              </span>
              <span className="font-body-md text-body-md">Basic Reporting</span>
            </li>
          </ul>
          <Link
            href="/signup"
            className="w-full bg-surface-container border border-outline-variant text-on-surface font-label-md text-label-md px-4 py-2 rounded hover:bg-surface-container-high transition-colors text-center inline-block"
          >
            Start Starter
          </Link>
        </div>
        {/* Growth (Highlighted) */}
        <div className="bg-surface-container-lowest border-2 border-[#004ac6] rounded-xl p-8 flex flex-col relative shadow-[0_4px_12px_rgba(15,23,42,0.08)] scale-105">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#004ac6] text-[#ffffff] font-label-md text-label-md px-3 py-1 rounded-full uppercase text-[10px]">
            Most Popular
          </div>
          <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Growth</h3>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6">For growing businesses needing compliance.</p>
          <div className="mb-6">
            <span className="font-display text-display text-on-surface">₹1299</span>
            <span className="font-body-md text-body-md text-on-surface-variant">/mo</span>
          </div>
          <ul className="flex flex-col gap-3 mb-8 flex-grow">
            <li className="flex items-center gap-2 text-on-surface">
              <span className="material-symbols-outlined text-[#004ac6] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                check
              </span>
              <span className="font-body-md text-body-md">Unlimited Invoices</span>
            </li>
            <li className="flex items-center gap-2 text-on-surface">
              <span className="material-symbols-outlined text-[#004ac6] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                check
              </span>
              <span className="font-body-md text-body-md">Automated GST Filing</span>
            </li>
            <li className="flex items-center gap-2 text-on-surface">
              <span className="material-symbols-outlined text-[#004ac6] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                check
              </span>
              <span className="font-body-md text-body-md">Payment Reminders</span>
            </li>
            <li className="flex items-center gap-2 text-on-surface">
              <span className="material-symbols-outlined text-[#004ac6] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                check
              </span>
              <span className="font-body-md text-body-md">AI Assistant (Standard)</span>
            </li>
          </ul>
          <Link
            href="/signup"
            className="w-full bg-[#004ac6] text-[#ffffff] font-label-md text-label-md px-4 py-2 rounded hover:bg-[#004ac6]/90 transition-colors text-center inline-block"
          >
            Start Free Trial
          </Link>
        </div>
        {/* Enterprise */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 flex flex-col">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Enterprise</h3>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6">Custom solutions for large operations.</p>
          <div className="mb-6">
            <span className="font-headline-md text-headline-md text-on-surface">Custom</span>
          </div>
          <ul className="flex flex-col gap-3 mb-8 flex-grow">
            <li className="flex items-center gap-2 text-on-surface">
              <span className="material-symbols-outlined text-[#004ac6] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                check
              </span>
              <span className="font-body-md text-body-md">Dedicated Account Manager</span>
            </li>
            <li className="flex items-center gap-2 text-on-surface">
              <span className="material-symbols-outlined text-[#004ac6] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                check
              </span>
              <span className="font-body-md text-body-md">Multi-user Access Control</span>
            </li>
            <li className="flex items-center gap-2 text-on-surface">
              <span className="material-symbols-outlined text-[#004ac6] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                check
              </span>
              <span className="font-body-md text-body-md">Custom Integrations API</span>
            </li>
          </ul>
          <Link
            href="/signup"
            className="w-full bg-surface-container border border-outline-variant text-on-surface font-label-md text-label-md px-4 py-2 rounded hover:bg-surface-container-high transition-colors text-center inline-block"
          >
            Contact Sales
          </Link>
        </div>
      </div>
    </section>
  );
}
