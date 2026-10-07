import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Globe,
  Sliders,
  Copy,
  Check,
  AlertTriangle,
  Play,
  Code2,
  Sparkles,
  Info,
  Server,
  Terminal,
  Bug,
  HelpCircle,
  CheckCircle2,
  XCircle,
  ArrowRight
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import {
  DEFAULT_CORS_CONFIG,
  COMMON_METHODS,
  COMMON_HEADERS,
  auditCorsConfig,
  simulateCorsPreflight,
  generateCorsServerSnippet,
  testOriginBypasses,
  diagnoseCorsError,
  CORS_ERROR_DATABASE,
} from '../../utils/corsUtils';

export function CorsAnalyzerTool() {
  const toast = useToast();
  const [config, setConfig] = useState(DEFAULT_CORS_CONFIG);
  const [originInput, setOriginInput] = useState(DEFAULT_CORS_CONFIG.origins.join('\n'));
  const [activeTab, setActiveTab] = useState('audit'); // 'audit' | 'simulator' | 'bypasses' | 'error_explainer' | 'code'
  const [activeSnippetServer, setActiveSnippetServer] = useState('express');
  const [copied, setCopied] = useState(false);

  // Preflight Simulator state
  const [testOrigin, setTestOrigin] = useState('https://app.example.com');
  const [testMethod, setTestMethod] = useState('POST');
  const [testHeaders, setTestHeaders] = useState('Content-Type, Authorization');

  // Error Explainer state
  const [rawConsoleError, setRawConsoleError] = useState(
    "Access to XMLHttpRequest at 'https://api.example.com/v1/user' from origin 'https://app.example.com' has been blocked by CORS policy: The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'."
  );

  // Sync origins text into config
  const handleOriginChange = (val) => {
    setOriginInput(val);
    const parsed = val
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    setConfig((prev) => ({ ...prev, origins: parsed }));
  };

  const toggleMethod = (method) => {
    setConfig((prev) => {
      const exists = prev.methods.includes(method);
      const nextMethods = exists
        ? prev.methods.filter((m) => m !== method)
        : [...prev.methods, method];
      return { ...prev, methods: nextMethods };
    });
  };

  // Run audit
  const auditIssues = useMemo(() => auditCorsConfig(config), [config]);

  // Run simulation
  const simulationResult = useMemo(
    () => simulateCorsPreflight(config, testOrigin, testMethod, testHeaders),
    [config, testOrigin, testMethod, testHeaders]
  );

  // Run bypass tests
  const targetDomain = config.origins[0] || 'example.com';
  const bypassTests = useMemo(() => {
    const list = testOriginBypasses(targetDomain);
    return list.map((test) => {
      const res = simulateCorsPreflight(config, test.testOrigin, 'GET', []);
      return {
        ...test,
        isAllowedByServer: res.originAllowed,
      };
    });
  }, [config, targetDomain]);

  // Error diagnosis
  const diagnosedError = useMemo(() => diagnoseCorsError(rawConsoleError), [rawConsoleError]);

  // Server snippet
  const serverCode = useMemo(
    () => generateCorsServerSnippet(config, activeSnippetServer),
    [config, activeSnippetServer]
  );

  const copyCode = () => {
    navigator.clipboard.writeText(serverCode);
    setCopied(true);
    toast.success('Copied server CORS configuration');
    setTimeout(() => setCopied(false), 2000);
  };

  const loadVulnerableSample = () => {
    const vuln = {
      origins: ['*'],
      allowWildcardOrigin: true,
      allowCredentials: true,
      methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      exposedHeaders: [],
      maxAge: 0,
    };
    setConfig(vuln);
    setOriginInput('*');
    toast.success('Loaded insecure CORS configuration (audit warnings active)');
  };

  const loadSecureSample = () => {
    setConfig(DEFAULT_CORS_CONFIG);
    setOriginInput(DEFAULT_CORS_CONFIG.origins.join('\n'));
    toast.success('Loaded hardened CORS configuration');
  };

  return (
    <div className="space-y-4">
      {/* Tool Header & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 sm:pb-3.5 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-sky-500/15 text-sky-500 flex items-center justify-center shrink-0">
              <Globe className="w-3.5 h-3.5" />
            </div>
            <span>CORS Policy Builder, Explainer & Bypass Auditor</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Build bulletproof CORS rules, test regex bypass exploits, diagnose console errors, and export server snippets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <button
            type="button"
            data-sample-trigger="true"
            onClick={loadSecureSample}
            className="btn-secondary py-1 px-2.5 text-xs flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Secure Preset</span>
          </button>
          <button
            type="button"
            onClick={loadVulnerableSample}
            className="btn-secondary py-1 px-2.5 text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Test Vulnerable</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Policy Controls & Live Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Policy Configuration Controls */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel rounded-2xl p-4 sm:p-5 space-y-4 border border-slate-200/80 dark:border-white/[0.08]">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-sky-500" />
              <span>CORS Policy Controls</span>
            </div>

            {/* Allowed Origins */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Allowed Origins (one per line)</span>
                <span className="text-[10px] font-mono text-slate-400">
                  {config.origins.length} origin(s)
                </span>
              </label>
              <textarea
                value={originInput}
                onChange={(e) => handleOriginChange(e.target.value)}
                placeholder="https://app.example.com&#10;https://api.example.com"
                rows={4}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-white/[0.08] text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500 transition-all resize-none"
              />
            </div>

            {/* Credentials & Wildcard Toggles */}
            <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-white/[0.06]">
              <button
                type="button"
                onClick={() =>
                  setConfig((prev) => ({
                    ...prev,
                    allowCredentials: !prev.allowCredentials,
                  }))
                }
                className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.05] text-xs transition-colors hover:border-sky-500/50"
              >
                <div className="text-left">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    Allow Credentials
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Access-Control-Allow-Credentials: true
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    config.allowCredentials
                      ? 'bg-sky-500 border-sky-500 text-white'
                      : 'border-slate-300 dark:border-white/20'
                  }`}
                />
              </button>

              <button
                type="button"
                onClick={() =>
                  setConfig((prev) => ({
                    ...prev,
                    allowWildcardOrigin: !prev.allowWildcardOrigin,
                  }))
                }
                className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.05] text-xs transition-colors hover:border-sky-500/50"
              >
                <div className="text-left">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    Allow Wildcard Origin (*)
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Access-Control-Allow-Origin: *
                  </div>
                </div>
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    config.allowWildcardOrigin
                      ? 'bg-sky-500 border-sky-500 text-white'
                      : 'border-slate-300 dark:border-white/20'
                  }`}
                />
              </button>
            </div>

            {/* Allowed HTTP Methods */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Allowed HTTP Methods
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_METHODS.map((m) => {
                  const isChecked = config.methods.includes(m);
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => toggleMethod(m)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                        isChecked
                          ? 'bg-sky-500 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-white/[0.04] text-slate-500 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preflight Cache Max-Age */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Preflight Cache (Access-Control-Max-Age)</span>
                <span className="text-[10px] font-mono text-sky-500">{config.maxAge} seconds</span>
              </label>
              <div className="grid grid-cols-4 gap-1.5 text-xs">
                {[0, 3600, 86400, 604800].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setConfig((p) => ({ ...p, maxAge: sec }))}
                    className={`p-1.5 rounded-lg font-mono text-[11px] font-semibold border transition-all ${
                      config.maxAge === sec
                        ? 'border-sky-500 bg-sky-500/10 text-sky-500'
                        : 'border-slate-200 dark:border-white/[0.08] text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {sec === 0 ? '0s' : sec === 3600 ? '1 Hour' : sec === 86400 ? '24 Hours' : '7 Days'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tabbed Views */}
        <div className="lg:col-span-7 space-y-4">
          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] text-xs font-bold overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeTab === 'audit'
                  ? 'bg-white dark:bg-white/[0.1] text-sky-500 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Audit</span>
              {auditIssues.length > 0 && (
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-rose-500 text-white">
                  {auditIssues.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('simulator')}
              className={`py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeTab === 'simulator'
                  ? 'bg-white dark:bg-white/[0.1] text-sky-500 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>Simulator</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bypasses')}
              className={`py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeTab === 'bypasses'
                  ? 'bg-white dark:bg-white/[0.1] text-sky-500 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              <Bug className="w-3.5 h-3.5 text-amber-500" />
              <span>Bypass Fuzzer</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('error_explainer')}
              className={`py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeTab === 'error_explainer'
                  ? 'bg-white dark:bg-white/[0.1] text-sky-500 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-purple-500" />
              <span>Error Explainer</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('code')}
              className={`py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeTab === 'code'
                  ? 'bg-white dark:bg-white/[0.1] text-sky-500 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Server Snippets</span>
            </button>
          </div>

          {/* TAB 1: OWASP Security Audit */}
          {activeTab === 'audit' && (
            <div className="space-y-3 animate-slide-up">
              {auditIssues.length === 0 ? (
                <div className="glass-panel rounded-2xl p-6 text-center space-y-2 border-l-4 border-l-emerald-500">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    Zero Vulnerabilities Detected!
                  </div>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Your CORS policy does not exhibit illegal wildcard credentials, null-origin bypasses, or insecure HTTP endpoints.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {auditIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className={`glass-panel rounded-2xl p-4 border-l-4 space-y-1.5 ${
                        issue.severity === 'CRITICAL'
                          ? 'border-l-rose-500 bg-rose-500/[0.02]'
                          : issue.severity === 'HIGH'
                          ? 'border-l-orange-500 bg-orange-500/[0.02]'
                          : 'border-l-amber-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <AlertTriangle
                            className={`w-4 h-4 ${
                              issue.severity === 'CRITICAL' ? 'text-rose-500' : 'text-orange-500'
                            }`}
                          />
                          {issue.title}
                        </span>
                        <span
                          className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            issue.severity === 'CRITICAL'
                              ? 'bg-rose-500/15 text-rose-500 border border-rose-500/20'
                              : 'bg-orange-500/15 text-orange-500 border border-orange-500/20'
                          }`}
                        >
                          {issue.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {issue.desc}
                      </p>
                      <div className="p-2 rounded-lg bg-black/5 dark:bg-white/[0.02] text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
                        <Info className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
                        <span><strong>Fix:</strong> {issue.recommendation}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Preflight Simulator */}
          {activeTab === 'simulator' && (
            <div className="glass-panel rounded-2xl p-4 sm:p-5 space-y-4 animate-slide-up">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Request Origin Header
                  </label>
                  <input
                    type="text"
                    value={testOrigin}
                    onChange={(e) => setTestOrigin(e.target.value)}
                    placeholder="https://app.example.com"
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-white/[0.08] text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    HTTP Request Method
                  </label>
                  <select
                    value={testMethod}
                    onChange={(e) => setTestMethod(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-white/[0.08] text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    {COMMON_METHODS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status Outcome */}
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between ${
                  simulationResult.passed
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  {simulationResult.passed ? (
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                  )}
                  <div>
                    <div className="text-xs font-extrabold uppercase tracking-wide">
                      {simulationResult.passed
                        ? 'Preflight Passed (CORS Allowed)'
                        : 'Preflight Blocked by Browser'}
                    </div>
                    <div className="text-[11px] opacity-80 font-mono">
                      HTTP {simulationResult.passed ? '204 No Content' : '403 Forbidden / CORS Network Error'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Simulated Response Headers */}
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Simulated Server Response Headers
                </div>
                <div className="code-viewport p-3 text-xs leading-relaxed overflow-x-auto">
                  {Object.keys(simulationResult.responseHeaders).length === 0 ? (
                    <span className="text-rose-400 font-mono">
                      // No Access-Control headers returned (Origin not allowed)
                    </span>
                  ) : (
                    Object.entries(simulationResult.responseHeaders).map(([key, val]) => (
                      <div key={key} className="font-mono">
                        <span className="text-sky-400 font-semibold">{key}</span>: {val}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Origin Bypass Fuzzer */}
          {activeTab === 'bypasses' && (
            <div className="glass-panel rounded-2xl p-4 sm:p-5 space-y-4 animate-slide-up">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Bug className="w-4 h-4 text-amber-500" />
                  <span>Origin Regex Bypass & Reflection Auditor</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Tests how your CORS policy responds to 4 classic OWASP regex evasion and origin hijacking vectors targeting <strong>{targetDomain}</strong>.
                </p>
              </div>

              <div className="space-y-2.5">
                {bypassTests.map((test, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-start justify-between gap-3 text-xs ${
                      test.isAllowedByServer
                        ? 'bg-rose-500/10 border-rose-500/30'
                        : 'bg-emerald-500/5 border-emerald-500/20'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{test.attackType}</span>
                        <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-black/10 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                          {test.testOrigin}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{test.desc}</p>
                    </div>

                    <div className="shrink-0 self-center">
                      {test.isAllowedByServer ? (
                        <span className="px-2 py-1 rounded-md bg-rose-500 text-white font-mono text-[10px] font-bold flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> VULNERABLE
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-md bg-emerald-500/15 text-emerald-500 font-mono text-[10px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> BLOCKED (SAFE)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Reverse CORS Error Explainer */}
          {activeTab === 'error_explainer' && (
            <div className="glass-panel rounded-2xl p-4 sm:p-5 space-y-4 animate-slide-up">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-purple-500" />
                  <span>Reverse CORS Console Error Explainer</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Paste any red CORS error message copied from your browser DevTools console to get an immediate root cause explanation and exact fix.
                </p>
              </div>

              {/* Sample error buttons */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="text-slate-400 font-semibold mr-1">Sample Errors:</span>
                <button
                  type="button"
                  onClick={() =>
                    setRawConsoleError(
                      "Access to XMLHttpRequest at 'https://api.example.com' from origin 'https://app.com' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource."
                    )
                  }
                  className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 hover:text-sky-500 font-mono"
                >
                  No Allow-Origin Header
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setRawConsoleError(
                      "Access to fetch at 'https://api.example.com' from origin 'https://app.com' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: It does not have HTTP ok status."
                    )
                  }
                  className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 hover:text-sky-500 font-mono"
                >
                  Preflight Non-OK Status
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setRawConsoleError(
                      "Access to fetch at 'https://api.example.com' from origin 'https://app.com' has been blocked by CORS policy: Request header field x-custom-token is not allowed by Access-Control-Allow-Headers in preflight response."
                    )
                  }
                  className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 hover:text-sky-500 font-mono"
                >
                  Header Disallowed
                </button>
              </div>

              <textarea
                value={rawConsoleError}
                onChange={(e) => setRawConsoleError(e.target.value)}
                placeholder="Paste browser console CORS error here..."
                rows={3}
                className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-white/[0.08] rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500 resize-none"
              />

              {diagnosedError && (
                <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-500" />
                    <span className="font-bold text-xs text-purple-600 dark:text-purple-400">
                      Diagnosis: {diagnosedError.title}
                    </span>
                  </div>

                  <div className="text-xs space-y-1">
                    <strong className="text-slate-700 dark:text-slate-300 block">Root Cause:</strong>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{diagnosedError.cause}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-black/10 dark:bg-black/30 text-xs font-mono text-emerald-500 space-y-1 border border-white/5">
                    <span className="font-bold block text-slate-400 text-[10px] uppercase font-sans">Recommended Fix:</span>
                    <p className="leading-relaxed">{diagnosedError.fix}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Server Code Snippets */}
          {activeTab === 'code' && (
            <div className="glass-panel rounded-2xl p-4 sm:p-5 space-y-4 animate-slide-up">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-white/[0.06] pb-3">
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'express', label: 'Express.js' },
                    { id: 'fastapi', label: 'FastAPI' },
                    { id: 'nginx', label: 'Nginx' },
                    { id: 'springboot', label: 'Spring Boot' },
                    { id: 'cloudflare', label: 'Cloudflare' },
                    { id: 'gin', label: 'Go Gin' },
                  ].map((srv) => (
                    <button
                      key={srv.id}
                      type="button"
                      onClick={() => setActiveSnippetServer(srv.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        activeSnippetServer === srv.id
                          ? 'bg-sky-500 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {srv.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={copyCode}
                  className="btn-primary py-1 px-3 text-xs flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Code</span>
                </button>
              </div>

              <div className="code-viewport p-4 text-xs font-mono overflow-x-auto whitespace-pre leading-relaxed max-h-[360px] overflow-y-auto">
                {serverCode}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
