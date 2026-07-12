/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BRANDING_ASSETS } from '../../config/branding';

function HeroIllustration() {
  return (
    <div className="relative w-full aspect-square md:aspect-video rounded-xl overflow-hidden shadow-sm border border-outline-variant bg-white">
      <Image
        src={BRANDING_ASSETS.landingHero}
        alt="VyaparAI Hero Illustration"
        fill
        priority
        className="object-contain"
      />
    </div>
  );
}

export function Hero() {
  return (
    <>
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden px-6">
        <div className="max-w-[container-max] mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="w-full lg:w-1/2 flex flex-col gap-6 z-10">
            <h1 className="font-display text-display text-on-surface">
              GST Compliance &amp; Business Operations on WhatsApp
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
              Create invoices, track payments, manage GST, and run your business from one intelligent platform. Built for Indian SMBs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link
                href="/signup"
                className="bg-[#004ac6] text-[#ffffff] font-label-md text-label-md px-6 py-3 rounded hover:bg-[#004ac6]/90 transition-colors text-center inline-block"
              >
                Start Free Trial
              </Link>
              <Link
                href="/signup"
                className="bg-surface-container-lowest border border-outline-variant text-on-surface font-label-md text-label-md px-6 py-3 rounded hover:bg-surface-container-low transition-colors text-center inline-block"
              >
                Book Demo
              </Link>
            </div>
            <div className="flex items-center gap-2 mt-4 text-on-surface-variant">
              <span className="material-symbols-outlined text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
              <span className="font-body-md text-body-md">Used by 5000+ SMBs across India</span>
            </div>
          </div>
          <div className="w-full lg:w-1/2 relative z-10">
            <HeroIllustration />
          </div>
        </div>
      </section>

      {/* Social Proof / Logos */}
      <section className="py-8 bg-surface-container-low border-y border-outline-variant px-6">
        <div className="max-w-[container-max] mx-auto text-center">
          <p className="font-label-md text-label-md text-on-surface-variant mb-6 uppercase tracking-wider">
            Trusted by industry leaders
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70 grayscale">
            <span className="material-symbols-outlined text-4xl">domain</span>
            <span className="material-symbols-outlined text-4xl">storefront</span>
            <span className="material-symbols-outlined text-4xl">local_mall</span>
            <span className="material-symbols-outlined text-4xl">business</span>
            <span className="material-symbols-outlined text-4xl">factory</span>
          </div>
        </div>
      </section>
    </>
  );
}
