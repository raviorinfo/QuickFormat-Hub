import React from 'react';
import { Sparkles, Shield, Cpu, Heart, CheckCircle2, Globe, Code2, Users, ArrowRight } from 'lucide-react';

export function AboutUsPage({ onNavigate }) {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-12 text-slate-800 dark:text-slate-200">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-500 mb-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Our Story & Mission</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          About QuickFormat Hub
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          The privacy-first developer utility suite engineered for engineers, data analysts, security auditors, and product builders who refuse to compromise on data security.
        </p>
      </div>

      {/* The Problem We Solved */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="w-6 h-6 text-brand-500" />
          The Problem: The Unseen Risk of Online Formatters
        </h2>
        <div className="space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          <p>
            Every single day, millions of developers, customer support specialists, and data engineers paste proprietary JSON database exports, live authentication JWT tokens, production API payloads, and internal log files into random online formatters found through web searches.
          </p>
          <p>
            What most users do not realize is that the majority of legacy utility websites silently transmit your raw inputs to backend servers, logging them in databases, cache stores, or analytics pipelines. If you accidentally paste an API secret, an unredacted patient record, or a production JWT token, your organization’s sensitive data is now sitting on someone else’s server.
          </p>
          <div className="p-5 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-slate-800 dark:text-slate-200 font-medium">
            <strong>We built QuickFormat Hub to permanently eliminate this vulnerability.</strong> By utilizing modern WebAssembly, Web Workers, and local JavaScript runtime sandboxes, every single transformation happens <em>100% inside your local browser memory</em>. Your data never touches a server.
          </div>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Cpu className="w-6 h-6 text-purple-500" />
          Our 4 Engineering Pillars
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold">
              01
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Zero-Server Data Transmission</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              We operate strictly zero backend compute for user conversions. Disconnect your Wi-Fi or turn on Airplane Mode, and QuickFormat Hub continues to convert, diff, parse, and format without a hitch.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-500 font-bold">
              02
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Instant 0ms Compute Latency</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              No HTTP round-trips, no server queueing, and no cold starts. File processing runs at the speed of your machine’s multi-core CPU and browser V8 engine.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 font-bold">
              03
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Zero External Bloat</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Built with precision React, Tailwind CSS, and zero heavy backend frameworks. Audio feedback is synthesized on the fly via the HTML5 Web Audio API without downloading external audio files.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-bold">
              04
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Accessible & Ergonomic UX</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Crafted with macOS window chrome, instant font-size scalers, full keyboard shortcuts palette (<kbd>?</kbd> and <kbd>Ctrl+K</kbd>), and dark/light modes tailored for extended developer work sessions.
            </p>
          </div>
        </div>
      </section>

      {/* The 13 Tools Suite */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Code2 className="w-6 h-6 text-emerald-500" />
          The Complete Utility Suite
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          QuickFormat Hub offers 13 purpose-built developer utilities categorized into four functional groups:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider text-brand-500">
              Data & Conversion
            </h4>
            <ul className="space-y-1 text-slate-600 dark:text-slate-400">
              <li>• <strong>JSON to CSV & Excel:</strong> Flattens nested JSON hierarchies with custom delimiters.</li>
              <li>• <strong>CSV to JSON:</strong> Unflattens dot-delimited headers into structured JSON trees.</li>
              <li>• <strong>JSON to TypeScript/Zod:</strong> Generates type interfaces, Zod schemas, and SQL tables.</li>
              <li>• <strong>Base64 File & Text:</strong> Encodes/decodes strings, images, and binary files.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider text-emerald-500">
              Security & Privacy
            </h4>
            <ul className="space-y-1 text-slate-600 dark:text-slate-400">
              <li>• <strong>AI Prompt Sanitizer (PII Redactor):</strong> Scrubs SSNs, emails, IPs, and keys.</li>
              <li>• <strong>Offline JWT Inspector:</strong> Decodes header and payload claims with expiration countdown.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider text-purple-500">
              Documents & Diff
            </h4>
            <ul className="space-y-1 text-slate-600 dark:text-slate-400">
              <li>• <strong>Markdown Editor & Exporter:</strong> Live preview with PDF and HTML export.</li>
              <li>• <strong>PDF Reader & Markdown:</strong> Renders local PDF canvas and extracts Markdown AST.</li>
              <li>• <strong>Text & Code Difference Checker:</strong> Side-by-side synchronized diffs and patch downloads.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider text-amber-500">
              Developer Utilities
            </h4>
            <ul className="space-y-1 text-slate-600 dark:text-slate-400">
              <li>• <strong>cURL Converter:</strong> Transforms curl commands into JavaScript Fetch, Python Requests, etc.</li>
              <li>• <strong>URL & Query Parser:</strong> Decodes and modifies query strings into editable tables.</li>
              <li>• <strong>Cron Scheduler Visualizer:</strong> Calculates upcoming execution schedules in human words.</li>
              <li>• <strong>RegEx Playground:</strong> Highlighting match visualizer with cheat sheet library.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Sustainable Funding */}
      <section className="p-6 rounded-2xl bg-slate-100 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-500" />
          How QuickFormat Hub Remains 100% Free
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          QuickFormat Hub is proudly powered and maintained by <strong>Arvaan Core Logic</strong> as a free service for personal and enterprise workflows without subscription paywalls. We sustain our domain hosting, global edge CDN caching, and continuous tool development through ethical, non-intrusive display advertising (via certified partners like Google AdSense) and developer tool sponsorships.
        </p>
      </section>

      {/* CTA */}
      <div className="text-center pt-4">
        <button
          onClick={() => onNavigate('/json-to-csv')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 transition-all cursor-pointer"
        >
          <span>Explore All Utilities</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
