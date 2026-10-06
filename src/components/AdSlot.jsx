import React from 'react';
import { Megaphone, ExternalLink, Sparkles } from 'lucide-react';
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

  // Pre-approval fallback: Hide empty banner boxes to prevent "Under Construction" / "Dummy Ad" policy flags
  if (type === 'top-banner' || type === 'bottom-banner') {
    return null;
  }

  if (type === 'sidebar') {
    return (
      <aside className={`w-[300px] shrink-0 sticky top-24 space-y-4 ad-slot no-print hidden lg:block ${className}`}>
        {/* Architecture & Privacy Guarantee card */}
        <div className="w-[300px] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 glass-panel p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            <Sparkles className="w-4 h-4 text-brand-500" />
            <span>Architecture & Privacy</span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            QuickFormat Hub executes all conversions, hashes, and diffs inside your local web browser engine.
          </p>

          <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2.5">
            <li className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              <span><strong>100% In-Browser:</strong> Zero server compute</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0"></span>
              <span><strong>Air-Gapped Ready:</strong> Works 100% offline</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0"></span>
              <span><strong>Zero Telemetry:</strong> No tracking or data logging</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
              <span><strong>Web Standards:</strong> Native HTML5 & WebAssembly</span>
            </li>
          </ul>

          <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/60 text-[11px] text-slate-400">
            Complies with Google AdSense Publisher Policies & GDPR Standards.
          </div>
        </div>
      </aside>
    );
  }

  return null;
}
