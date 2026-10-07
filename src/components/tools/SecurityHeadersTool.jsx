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
  Sliders,
  SlidersHorizontal,
  Info,
  Wand2
} from 'lucide-react';
import {
  evaluateHeaders,
  generateHardenedServerConfig,
  buildCspString,
  SAMPLE_SECURITY_HEADERS,
} from '../../utils/securityHeadersUtils';
import { useToast } from '../../context/ToastContext';
import { ToolHeroHeader } from '../common/ToolHeroHeader';
import { WindowHeader } from '../common/WindowHeader';
import { CopyButton } from '../common/CopyButton';
import { StatCard } from '../common/StatCard';
import { PresetChips } from '../common/PresetChips';
import { ToggleSwitch } from '../common/ToggleSwitch';

const PRESETS = [
  {
    id: 'hardened',
    label: 'Hardened Production (A+)',
    description: 'Complete suite with HSTS, CSP, and Cross-Origin isolation',
    headers: `HTTP/2 200 OK
date: Wed, 07 Oct 2026 06:19:03 GMT
content-type: text/html; charset=utf-8
strict-transport-security: max-age=31536000; includeSubDomains; preload
content-security-policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; frame-ancestors 'none';
x-frame-options: DENY
x-content-type-options: nosniff
referrer-policy: strict-origin-when-cross-origin
permissions-policy: camera=(), microphone=(), geolocation=()
cross-origin-opener-policy: same-origin
cross-origin-embedder-policy: require-corp
cross-origin-resource-policy: same-origin`,
  },
  {
    id: 'vulnerable',
    label: 'Vulnerable & Info Leaks (F)',
    description: 'Insecure headers exposing Apache & PHP runtime versions',
    headers: `HTTP/1.1 200 OK
Date: Wed, 07 Oct 2026 06:00:00 GMT
Server: Apache/2.4.41 (Ubuntu)
X-Powered-By: PHP/7.4.3
X-AspNet-Version: 4.0.30319
Content-Type: text/html; charset=UTF-8
Connection: keep-alive`,
  },
  {
    id: 'weak_csp',
    label: 'Weak CSP Warning (C)',
    description: 'Has HSTS but CSP uses unsafe-inline and missing nosniff',
    headers: `HTTP/2 200 OK
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: default-src * 'unsafe-inline' 'unsafe-eval';
X-Frame-Options: SAMEORIGIN
Server: cloudflare`,
  },
];

