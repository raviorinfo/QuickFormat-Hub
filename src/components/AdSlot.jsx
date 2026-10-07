import React from 'react';
import { Sparkles, ShieldCheck, Cpu, Lock, CheckCircle2 } from 'lucide-react';
import { ADS_CONFIG } from '../config/adsConfig';

export function AdSlot({ type = 'top-banner', className = '' }) {
  // If active AdSense is enabled in config
  if (ADS_CONFIG.enabled && ADS_CONFIG.provider === 'adsense') {
    return (
      <div className={`w-full max-w-5xl mx-auto px-4 my-4 ad-slot no-print ${className}`}>
        <div className="w-full text-center overflow-hidden">
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client={ADS_CONFIG.adsense.client}
            data-ad-slot={
              type === 'top-banner'
                ? ADS_CONFIG.adsense.slots.topBanner
                : type === 'sidebar'
                ? ADS_CONFIG.adsense.slots.sidebar
                : ADS_CONFIG.adsense.slots.bottomBanner
            }
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      </div>
    );
  }

  // Pre-approval fallback: Hide empty banner boxes to prevent "Under Construction" flags
  return null;
}

/**
 * High-Polish Architecture & Privacy Trust Ribbon
 * Displayed below tools to highlight client-side security without cramping editor width.
 */
export function TrustGuaranteeBar({ className = '' }) {
  return (
    <div className={`mt-8 w-full rounded-2xl border border-slate-200/80 dark:border-slate-800/80 glass-panel p-5 sm:p-6 no-print ${className}`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Heading & Intro */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-500">
            <Sparkles className="w-4 h-4" />
            <span>Architecture & Privacy Guarantee</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            All transformations run 100% inside your local browser V8/Wasm engine. Zero telemetry, zero cloud uploads.
          </p>
        </div>

        {/* Right: Key badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">100% In-Browser</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80">
            <div className="w-2 h-2 rounded-full bg-sky-500 shrink-0"></div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Air-Gap Offline</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80">
            <div className="w-2 h-2 rounded-full bg-purple-500 shrink-0"></div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Zero Telemetry</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80">
            <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">GDPR Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
