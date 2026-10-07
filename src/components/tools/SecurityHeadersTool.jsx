import React, { useState, useMemo, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Copy,
  Download,
  Trash2,
  Server,
  Code2,
  FileCode,
  Sparkles,
  Lock,
  Layers,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import {
  evaluateHeaders,
  generateHardenedServerConfig,
  SAMPLE_SECURITY_HEADERS,
} from '../../utils/securityHeadersUtils';
import { useToast } from '../../context/ToastContext';
import { ToolHeroHeader } from '../common/ToolHeroHeader';
import { WindowHeader } from '../common/WindowHeader';
import { CopyButton } from '../common/CopyButton';
import { StatCard } from '../common/StatCard';
import { PresetChips } from '../common/PresetChips';
import { fireConfetti } from '../../utils/confetti';

const PRESETS = [
  {
    id: 'hardened',
    label: 'Hardened Production (A+)',
    description: 'Complete suite with HSTS, CSP, and isolation policies',
    headers: SAMPLE_SECURITY_HEADERS,
  },
  {
    id: 'vulnerable',
    label: 'Vulnerable / Default (F)',
    description: 'Insecure headers without HSTS, CSP, or frame protection',
    headers: `HTTP/1.1 200 OK
Date: Wed, 07 Oct 2026 06:00:00 GMT
Server: Apache/2.4.41 (Ubuntu)
Content-Type: text/html; charset=UTF-8
Connection: keep-alive`,
  },
  {
    id: 'weak_csp',
    label: 'Weak CSP Warning (B)',
    description: 'Has HSTS but CSP uses unsafe-inline and missing nosniff',
    headers: `HTTP/2 200 OK
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: default-src * 'unsafe-inline' 'unsafe-eval';
X-Frame-Options: SAMEORIGIN`,
  },
];

export function SecurityHeadersTool() {
  const toast = useToast();
  const [headersInput, setHeadersInput] = useState(SAMPLE_SECURITY_HEADERS);
  const [serverTab, setServerTab] = useState('nginx'); // 'nginx' | 'cloudflare' | 'vercel' | 'apache' | 'helmet'
  const [fontSize, setFontSize] = useState('normal');
  const [isZenMode, setIsZenMode] = useState(false);
  const [activePreset, setActivePreset] = useState('hardened');

  const evaluation = useMemo(() => evaluateHeaders(headersInput), [headersInput]);

  const hardenedSnippet = useMemo(
    () => generateHardenedServerConfig(serverTab),
    [serverTab]
  );

  const stats = useMemo(() => {
    if (!evaluation) return { pass: 0, warn: 0, fail: 0 };
    let pass = 0;
    let warn = 0;
    let fail = 0;
    evaluation.findings.forEach((f) => {
      if (f.pass) pass++;
      else if (f.level === 'warning') warn++;
      else fail++;
    });
    return { pass, warn, fail };
  }, [evaluation]);

  const fontSizeClass =
    fontSize === 'small' ? 'text-xs' : fontSize === 'large' ? 'text-base' : 'text-xs sm:text-sm';

  return (
    <div className={`space-y-6 ${isZenMode ? 'fixed inset-0 z-50 p-6 bg-slate-950 overflow-y-auto' : ''}`}>
      {/* Studio Tool Hero Header */}
      <ToolHeroHeader
        icon={ShieldCheck}
        category="Security & Hardening"
        badge="OWASP Security Standard"
        title="HTTP Security Headers & CSP Evaluator"
        description="Inspect HTTP response headers and Content-Security-Policy (CSP) directives. Audit against XSS, clickjacking, and SSL stripping with instant security grades and hardened server snippets."
        actions={
          evaluation ? (
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold shadow-sm ${
                evaluation.scorePct >= 85
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                  : evaluation.scorePct >= 50
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                  : 'bg-rose-500/10 text-rose-500 border-rose-500/30'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-current animate-pulse" />
              <span>Grade: {evaluation.grade} ({evaluation.scorePct}%)</span>
            </div>
          ) : null
        }
      />

      {/* Preset Chips Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap p-3 rounded-2xl glass-panel">
        <PresetChips
          presets={PRESETS}
          onSelect={(p) => {
            setHeadersInput(p.headers);
            setActivePreset(p.id);
            toast.success(`Loaded "${p.label}"`);
          }}
          activeId={activePreset}
          label="Test Profiles"
        />

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Lock className="w-3.5 h-3.5 text-emerald-500" />
          <span>100% Client-Side Inspection</span>
        </div>
      </div>

      {/* Executive KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          icon={ShieldCheck}
          label="Security Grade"
          value={evaluation ? evaluation.grade : '—'}
          subtext={evaluation ? `Overall Score: ${evaluation.scorePct}/100` : 'Awaiting headers'}
          color={evaluation?.gradeColor || 'slate'}
        />
        <StatCard
          icon={CheckCircle2}
          label="Headers Passed"
          value={`${stats.pass} / 6`}
          subtext="Defenses active"
          color="emerald"
        />
        <StatCard
          icon={AlertTriangle}
          label="Warnings / Weak"
          value={stats.warn.toString()}
          subtext="Suboptimal configurations"
          color="amber"
        />
        <StatCard
          icon={XCircle}
          label="Critical Gaps"
          value={stats.fail.toString()}
          subtext="Missing key defenses"
          color={stats.fail > 0 ? 'rose' : 'slate'}
        />
      </div>

      {/* Main Dual-Pane Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* LEFT: Raw Headers Input */}
        <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xl overflow-hidden editor-pane flex flex-col focus-within:ring-2 focus-within:ring-sky-500/30 transition-all">
          <WindowHeader
            title="HTTP Response Headers"
            badge="Raw Headers"
            linesCount={headersInput ? headersInput.split('\n').length : 0}
            charsCount={headersInput.length}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            isZenMode={isZenMode}
            onToggleZen={() => setIsZenMode(!isZenMode)}
          >
            <button
              onClick={() => {
                setHeadersInput(SAMPLE_SECURITY_HEADERS);
                setActivePreset('hardened');
                toast.success('Loaded sample headers');
              }}
              className="text-xs text-sky-500 hover:text-sky-400 font-medium px-2 py-1 rounded hover:bg-sky-500/10 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={() => {
                setHeadersInput('');
                setActivePreset(null);
                toast.info('Cleared input');
              }}
              className="p-1.5 text-slate-400 hover:text-rose-500 rounded transition-colors"
              title="Clear input"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </WindowHeader>

          <div className="p-2">
            <textarea
              value={headersInput}
              onChange={(e) => {
                setHeadersInput(e.target.value);
                setActivePreset(null);
              }}
              placeholder="Paste raw HTTP response headers or curl output here (e.g. Strict-Transport-Security: max-age=31536000)..."
              rows={16}
              className={`w-full p-4 font-mono code-viewport bg-slate-50 dark:bg-[#050811] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-none leading-relaxed min-h-[400px] border border-transparent ${fontSizeClass}`}
              spellCheck={false}
            />
          </div>

          <div className="p-3 bg-slate-50/70 dark:bg-[#070b14]/70 border-t border-slate-200/60 dark:border-white/[0.06] text-xs text-slate-500 flex items-center justify-between">
            <span>Tip: Copy headers from Chrome DevTools (Network tab → Headers).</span>
            <span className="font-mono text-[11px]">{evaluation?.parsedHeadersCount || 0} tokens parsed</span>
          </div>
        </div>

        {/* RIGHT: Audit Findings & Recommendations */}
        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-sky-500" />
                <span>Security Audit Findings</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">OWASP Top 10 Alignment</span>
            </div>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {evaluation?.findings.map((f) => (
                <div
                  key={f.header}
                  className={`p-3 rounded-xl border transition-colors ${
                    f.pass
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : f.level === 'warning'
                      ? 'bg-amber-500/5 border-amber-500/20'
                      : 'bg-rose-500/5 border-rose-500/20'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      {f.pass ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : f.level === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                      <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
                        {f.header}
                      </span>
                    </div>
                    <span className="text-[10px] font-sans text-slate-400 font-medium">
                      {f.alias}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300 ml-6">
                    {f.message}
                  </p>

                  {f.value && (
                    <div className="mt-1.5 ml-6 p-2 rounded-lg bg-black/20 font-mono text-[10px] text-slate-400 break-all">
                      {f.value}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hardened Server Config Generator */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-sky-500" />
              <span>1-Click Hardened Server Configuration Snippet</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Copy pre-configured, audited headers to achieve an instant A+ grade on your production infrastructure.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-200/60 dark:bg-white/[0.06] p-0.5 rounded-xl border border-slate-200/60 dark:border-white/[0.08] self-start sm:self-auto overflow-x-auto">
            {[
              { id: 'nginx', label: 'Nginx' },
              { id: 'cloudflare', label: 'Cloudflare' },
              { id: 'vercel', label: 'Vercel' },
              { id: 'apache', label: 'Apache' },
              { id: 'helmet', label: 'Helmet.js' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setServerTab(tab.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  serverTab === tab.id
                    ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <textarea
            readOnly
            value={hardenedSnippet}
            rows={7}
            className="w-full p-4 font-mono text-xs code-viewport bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sky-600 dark:text-sky-300 focus:outline-none resize-none leading-relaxed"
          />
          <div className="absolute top-3 right-3">
            <CopyButton
              text={() => hardenedSnippet}
              label="Copy Snippet"
              copiedLabel="Copied!"
              variant="default"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
