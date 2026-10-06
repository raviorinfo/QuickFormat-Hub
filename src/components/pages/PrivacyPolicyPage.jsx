import React from 'react';
import { Shield, Lock, Eye, Cookie, FileText, CheckCircle, ExternalLink, HelpCircle } from 'lucide-react';

export function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-10 text-slate-800 dark:text-slate-200">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-500 mb-2">
          <Shield className="w-4 h-4" />
          <span>Legal & Transparency</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Last Updated: October 6, 2026 • Effective Date: October 6, 2026
        </p>
      </div>

      {/* Core Privacy Pillar */}
      <div className="p-6 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-slate-800 dark:text-slate-200 space-y-3">
        <div className="flex items-center gap-2 font-bold text-base text-brand-600 dark:text-brand-400">
          <Lock className="w-5 h-5" />
          <span>Our Core Promise: 100% Client-Side Processing</span>
        </div>
        <p className="text-sm leading-relaxed">
          QuickFormat Hub is designed with an uncompromising <strong>Privacy-by-Architecture</strong> model. Every utility on this site—including JSON converters, PII data masking, JWT decoders, PDF parsing, regex evaluation, and diff checking—executes <strong>entirely inside your local web browser’s memory</strong>. We do <strong>not</strong> send, log, store, inspect, or transmit your files, text payloads, tokens, or personal records to any remote server or cloud infrastructure.
        </p>
      </div>

      {/* Section 1: Overview */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          1. Information We Do Not Collect
        </h2>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Unlike traditional web conversion platforms that upload your files to server backends, QuickFormat Hub functions strictly offline within your browser:
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          <li className="flex items-start gap-2 p-3 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span><strong>No Payload Storage:</strong> We never store your JSON, CSV, PDF, or text diff content.</span>
          </li>
          <li className="flex items-start gap-2 p-3 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span><strong>No Token Interception:</strong> JWT tokens and cURL requests are parsed in-memory with zero network calls.</span>
          </li>
          <li className="flex items-start gap-2 p-3 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span><strong>No Database Logging:</strong> There is no backend database capturing user transformations.</span>
          </li>
          <li className="flex items-start gap-2 p-3 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span><strong>No Account Requirement:</strong> You can use all 13 tools without creating an account or providing an email.</span>
          </li>
        </ul>
      </section>

      {/* Section 2: Advertising & Google AdSense Policy Compliance */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          2. Third-Party Advertising & Google AdSense
        </h2>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          To maintain QuickFormat Hub as a 100% free resource for developers and creators worldwide, we partner with third-party advertising partners, including <strong>Google AdSense</strong>. Please carefully read the following mandatory disclosures regarding third-party ad serving:
        </p>

        <div className="p-5 rounded-2xl bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-3 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <p>
            • <strong>Third-Party Vendor Cookies:</strong> Google, as a third-party vendor, uses cookies to serve ads on QuickFormat Hub.
          </p>
          <p>
            • <strong>Advertising Cookies:</strong> Google’s use of advertising cookies (such as DoubleClick and Google advertising cookies) enables it and its certified ad partners to serve personalized or contextual advertisements to users based on their prior visits to QuickFormat Hub and/or other websites on the Internet.
          </p>
          <p>
            • <strong>Opting Out of Personalized Advertising:</strong> Users may freely opt out of personalized advertising by visiting Google's official <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-brand-500 underline hover:text-brand-400 inline-flex items-center gap-0.5">Google Ads Settings <ExternalLink className="w-3 h-3" /></a>.
          </p>
          <p>
            • <strong>Third-Party Ad Network Opt-Out:</strong> Alternatively, users can opt out of a third-party vendor's use of cookies for personalized advertising by visiting the Network Advertising Initiative or Digital Advertising Alliance portal at <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-brand-500 underline hover:text-brand-400 inline-flex items-center gap-0.5">aboutads.info <ExternalLink className="w-3 h-3" /></a>.
          </p>
          <p>
            • <strong>Non-Personalized Ads:</strong> If you disable personalized ads, you will still see advertisements, but they will be contextual rather than based on your browsing history.
          </p>
        </div>
      </section>

      {/* Section 3: Cookies & Local Storage */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          3. Cookies, Web Storage, & Preferences
        </h2>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          QuickFormat Hub utilizes standard browser storage mechanisms solely to optimize your interactive user experience:
        </p>
        <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
            <strong>Essential Local Storage (`localStorage`):</strong> Used exclusively to remember your visual theme preference (Dark or Light mode), sound effects mute toggle (`quickformat_sound_enabled`), and optional local scratchpad history. This data never leaves your device.
          </div>
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
            <strong>Third-Party Analytical & Advertising Cookies:</strong> Placed by certified advertising networks (e.g., Google AdSense) to deliver and measure ad placements, prevent fraud, and frequency-cap impressions.
          </div>
        </div>
      </section>

      {/* Section 4: Log Files & Telemetry */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          4. Web Server Logs & Basic Analytics
        </h2>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Like virtually all websites, our static web hosting provider (e.g., CDN, edge network) may log standard automated technical data when your browser requests web page files. This may include your IP address, browser user-agent, referring URL, and timestamp. These server logs are collected solely for system stability, DDoS mitigation, and edge cache delivery. They are never correlated with any user input payloads.
        </p>
      </section>

      {/* Section 5: GDPR & CCPA Rights */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          5. GDPR & CCPA/CPRA Privacy Rights
        </h2>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          We respect the rights of users under international privacy regulations including the European General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA/CPRA):
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          <li><strong>Right to Know & Access:</strong> Because we do not collect personal identities or store your files, we do not maintain a profile on you.</li>
          <li><strong>Right to Erasure / Deletion:</strong> You can delete all locally stored preferences instantly by clearing your browser cache and localStorage for this domain.</li>
          <li><strong>Right to Opt-Out of Sale / Sharing:</strong> We do not sell your personal data. For advertising cookies, you can manage your preferences via the opt-out links provided in Section 2.</li>
        </ul>
      </section>

      {/* Section 6: Children's Online Privacy Protection */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          6. Children’s Online Privacy Protection Act (COPPA)
        </h2>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          QuickFormat Hub does not knowingly address or solicit information from children under the age of 13. If you believe a child has provided personal information to third parties through our site, please contact us immediately so we can assist.
        </p>
      </section>

      {/* Section 7: Contact Us */}
      <section className="p-6 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          7. Contact Information & Privacy Officer
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          If you have any questions, concerns, or requests regarding this Privacy Policy, our client-side architecture, or our third-party advertising partners, please reach out to our team:
        </p>
        <div className="text-xs sm:text-sm font-mono text-slate-800 dark:text-slate-200">
          Email: <span className="text-brand-500 font-semibold">support@quickformathub.com</span>
        </div>
        <p className="text-xs text-slate-500">
          QuickFormat Hub • An Open Web Developer Utilities Platform
        </p>
      </section>
    </div>
  );
}
