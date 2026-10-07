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
 * Studio Architecture & Privacy Trust Ribbon
 * Displayed below tools to highlight client-side security without cramping editor width.
 */
export function TrustGuaranteeBar({ className = '' }) {
  return (
    <div className={`mt-5 w-full rounded-xl border border-slate-200/80 dark:border-white/[0.08] glass-panel p-3 sm:p-3.5 no-print relative overflow-hidden ${className}`}>
      {/* Top subtle accent gradient */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-sky-500 via-indigo-500 to-cyan-400 opacity-60" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Heading & Intro */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Architecture & Privacy Guarantee</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xl leading-normal">
            All transformations run 100% inside your local browser V8/Wasm engine. Zero telemetry, zero cloud uploads, zero data retention.
          </p>
        </div>

        {/* Right: Key badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/70 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06]">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse"></div>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">100% In-Browser</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/70 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06]">
            <div className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0"></div>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">Air-Gap Offline</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/70 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06]">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0"></div>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">Zero Telemetry</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/70 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06]">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></div>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">GDPR Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
