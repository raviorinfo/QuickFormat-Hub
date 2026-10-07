import React from 'react';
import {
  FileSpreadsheet,
  FileCode,
  FileText,
  BookOpen,
  GitCompare,
  Binary,
  Link2,
  ShieldAlert,
  Terminal,
  Lock,
  Layers,
  Clock,
  Search,
  Cpu,
  ShieldCheck,
  Scale,
  Mail,
  Info,
  ListTree,
  Globe,
  Key,
  Tag,
  Fingerprint,
  Database,
  Zap
} from 'lucide-react';
import { ALL_TOOLS } from '../utils/toolsList';
import { BrandLogo } from './BrandLogo';

export function Footer({ onNavigate }) {
  const dataTools = ALL_TOOLS.filter((t) => t.category === 'Data');
  const securityTools = ALL_TOOLS.filter((t) => t.category === 'Security');
  const docTools = ALL_TOOLS.filter((t) => t.category === 'Docs');
  const devTools = ALL_TOOLS.filter((t) => t.category === 'Dev');

  const legalAndTrust = [
    { path: '/privacy-policy', label: 'Privacy Policy' },
    { path: '/terms-of-service', label: 'Terms of Service' },
    { path: '/about', label: 'About Us & Mission' },
    { path: '/contact', label: 'Contact Support' },
  ];

  return (
    <footer className="mt-10 border-t border-slate-200/80 dark:border-white/[0.08] bg-slate-50/70 dark:bg-[#060911]/90 text-slate-600 dark:text-slate-400 text-xs transition-colors duration-200 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6 sm:gap-8">
          {/* Brand & Mission Column */}
          <div className="col-span-2 space-y-2.5">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-sm">
              <BrandLogo className="w-6 h-6" />
              <span>QuickFormat Hub</span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                {ALL_TOOLS.length} UTILITIES
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300">
              <span className="text-slate-400 dark:text-slate-500">Powered by</span>
              <span className="font-bold text-sky-600 dark:text-sky-400 tracking-tight">Arvaan Core Logic</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Professional, air-gapped web utility suite. All transformations, cryptographic operations, parsing, and redactions execute exclusively inside your local browser memory with zero network uploads.
            </p>
            <div className="flex flex-col gap-1 pt-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> Zero Telemetry • 100% In-Browser
              </span>
              <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
                <Cpu className="w-3.5 h-3.5 shrink-0" /> 0ms Compute Latency (V8/Wasm Engine)
              </span>
            </div>
          </div>

          {/* 1. Data Tools Column */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 font-mono">
              Data Suite ({dataTools.length})
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              {dataTools.map((tool) => (
                <li key={tool.path}>
                  <a
                    href={tool.path}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(tool.path);
                    }}
                    className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors block truncate"
                  >
                    {tool.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 2. Security Suite Column */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 font-mono">
              Security ({securityTools.length})
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              {securityTools.map((tool) => (
                <li key={tool.path}>
                  <a
                    href={tool.path}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(tool.path);
                    }}
                    className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors block truncate"
                  >
                    {tool.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Dev & API Suite Column */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 font-mono">
              Dev & API ({devTools.length})
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              {devTools.map((tool) => (
                <li key={tool.path}>
                  <a
                    href={tool.path}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(tool.path);
                    }}
                    className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors block truncate"
                  >
                    {tool.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Docs & Legal Column */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 font-mono">
              Docs & Legal
            </h4>
            <div className="space-y-1 mb-2">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono block">Text & Docs</span>
              <ul className="space-y-1 text-[11px]">
                {docTools.map((tool) => (
                  <li key={tool.path}>
                    <a
                      href={tool.path}
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate(tool.path);
                      }}
                      className="hover:text-purple-500 dark:hover:text-purple-400 transition-colors block truncate"
                    >
                      {tool.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-1 pt-1 border-t border-slate-200/60 dark:border-white/[0.04]">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono block">Compliance</span>
              <ul className="space-y-1 text-[11px]">
                {legalAndTrust.map((item) => (
                  <li key={item.path}>
                    <a
                      href={item.path}
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate(item.path);
                      }}
                      className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors block font-medium"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* AdSense Compliance & Copyright */}
        <div className="mt-8 pt-4 border-t border-slate-200/80 dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p>© {new Date().getFullYear()} QuickFormat Hub.</p>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <p className="font-medium text-slate-600 dark:text-slate-300">
              Powered by <span className="font-bold text-sky-600 dark:text-sky-400">Arvaan Core Logic</span>
            </p>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <span>Built for developers, analysts & security engineers.</span>
          </div>
          <div className="flex items-center gap-2.5 text-[10px] text-slate-400 font-mono">
            <span>Air-Gapped Architecture</span>
            <span>•</span>
            <span>Google AdSense Compliant</span>
            <span>•</span>
            <span>GDPR & CCPA Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