export function SecurityHeadersTool() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('audit'); // 'audit' | 'csp_builder'
  const [headersInput, setHeadersInput] = useState(PRESETS[0].headers);
  const [serverTab, setServerTab] = useState('nginx');
  const [fontSize, setFontSize] = useState('normal');
  const [isZenMode, setIsZenMode] = useState(false);
  const [activePreset, setActivePreset] = useState('hardened');

  // CSP Builder State
  const [cspDirectives, setCspDirectives] = useState({
    defaultSelf: true,
    scriptSelf: true,
    scriptUnsafeInline: false,
    scriptUnsafeEval: false,
    styleSelf: true,
    styleUnsafeInline: true,
    imgSelf: true,
    imgData: true,
    imgHttps: true,
    fontSelf: true,
    fontGoogle: true,
    connectSelf: true,
    frameNone: true,
    objectNone: true,
    upgradeInsecure: true,
  });

  const evaluation = useMemo(() => evaluateHeaders(headersInput), [headersInput]);

  const hardenedSnippet = useMemo(
    () => generateHardenedServerConfig(serverTab),
    [serverTab]
  );

  // Generate built CSP
  const builtCspHeader = useMemo(() => {
    const d = {};
    if (cspDirectives.defaultSelf) d['default-src'] = ["'self'"];

    const scripts = [];
    if (cspDirectives.scriptSelf) scripts.push("'self'");
    if (cspDirectives.scriptUnsafeInline) scripts.push("'unsafe-inline'");
    if (cspDirectives.scriptUnsafeEval) scripts.push("'unsafe-eval'");
    if (scripts.length) d['script-src'] = scripts;

    const styles = [];
    if (cspDirectives.styleSelf) styles.push("'self'");
    if (cspDirectives.styleUnsafeInline) styles.push("'unsafe-inline'");
    if (styles.length) d['style-src'] = styles;

    const imgs = [];
    if (cspDirectives.imgSelf) imgs.push("'self'");
    if (cspDirectives.imgData) imgs.push('data:');
    if (cspDirectives.imgHttps) imgs.push('https:');
    if (imgs.length) d['img-src'] = imgs;

    const fonts = [];
    if (cspDirectives.fontSelf) fonts.push("'self'");
    if (cspDirectives.fontGoogle) fonts.push('https://fonts.gstatic.com');
    if (fonts.length) d['font-src'] = fonts;

    if (cspDirectives.connectSelf) d['connect-src'] = ["'self'"];
    if (cspDirectives.frameNone) d['frame-ancestors'] = ["'none'"];
    if (cspDirectives.objectNone) d['object-src'] = ["'none'"];
    if (cspDirectives.upgradeInsecure) d['upgrade-insecure-requests'] = true;

    return buildCspString(d);
  }, [cspDirectives]);

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
        badge="OWASP & Cross-Origin Isolation"
        title="HTTP Security Headers & CSP Evaluator"
        description="Inspect response headers for XSS, Clickjacking, and SSL stripping. Detects technology leakage banners (Server/X-Powered-By), audits Cross-Origin Isolation (COOP/COEP), and includes a Visual CSP Builder."
        actions={
          <div className="flex items-center gap-1.5 bg-slate-200/60 dark:bg-white/[0.06] p-0.5 rounded-xl border border-slate-200/60 dark:border-white/[0.08]">
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'audit'
                  ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Headers Auditor
            </button>
            <button
              onClick={() => setActiveTab('csp_builder')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'csp_builder'
                  ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Visual CSP Builder
            </button>
          </div>
        }
      />

      {/* ============================================================== */}
      {/* TAB 1: AUDIT MODE */}
      {/* ============================================================== */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
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
              value={`${stats.pass} / ${evaluation?.findings.length || 9}`}
              subtext="Defenses active"
              color="emerald"
            />
            <StatCard
              icon={AlertTriangle}
              label="Information Leaks"
              value={`${evaluation?.leaks?.length || 0} Banners`}
              subtext="Server / Runtime leakage"
              color={evaluation?.leaks?.length > 0 ? 'amber' : 'emerald'}
            />
            <StatCard
              icon={XCircle}
              label="Critical Gaps"
              value={stats.fail.toString()}
              subtext="Missing key defenses"
              color={stats.fail > 0 ? 'rose' : 'slate'}
            />
          </div>

          {/* Information Disclosure Leaks Alert */}
          {evaluation?.leaks?.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Information Disclosure Leaks Detected ({evaluation.leaks.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {evaluation.leaks.map((leak) => (
                  <div
                    key={leak.header}
                    className="p-2.5 rounded-xl bg-black/10 dark:bg-white/5 border border-amber-500/20 font-mono"
                  >
                    <span className="font-bold text-slate-900 dark:text-slate-100">{leak.header}: </span>
                    <span className="text-amber-500 font-bold">{leak.value}</span>
                    <p className="text-[11px] font-sans text-slate-600 dark:text-slate-300 mt-1">{leak.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                    setHeadersInput(PRESETS[0].headers);
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
                          : f.level === 'info'
                          ? 'bg-blue-500/5 border-blue-500/20'
                          : 'bg-rose-500/5 border-rose-500/20'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          {f.pass ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : f.level === 'warning' ? (
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                          ) : f.level === 'info' ? (
                            <Info className="w-4 h-4 text-blue-500 shrink-0" />
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
      )}

      {/* ============================================================== */}
      {/* TAB 2: VISUAL CSP BUILDER */}
      {/* ============================================================== */}
      {activeTab === 'csp_builder' && (
        <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xl space-y-6 animate-fade-in">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-sky-500" />
              <span>Interactive Content-Security-Policy (CSP) Builder</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configure directives with intuitive toggles. Generates a robust CSP header to prevent Cross-Site Scripting (XSS) and data exfiltration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Script-src */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.06] space-y-2">
              <span className="font-mono font-bold text-xs text-sky-500 block">script-src (JavaScript)</span>
              <div className="space-y-2 pt-1">
                <ToggleSwitch
                  label="'self' (First-party scripts)"
                  checked={cspDirectives.scriptSelf}
                  onChange={(v) => setCspDirectives({ ...cspDirectives, scriptSelf: v })}
                  size="sm"
                />
                <ToggleSwitch
                  label="'unsafe-inline' (Inline scripts)"
                  checked={cspDirectives.scriptUnsafeInline}
                  onChange={(v) => setCspDirectives({ ...cspDirectives, scriptUnsafeInline: v })}
                  size="sm"
                />
                <ToggleSwitch
                  label="'unsafe-eval' (eval() execution)"
                  checked={cspDirectives.scriptUnsafeEval}
                  onChange={(v) => setCspDirectives({ ...cspDirectives, scriptUnsafeEval: v })}
                  size="sm"
                />
              </div>
            </div>

            {/* Style-src */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.06] space-y-2">
              <span className="font-mono font-bold text-xs text-purple-500 block">style-src (CSS stylesheets)</span>
              <div className="space-y-2 pt-1">
                <ToggleSwitch
                  label="'self' (First-party styles)"
                  checked={cspDirectives.styleSelf}
                  onChange={(v) => setCspDirectives({ ...cspDirectives, styleSelf: v })}
                  size="sm"
                />
                <ToggleSwitch
                  label="'unsafe-inline' (Tailwind/CSS-in-JS)"
                  checked={cspDirectives.styleUnsafeInline}
                  onChange={(v) => setCspDirectives({ ...cspDirectives, styleUnsafeInline: v })}
                  size="sm"
                />
              </div>
            </div>

            {/* Img-src */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.06] space-y-2">
              <span className="font-mono font-bold text-xs text-emerald-500 block">img-src (Images)</span>
              <div className="space-y-2 pt-1">
                <ToggleSwitch
                  label="'self' (First-party images)"
                  checked={cspDirectives.imgSelf}
                  onChange={(v) => setCspDirectives({ ...cspDirectives, imgSelf: v })}
                  size="sm"
                />
                <ToggleSwitch
                  label="data: (Base64 inline icons)"
                  checked={cspDirectives.imgData}
                  onChange={(v) => setCspDirectives({ ...cspDirectives, imgData: v })}
                  size="sm"
                />
                <ToggleSwitch
                  label="https: (External HTTPS images)"
                  checked={cspDirectives.imgHttps}
                  onChange={(v) => setCspDirectives({ ...cspDirectives, imgHttps: v })}
                  size="sm"
                />
              </div>
            </div>

            {/* Font-src */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.06] space-y-2">
              <span className="font-mono font-bold text-xs text-amber-500 block">font-src (Webfonts)</span>
              <div className="space-y-2 pt-1">
                <ToggleSwitch
                  label="'self' (Local font files)"
                  checked={cspDirectives.fontSelf}
                  onChange={(v) => setCspDirectives({ ...cspDirectives, fontSelf: v })}
                  size="sm"
                />
                <ToggleSwitch
                  label="Google Fonts (fonts.gstatic.com)"
                  checked={cspDirectives.fontGoogle}
                  onChange={(v) => setCspDirectives({ ...cspDirectives, fontGoogle: v })}
                  size="sm"
                />
              </div>
            </div>

            {/* Frame and Isolation */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.06] space-y-2">
              <span className="font-mono font-bold text-xs text-rose-500 block">Isolation & Anti-Clickjacking</span>
              <div className="space-y-2 pt-1">
                <ToggleSwitch
                  label="frame-ancestors 'none'"
                  checked={cspDirectives.frameNone}
                  onChange={(v) => setCspDirectives({ ...cspDirectives, frameNone: v })}
                  size="sm"
                />
                <ToggleSwitch
                  label="object-src 'none' (Disables Flash/Java)"
                  checked={cspDirectives.objectNone}
                  onChange={(v) => setCspDirectives({ ...cspDirectives, objectNone: v })}
                  size="sm"
                />
                <ToggleSwitch
                  label="upgrade-insecure-requests"
                  checked={cspDirectives.upgradeInsecure}
                  onChange={(v) => setCspDirectives({ ...cspDirectives, upgradeInsecure: v })}
                  size="sm"
                />
              </div>
            </div>
          </div>

          {/* Generated CSP Header Display */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 font-mono">Generated Header:</span>
              <div className="flex items-center gap-2">
                <CopyButton
                  text={() => `Content-Security-Policy: ${builtCspHeader}`}
                  label="Copy CSP"
                  copiedLabel="Copied!"
                  variant="subtle"
                />
                <button
                  onClick={() => {
                    const next = `${headersInput.trim()}\nContent-Security-Policy: ${builtCspHeader}`;
                    setHeadersInput(next);
                    setActiveTab('audit');
                    toast.success('Injected CSP into Header Auditor!');
                  }}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-sky-500/10 text-sky-500 hover:bg-sky-500/20 transition-colors flex items-center gap-1"
                >
                  <span>Inject into Auditor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="font-mono text-xs text-sky-600 dark:text-sky-400 break-all select-all leading-relaxed p-3 bg-white dark:bg-black/30 rounded-xl border border-slate-200 dark:border-white/5">
              Content-Security-Policy: {builtCspHeader}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
