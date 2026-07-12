'use client';

import React from 'react';

export function HowItWorks() {
  return (
    <section className="py-24 bg-surface-container-low px-6" id="how-it-works">
      <div className="max-w-[container-max] mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">How it works</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Seamless integration from text to tax.</p>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-[2px] bg-outline-variant -z-10 -translate-y-1/2"></div>
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center bg-surface-container-lowest p-6 rounded-xl border border-outline-variant w-full md:w-1/5 relative">
            <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center mb-4 z-10 border-4 border-surface-container-low">
              <span className="material-symbols-outlined">chat</span>
            </div>
            <h4 className="font-label-md text-label-md text-on-surface mb-2">1. WhatsApp Message</h4>
            <p className="font-body-md text-body-md text-on-surface-variant text-sm">Send invoice details naturally.</p>
          </div>
          {/* Step 2 */}
          <div className="flex flex-col items-center text-center bg-surface-container-lowest p-6 rounded-xl border border-outline-variant w-full md:w-1/5 relative">
            <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center mb-4 z-10 border-4 border-surface-container-low">
              <span className="material-symbols-outlined">psychology</span>
            </div>
            <h4 className="font-label-md text-label-md text-on-surface mb-2">2. AI Extraction</h4>
            <p className="font-body-md text-body-md text-on-surface-variant text-sm">AI structures the data.</p>
          </div>
          {/* Step 3 */}
          <div className="flex flex-col items-center text-center bg-surface-container-lowest p-6 rounded-xl border border-outline-variant w-full md:w-1/5 relative">
            <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center mb-4 z-10 border-4 border-surface-container-low">
              <span className="material-symbols-outlined">description</span>
            </div>
            <h4 className="font-label-md text-label-md text-on-surface mb-2">3. Create Invoice</h4>
            <p className="font-body-md text-body-md text-on-surface-variant text-sm">PDF generated instantly.</p>
          </div>
          {/* Step 4 */}
          <div className="flex flex-col items-center text-center bg-surface-container-lowest p-6 rounded-xl border border-outline-variant w-full md:w-1/5 relative">
            <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center mb-4 z-10 border-4 border-surface-container-low">
              <span className="material-symbols-outlined">calculate</span>
            </div>
            <h4 className="font-label-md text-label-md text-on-surface mb-2">4. GST Calc</h4>
            <p className="font-body-md text-body-md text-on-surface-variant text-sm">Taxes calculated accurately.</p>
          </div>
          {/* Step 5 */}
          <div className="flex flex-col items-center text-center bg-surface-container-lowest p-6 rounded-xl border border-outline-variant w-full md:w-1/5 relative">
            <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center mb-4 z-10 border-4 border-surface-container-low">
              <span className="material-symbols-outlined">dashboard</span>
            </div>
            <h4 className="font-label-md text-label-md text-on-surface mb-2">5. Dashboard Sync</h4>
            <p className="font-body-md text-body-md text-on-surface-variant text-sm">Records updated in real-time.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
