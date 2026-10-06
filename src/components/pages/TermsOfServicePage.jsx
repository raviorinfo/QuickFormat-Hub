import React from 'react';
import { FileText, AlertTriangle, ShieldCheck, Scale, Globe, CheckCircle } from 'lucide-react';

export function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-10 text-slate-800 dark:text-slate-200">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-500 mb-2">
          <Scale className="w-4 h-4" />
          <span>Terms & Conditions</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Last Updated: October 6, 2026 • Effective Date: October 6, 2026
        </p>
      </div>

      {/* Intro Box */}
      <div className="p-6 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        <p>
          Welcome to <strong>QuickFormat Hub</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;). By accessing, navigating, or utilizing our suite of 100% in-browser utilities, formatters, and developer tools located at <strong>quickformat.arvaancorelogic.com</strong>, you acknowledge and agree to be bound by these Terms of Service. If you disagree with any portion of these terms, please discontinue using the website immediately.
        </p>
      </div>

      {/* Section 1: Nature of the Service */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          1. Description & Nature of the Service
        </h2>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          QuickFormat Hub provides a complimentary collection of browser-based utilities including JSON to CSV/Excel conversion, CSV to JSON tree unflattening, Markdown to HTML/PDF export, PDF reading and AST markdown extraction, side-by-side text difference checking, Base64 encoding/decoding, URL parameter manipulation, PII log sanitization, cURL converter, offline JWT inspection, and regular expression evaluation.
        </p>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          All computations, transformations, cryptographic hashes, and file parsing occur <strong>client-side</strong> via your local browser engine. We provide this software as a public utility to support developers, data scientists, engineers, and researchers worldwide.
        </p>
      </section>

      {/* Section 2: Acceptable Use */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          2. Acceptable Use Policy
        </h2>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          You agree to use QuickFormat Hub solely for legitimate personal or commercial purposes. You agree not to:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          <li>Attempt to disrupt, overwhelm, or launch Denial-of-Service (DoS) attacks against our edge content delivery network.</li>
          <li>Scrape or programmatically abuse site endpoints to impersonate or mislead third parties.</li>
          <li>Circumvent or tamper with client-side security measures or advertising display systems.</li>
          <li>Use the platform in any manner that infringes on applicable local, national, or international laws or regulations.</li>
        </ul>
      </section>

      {/* Section 3: Intellectual Property */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          3. Ownership of Content & Intellectual Property
        </h2>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          <strong>Your Input Data:</strong> You retain complete, unrestricted ownership of all text, documents, code snippets, tokens, and files that you input into QuickFormat Hub. Because we do not upload or store your payloads, we claim zero ownership, license, or rights over your data.
        </p>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          <strong>Website IP:</strong> The QuickFormat Hub brand, logos, user interface designs, custom CSS styling, sound effects synthesis code, and documentation are proprietary property of QuickFormat Hub and protected by intellectual property laws.
        </p>
      </section>

      {/* Section 4: Disclaimer of Warranties */}
      <section className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3 text-slate-800 dark:text-slate-200">
        <div className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400 text-base">
          <AlertTriangle className="w-5 h-5" />
          <span>4. Disclaimer of Warranties (&ldquo;As-Is&rdquo;)</span>
        </div>
        <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          QUICKFORMAT HUB AND ALL ACCOMPANYING UTILITIES ARE PROVIDED ON AN &ldquo;AS-IS&rdquo; AND &ldquo;AS-AVAILABLE&rdquo; BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. WHILE OUR CODE IS CAREFULLY TESTED, WE DO NOT GUARANTEE THAT CALCULATIONS, CONVERSIONS, OR PII REDACTIONS ARE 100% ERROR-FREE OR SUITABLE FOR LEGAL BENCHMARKS. YOU ASSUME FULL RESPONSIBILITY FOR VERIFYING CONVERTED OUTPUTS BEFORE PRODUCTION USE.
        </p>
      </section>

      {/* Section 5: Limitation of Liability */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          5. Limitation of Liability
        </h2>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          IN NO EVENT SHALL QUICKFORMAT HUB, ITS MAINTAINERS, AUTHORS, OR AFFILIATES BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES (INCLUDING LOSS OF DATA, REVENUE, GOODWILL, OR BUSINESS INTERRUPTION) ARISING OUT OF YOUR USE OR INABILITY TO USE OUR SERVICES, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
        </p>
      </section>

      {/* Section 6: Third-Party Links & Advertising */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          6. Third-Party Links & Advertising Partners
        </h2>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Our website displays third-party advertisements served by partners such as Google AdSense and may contain hyperlinks to external sites. We do not endorse, inspect, or assume responsibility for any third-party websites, content, products, or services. Interactions with advertisers are solely between you and the respective third party.
        </p>
      </section>

      {/* Section 7: Modifications & Governing Law */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          7. Modifications to Terms
        </h2>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          We reserve the right to revise or replace these Terms of Service at any time. Any changes will be posted on this page with an updated &ldquo;Last Updated&rdquo; date. Your continued use of the website following any changes signifies your acceptance of the updated terms.
        </p>
      </section>

      {/* Contact box */}
      <div className="p-6 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
        <div className="font-bold text-slate-900 dark:text-white">Questions Regarding Our Terms?</div>
        <p>Please contact our administrative team at: <span className="font-mono text-brand-500 font-semibold">legal@quickformathub.com</span></p>
      </div>
    </div>
  );
}
