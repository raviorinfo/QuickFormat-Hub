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
  Info
} from 'lucide-react';

export function Footer({ onNavigate }) {
  const dataTools = [
    { path: '/json-to-csv', label: 'JSON to CSV / Excel' },
    { path: '/csv-to-json', label: 'CSV to JSON' },
    { path: '/json-to-types', label: 'JSON to TypeScript/SQL' },
    { path: '/base64-tool', label: 'Base64 & Image URL' },
  ];

  const securityAndDocTools = [
    { path: '/pii-redactor', label: 'AI Prompt Sanitizer (PII)' },
    { path: '/jwt-inspector', label: 'Offline JWT Inspector' },
    { path: '/markdown-editor', label: 'Markdown to HTML & PDF' },
    { path: '/pdf-to-markdown', label: 'PDF Reader & Markdown' },
    { path: '/text-diff', label: 'Text & Code Diff' },
  ];

  const devTools = [
    { path: '/curl-converter', label: 'cURL to Fetch / Python' },
    { path: '/url-parser', label: 'URL & Query Parser' },
    { path: '/cron-scheduler', label: 'Cron Visualizer' },
    { path: '/regex-tester', label: 'Regex Tester & Library' },
  ];

  const legalAndTrust = [
    { path: '/privacy-policy', label: 'Privacy Policy' },
    { path: '/terms-of-service', label: 'Terms of Service' },
    { path: '/about', label: 'About Us & Mission' },
    { path: '/contact', label: 'Contact Us & Support' },
  ];

  return (
    <footer className="mt-16 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 text-sm transition-colors duration-200 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand & Mission */}
          <div className="md:col-span-1 sm:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base">
              <span>QuickFormat Hub</span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-500 border border-brand-500/20">
                v3.0 Pro Suite
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Ultra-fast, zero-overhead browser utility suite. Every conversion, diff check, token decode, and PII redaction runs exclusively inside your local browser JavaScript engine with zero server telemetry.
            </p>
            <div className="flex flex-col gap-1.5 pt-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> End-to-End Client Memory Isolation
              </span>
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-brand-400 shrink-0" /> Zero Network Latency (Offline Ready)
              </span>
            </div>
          </div>

          {/* Data Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Data & Formats
            </h4>
            <ul className="space-y-2 text-xs">
              {dataTools.map((tool) => (
                <li key={tool.path}>
                  <a
                    href={tool.path}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(tool.path);
                    }}
                    className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
                  >
                    {tool.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Docs & Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Docs & Security
            </h4>
            <ul className="space-y-2 text-xs">
              {securityAndDocTools.map((tool) => (
                <li key={tool.path}>
                  <a
                    href={tool.path}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(tool.path);
                    }}
                    className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
                  >
                    {tool.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Dev & API */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Dev & API
            </h4>
            <ul className="space-y-2 text-xs">
              {devTools.map((tool) => (
                <li key={tool.path}>
                  <a
                    href={tool.path}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(tool.path);
                    }}
                    className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
                  >
                    {tool.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Trust & Legal
            </h4>
            <ul className="space-y-2 text-xs">
              {legalAndTrust.map((item) => (
                <li key={item.path}>
                  <a
                    href={item.path}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(item.path);
                    }}
                    className="hover:text-brand-500 dark:hover:text-brand-400 transition-colors font-medium text-slate-700 dark:text-slate-300"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* AdSense Compliance & Copyright */}
        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} QuickFormat Hub. Built for developers, analysts & creators.</p>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Compliant with Google AdSense Policies</span>
            <span>•</span>
            <span>GDPR & CCPA Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
