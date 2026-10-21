import React from 'react';
import {
  FileSpreadsheet,
  ShieldCheck,
  Terminal,
  BookOpen,
  Cpu,
  Lock,
  ArrowUpRight,
  Sparkles,
  ExternalLink,
  Shield,
  Layers,
  CheckCircle2,
  Zap,
  ShoppingBag,
} from 'lucide-react';
import { ALL_TOOLS } from '../utils/toolsList';
import { BrandLogo } from './BrandLogo';

export function Footer({ onNavigate }) {
  const dataTools = ALL_TOOLS.filter((t) => t.category === 'Data');
  const securityTools = ALL_TOOLS.filter((t) => t.category === 'Security');
  const docTools = ALL_TOOLS.filter((t) => t.category === 'Docs');
  const devTools = ALL_TOOLS.filter((t) => t.category === 'Dev');
  const commerceTools = ALL_TOOLS.filter((t) => t.category === 'Commerce');

  const legalAndTrust = [
    { path: '/privacy-policy', label: 'Privacy Policy' },
    { path: '/terms-of-service', label: 'Terms of Service' },
    { path: '/about', label: 'About Us & Mission' },
    { path: '/contact', label: 'Contact Support' },
  ];

  return (
    <footer className="mt-14 border-t border-slate-300 dark:border-white/10 bg-white dark:bg-[#060912] text-slate-700 dark:text-slate-300 text-xs transition-colors duration-200 no-print relative overflow-hidden">
      {/* Subtle top ambient glow */}
      <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-sky-500/40 to-transparent pointer-events-none" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-32 bg-sky-500/5 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        
        {/* 1. Hero Bento Header: Brand Identity & Powered by Arvaan Core Logic */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-100/70 dark:bg-[#0a0f1e] border border-slate-300 dark:border-white/10 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <BrandLogo className="w-11 h-11 shrink-0 drop-shadow-md" />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  QuickFormat <span className="gradient-text">Hub</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300 border border-sky-300 dark:border-sky-500/40">
                  {ALL_TOOLS.length} UTILITIES
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Air-Gapped Engine
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 max-w-xl leading-relaxed font-medium">
                High-performance, zero-latency developer utilities. All parsing, cryptography, conversions, and redactions execute 100% inside your local browser memory.
              </p>
            </div>
          </div>

          {/* Official Provider Badge: Powered by Arvaan Core Logic */}
          <div className="w-full md:w-auto shrink-0 flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-2.5 p-3 sm:px-4 sm:py-3 rounded-xl bg-white dark:bg-[#0e1628] border border-slate-300 dark:border-white/15 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                ENGINEERED & POWERED BY
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
            </div>
            <a
              href="https://quickformat.arvaancorelogic.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-1.5 text-xs sm:text-sm font-black text-slate-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
            >
              <span className="bg-gradient-to-r from-sky-600 to-cyan-500 dark:from-sky-400 dark:to-cyan-300 bg-clip-text text-transparent group-hover:opacity-90">
                Arvaan Core Logic
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-sky-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>

        {/* 2. Structured Bento Tool Suites Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          
          {/* Card 1: Data Suite */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#0a0f1d] border border-slate-300 dark:border-white/10 hover:border-sky-500/50 shadow-xs transition-all duration-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-black text-xs uppercase tracking-wider font-mono">
                <div className="w-5 h-5 rounded-md bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-500">
                  <FileSpreadsheet className="w-3 h-3" />
                </div>
                <span>Data Suite</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 px-1.5 py-0.5 rounded">
                {dataTools.length} tools
              </span>
            </div>
            <ul className="space-y-1 text-[11px]">
              {dataTools.map((tool) => (
                <li key={tool.path}>
                  <a
                    href={tool.path}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(tool.path);
                    }}
                    className="flex items-center justify-between py-1.5 px-2 rounded-lg text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-white dark:hover:bg-white/10 font-medium transition-colors group"
                  >
                    <span className="truncate">{tool.label}</span>
                    <span className="text-[10px] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-sky-500">→</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 2: Security Vault */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#0a0f1d] border border-slate-300 dark:border-white/10 hover:border-emerald-500/50 shadow-xs transition-all duration-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-black text-xs uppercase tracking-wider font-mono">
                <div className="w-5 h-5 rounded-md bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                  <ShieldCheck className="w-3 h-3" />
                </div>
                <span>Security Vault</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 px-1.5 py-0.5 rounded">
                {securityTools.length} tools
              </span>
            </div>
            <ul className="space-y-1 text-[11px]">
              {securityTools.map((tool) => (
                <li key={tool.path}>
                  <a
                    href={tool.path}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(tool.path);
                    }}
                    className="flex items-center justify-between py-1.5 px-2 rounded-lg text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white dark:hover:bg-white/10 font-medium transition-colors group"
                  >
                    <span className="truncate">{tool.label}</span>
                    <span className="text-[10px] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-emerald-500">→</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 3: Dev & API Suite */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#0a0f1d] border border-slate-300 dark:border-white/10 hover:border-amber-500/50 shadow-xs transition-all duration-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-black text-xs uppercase tracking-wider font-mono">
                <div className="w-5 h-5 rounded-md bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
                  <Terminal className="w-3 h-3" />
                </div>
                <span>Dev & API Suite</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 px-1.5 py-0.5 rounded">
                {devTools.length} tools
              </span>
            </div>
            <ul className="space-y-1 text-[11px]">
              {devTools.map((tool) => (
                <li key={tool.path}>
                  <a
                    href={tool.path}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(tool.path);
                    }}
                    className="flex items-center justify-between py-1.5 px-2 rounded-lg text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-white dark:hover:bg-white/10 font-medium transition-colors group"
                  >
                    <span className="truncate">{tool.label}</span>
                    <span className="text-[10px] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-amber-500">→</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 4: Commerce & Print Suite */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#0a0f1d] border border-slate-300 dark:border-white/10 hover:border-rose-500/50 shadow-xs transition-all duration-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-black text-xs uppercase tracking-wider font-mono">
                <div className="w-5 h-5 rounded-md bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500">
                  <ShoppingBag className="w-3 h-3" />
                </div>
                <span>Commerce Suite</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 px-1.5 py-0.5 rounded">
                {commerceTools.length} tools
              </span>
            </div>
            <ul className="space-y-1 text-[11px]">
              {commerceTools.map((tool) => (
                <li key={tool.path}>
                  <a
                    href={tool.path}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(tool.path);
                    }}
                    className="flex items-center justify-between py-1.5 px-2 rounded-lg text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-white/10 font-medium transition-colors group"
                  >
                    <span className="truncate">{tool.label}</span>
                    <span className="text-[10px] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-rose-500">→</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 5: Documents, Legal & Trust */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#0a0f1d] border border-slate-300 dark:border-white/10 hover:border-purple-500/50 shadow-xs transition-all duration-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-black text-xs uppercase tracking-wider font-mono">
                <div className="w-5 h-5 rounded-md bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-500">
                  <BookOpen className="w-3 h-3" />
                </div>
                <span>Docs & Trust</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 px-1.5 py-0.5 rounded">
                {docTools.length + legalAndTrust.length} items
              </span>
            </div>
            
            <div className="space-y-2">
              <div>
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 font-mono block px-2 mb-1">
                  Document Tools
                </span>
                <ul className="space-y-0.5 text-[11px]">
                  {docTools.map((tool) => (
                    <li key={tool.path}>
                      <a
                        href={tool.path}
                        onClick={(e) => {
                          e.preventDefault();
                          onNavigate(tool.path);
                        }}
                        className="flex items-center justify-between py-1.5 px-2 rounded-lg text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-white dark:hover:bg-white/10 font-medium transition-colors group"
                      >
                        <span className="truncate">{tool.label}</span>
                        <span className="text-[10px] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-purple-500">→</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-white/10">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 font-mono block px-2 mb-1">
                  Trust & Compliance
                </span>
                <ul className="space-y-0.5 text-[11px]">
                  {legalAndTrust.map((item) => (
                    <li key={item.path}>
                      <a
                        href={item.path}
                        onClick={(e) => {
                          e.preventDefault();
                          onNavigate(item.path);
                        }}
                        className="flex items-center justify-between py-1 px-2 rounded-lg text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-white dark:hover:bg-white/10 transition-colors font-medium group"
                      >
                        <span className="truncate">{item.label}</span>
                        <span className="text-[10px] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-sky-500">→</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

        </div>

        {/* 3. Bottom Legal, Copyright & Verification Pills Bar */}
        <div className="pt-6 border-t border-slate-300 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-2 gap-y-1">
            <span>© {new Date().getFullYear()} QuickFormat Hub.</span>
            <span className="text-slate-400 dark:text-slate-600">•</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              Powered by <strong className="text-sky-600 dark:text-sky-400 font-black">Arvaan Core Logic</strong>
            </span>
            <span className="text-slate-400 dark:text-slate-600">•</span>
            <span>Crafted for developers, analysts & security auditors.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-mono">
            <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/[0.06] border border-slate-300 dark:border-white/15 text-slate-800 dark:text-slate-200 font-bold flex items-center gap-1.5 shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Air-Gapped Sandbox
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/[0.06] border border-slate-300 dark:border-white/15 text-slate-800 dark:text-slate-200 font-bold flex items-center gap-1.5 shadow-xs">
              <Shield className="w-3.5 h-3.5 text-sky-500" />
              AdSense Certified
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/[0.06] border border-slate-300 dark:border-white/15 text-slate-800 dark:text-slate-200 font-bold flex items-center gap-1.5 shadow-xs">
              <Lock className="w-3.5 h-3.5 text-purple-500" />
              GDPR & CCPA Compliant
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
