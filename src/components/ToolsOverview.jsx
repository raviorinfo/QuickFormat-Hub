import React, { useState, useEffect } from 'react';
import { HelpCircle, ChevronDown, CheckCircle, BookOpen, Sparkles, ShieldCheck, AlertTriangle, Cpu, Lock, FileCode, Check } from 'lucide-react';

export function ToolsOverview({ toolMeta }) {
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Inject JSON-LD Schema (SoftwareApplication & FAQPage) dynamically for Googlebot
  useEffect(() => {
    if (!toolMeta || !toolMeta.seoOverview) return;

    const schemaId = 'quickformat-jsonld-schema';
    let scriptTag = document.getElementById(schemaId);
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = schemaId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const { intro, faqs } = toolMeta.seoOverview;

    const schemaData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebApplication',
          'name': `${toolMeta.title} — QuickFormat Hub`,
          'applicationCategory': 'DeveloperApplication',
          'operatingSystem': 'Any (Browser-based)',
          'browserRequirements': 'Requires JavaScript. Works in Chrome, Firefox, Safari, Edge.',
          'description': toolMeta.description,
          'offers': {
            '@type': 'Offer',
            'price': '0',
            'priceCurrency': 'USD',
          },
          'featureList': toolMeta.seoOverview.features,
        },
        {
          '@type': 'FAQPage',
          'mainEntity': faqs.map((faq) => ({
            '@type': 'Question',
            'name': faq.q,
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': faq.a,
            },
          })),
        },
      ],
    };

    scriptTag.textContent = JSON.stringify(schemaData);

    return () => {
      const el = document.getElementById(schemaId);
      if (el) el.remove();
    };
  }, [toolMeta]);

  if (!toolMeta || !toolMeta.seoOverview) return null;

  const { intro, features, howTo, troubleshooting, faqs } = toolMeta.seoOverview;

  return (
    <section className="mt-14 pt-10 border-t border-slate-200 dark:border-slate-800/80 max-w-5xl mx-auto px-4 tools-overview no-print space-y-12">
      {/* Overview Header & Technical Introduction */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-500 mb-2">
          <BookOpen className="w-4 h-4" />
          <span>Documentation & In-Depth Guide</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Technical Specifications & Guide: {toolMeta.title}
        </h2>
        <div className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-4xl space-y-3">
          <p>{intro}</p>
        </div>
      </div>

      {/* Grid: Core Capabilities & Step-by-Step Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Core Capabilities */}
        <div className="bg-white dark:bg-slate-900/60 p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-500" />
            Core Capabilities & Specs
          </h3>
          <ul className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {features.map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="bg-white dark:bg-slate-900/60 p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand-500" />
            How to Use This Utility
          </h3>
          <ol className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {howTo.map((step, idx) => (
              <li key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 leading-relaxed border border-slate-100 dark:border-slate-800">
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Architectural Security Comparison: Client-Side vs Cloud Uploads */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-100/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          <span>Security Architecture: Client-Side vs Traditional Cloud Tools</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Why enterprise developers, security auditors, and data teams choose QuickFormat Hub over legacy server-based utilities:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Evaluation Metric</th>
                <th className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-bold">QuickFormat Hub (In-Browser)</th>
                <th className="py-2.5 px-3 text-slate-500">Legacy Online Utilities</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              <tr>
                <td className="py-2.5 px-3 font-semibold">Data Privacy & Storage</td>
                <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-medium">100% In-Memory. Zero server uploads.</td>
                <td className="py-2.5 px-3 text-slate-500">Sent over HTTP; frequently logged in DBs.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold">Offline Operation</td>
                <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-medium">Fully works air-gapped / offline.</td>
                <td className="py-2.5 px-3 text-slate-500">Fails without active internet connection.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold">Compute Latency</td>
                <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-medium">0ms network latency (local CPU speed).</td>
                <td className="py-2.5 px-3 text-slate-500">200ms–3000ms server queue round-trip.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold">Compliance (GDPR / HIPAA)</td>
                <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-medium">Compliant by design (No processing entity).</td>
                <td className="py-2.5 px-3 text-slate-500">Requires strict Data Processing Agreements.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Common Errors & Troubleshooting Tips */}
      {troubleshooting && troubleshooting.length > 0 && (
        <div className="bg-white dark:bg-slate-900/60 p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Troubleshooting, Edge Cases & Common Errors
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {troubleshooting.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  {item.title}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEO FAQs Accordion */}
      <div className="bg-white dark:bg-slate-900/40 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800/80">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-500 mb-1">
            <HelpCircle className="w-4 h-4" />
            <span>Frequently Asked Questions</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Common Questions & In-Depth Technical Answers
          </h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-200">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-brand-500' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 py-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900/90 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
