/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';

export function Features() {
  return (
    <section className="py-24 px-6 max-w-[container-max] mx-auto" id="features">
      <div className="text-center mb-16">
        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">
          Everything you need to run your business
        </h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
          Institutional-grade tools delivered through an interface you already know.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
        {/* Feature 1: Large */}
        <div className="md:col-span-2 md:row-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-8 flex flex-col hover:bg-surface-container-low transition-colors group">
          <span className="material-symbols-outlined text-[#004ac6] text-4xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>
            receipt_long
          </span>
          <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Smart Invoicing</h3>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6">
            Generate professional, GST-compliant invoices in seconds directly from WhatsApp or our dashboard.
          </p>
          <div className="flex-grow rounded border border-outline-variant bg-surface-container overflow-hidden relative">
            <img
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              alt="Digital invoice dashboard mockup"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrJDdkaxoyWY-s5p7cCbsKBmlE0rQydHvij_i5FnRYb3icCrQ2torW1U19PFSLsbXAfjt99G5RGiUVVtUOPtB7ZwQrbsEsmMLrnU0eHaaVr5jlEn_lwV1krCHvLamyqdTXm-dUGYnveXFTkmlOq2eBvTFryh80z2h--38vpSk3paJNHbhv3vRyrOw0Vj5X3tNpc9nchak6-LspGPrrgp57kl016oN6tI0CM0QKFVj2ez6mW1ddJ9DGsbDcU2f4Vmz9bQFj588iF3rO"
            />
          </div>
        </div>
        {/* Feature 2 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 flex flex-col hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined text-[#004ac6] text-3xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>
            account_balance
          </span>
          <h3 className="font-headline-md text-headline-md text-on-surface mb-2">GST Automation</h3>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Automated GSTR-1, GSTR-3B filings and compliance monitoring.
          </p>
        </div>
        {/* Feature 3 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 flex flex-col hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined text-[#004ac6] text-3xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>
            payments
          </span>
          <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Payment Tracking</h3>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Track outstanding balances, send automated reminders, and reconcile payments instantly.
          </p>
        </div>
        {/* Feature 4 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 flex flex-col hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined text-[#004ac6] text-3xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>
            inventory_2
          </span>
          <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Inventory Management</h3>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Real-time stock alerts and automated adjustments.
          </p>
        </div>
        {/* Feature 5 */}
        <div className="md:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-8 flex flex-col hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined text-[#004ac6] text-3xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>
            smart_toy
          </span>
          <h3 className="font-headline-md text-headline-md text-on-surface mb-2">AI Assistant</h3>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Just type &quot;What&apos;s my pending GST?&quot; or &quot;Who owes me money?&quot; in WhatsApp and get instant, accurate answers.
          </p>
        </div>
      </div>
    </section>
  );
}
