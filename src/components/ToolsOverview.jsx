import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  ChevronDown,
  CheckCircle,
  BookOpen,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Cpu,
  Lock,
  Layers,
  ArrowRight,
  Maximize2
} from 'lucide-react';

export function ToolsOverview({ toolMeta }) {
  const [activeTab, setActiveTab] = useState('guide'); // 'guide' | 'security' | 'troubleshoot' | 'faqs'
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [showAllSections, setShowAllSections] = useState(false);

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

  const tabs = [
    { id: 'guide', label: 'Guide & Capabilities', icon: BookOpen },
    { id: 'security', label: 'Security & Architecture', icon: ShieldCheck },
    ...(troubleshooting && troubleshooting.length > 0
      ? [{ id: 'troubleshoot', label: 'Troubleshooting', icon: AlertTriangle }]
      : []),
    { id: 'faqs', label: 'FAQs & Answers', icon: HelpCircle },
  ];

  return (
    <section className="mt-14 pt-8 border-t border-slate-200/80 dark:border-white/[0.08] max-w-6xl mx-auto px-4 tools-overview no-print space-y-6">
      {/* Header & Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 mb-1 font-mono">
            <Sparkles className="w-4 h-4 text-sky-500" />
            <span>Developer Documentation & Reference</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Technical Manual: {toolMeta.title}
          </h2>
        </div>

        {/* Toggle Expand View */}
        <button
          onClick={() => setShowAllSections(!showAllSections)}
          className="btn-secondary"
        >
          <Layers className="w-3.5 h-3.5 text-sky-500" />
          <span>{showAllSections ? 'Show Tabbed View' : 'Expand All Sections'}</span>
        </button>
      </div>

      {/* Modern Segmented Navigation Tabs */}
      {!showAllSections && (
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.06] overflow-x-auto no-scrollbar shadow-xs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-white/[0.1] text-sky-600 dark:text-sky-400 shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-500' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Tab Content: 1. Guide & Capabilities */}
      {(showAllSections || activeTab === 'guide') && (
        <div className="space-y-6 animate-fade-in">
          {/* Technical Intro Box */}
          <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 flex items-center gap-2 font-mono">
              <BookOpen className="w-4 h-4 text-sky-500" />
              <span>Architectural Overview</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {intro}
            </p>
          </div>

          {/* Grid: Core Capabilities & How to Use */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Core Capabilities */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 flex items-center gap-2 font-mono">
                <Sparkles className="w-4 h-4 text-sky-500" />
                <span>Key Capabilities & Engine Specs</span>
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                {features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* How to Use Step-by-Step */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 flex items-center gap-2 font-mono">
                <ArrowRight className="w-4 h-4 text-sky-500" />
                <span>Step-by-Step Instructions</span>
              </h3>
              <ol className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                {howTo.map((step, idx) => (
                  <li key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] leading-relaxed border border-slate-200/50 dark:border-white/[0.05]">
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: 2. Security & Architecture */}
      {(showAllSections || activeTab === 'security') && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-5 animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Client-Side Security vs Cloud Uploads</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            QuickFormat Hub executes all algorithms inside your browser sandbox. Your proprietary data never touches external network pipelines or third-party servers.
          </p>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/[0.08]">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100/80 dark:bg-white/[0.04] border-b border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider font-mono">
                  <th className="py-3 px-4">Evaluation Metric</th>
                  <th className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold">QuickFormat Hub (In-Browser)</th>
                  <th className="py-3 px-4 text-slate-500">Legacy Server Utilities</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-white/[0.04] text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-[#050811]/60">
                <tr>
                  <td className="py-3 px-4 font-semibold">Data Privacy & Storage</td>
                  <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-medium">100% In-Memory. Zero server upload.</td>
                  <td className="py-3 px-4 text-slate-500">Uploaded over HTTP; often logged in DBs.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold">Offline Operation</td>
                  <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-medium">Fully works air-gapped / offline.</td>
                  <td className="py-3 px-4 text-slate-500">Completely breaks without internet.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold">Compute Latency</td>
                  <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-medium">0ms network latency (local CPU execution).</td>
                  <td className="py-3 px-4 text-slate-500">200ms–3000ms server queue round-trips.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold">Regulatory Compliance</td>
                  <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-medium">Compliant by design (No processing entity).</td>
                  <td className="py-3 px-4 text-slate-500">Requires strict Data Processing Agreements.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: 3. Troubleshooting */}
      {(showAllSections || activeTab === 'troubleshoot') && troubleshooting && troubleshooting.length > 0 && (
        <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-4 animate-fade-in">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 flex items-center gap-2 font-mono">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Common Pitfalls & Troubleshooting</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {troubleshooting.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] space-y-1.5">
                <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
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

      {/* Tab Content: 4. FAQs Accordion */}
      {(showAllSections || activeTab === 'faqs') && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] space-y-5 animate-fade-in">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 mb-1 font-mono">
              <HelpCircle className="w-4 h-4 text-sky-500" />
              <span>Frequently Asked Questions</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Questions & In-Depth Technical Answers
            </h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="border border-slate-200 dark:border-white/[0.08] rounded-xl overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                    className="w-full text-left px-5 py-3.5 flex items-center justify-between gap-4 bg-slate-50/70 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-200">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-sky-500' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 py-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-[#050811]/60 leading-relaxed border-t border-slate-100 dark:border-white/[0.06]">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
