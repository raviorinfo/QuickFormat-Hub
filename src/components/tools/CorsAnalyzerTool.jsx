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
  Server
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import {
  DEFAULT_CORS_CONFIG,
  COMMON_METHODS,
  COMMON_HEADERS,
  auditCorsConfig,
  simulateCorsPreflight,
  generateCorsServerSnippet
} from '../../utils/corsUtils';

export function CorsAnalyzerTool() {
  const toast = useToast();
  const [config, setConfig] = useState(DEFAULT_CORS_CONFIG);
  const [originInput, setOriginInput] = useState(DEFAULT_CORS_CONFIG.origins.join('\n'));
  const [activeTab, setActiveTab] = useState('audit'); // 'audit' | 'simulator' | 'code'
  const [activeSnippetServer, setActiveSnippetServer] = useState('express');
  const [copied, setCopied] = useState(false);

  // Preflight Simulator state
  const [testOrigin, setTestOrigin] = useState('https://app.example.com');
  const [testMethod, setTestMethod] = useState('POST');
  const [testHeaders, setTestHeaders] = useState('Content-Type, Authorization');

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
            <span>CORS Policy Builder & Vulnerability Auditor</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Build bulletproof CORS rules, audit OWASP credential leaks, simulate preflight requests, and export server snippets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <button
            type="button"
            data-sample-trigger="true"
            onClick={loadSecureSample}
            className="btn-secondary py-1 px-2.5 text-xs flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
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

      {/* Main Grid: Policy Controls & Live Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: CORS Policy Builder Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/[0.06] pb-2">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-sky-500" />
                Policy Parameters
              </span>
              <span className="text-[10px] font-mono text-slate-400">RFC 6454 / W3C CORS</span>
            </div>

            {/* Allowed Origins */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Allowed Origins (one per line)</span>
                <button
                  type="button"
                  onClick={() => {
                    const next = !config.allowWildcardOrigin;
                    setConfig((p) => ({ ...p, allowWildcardOrigin: next }));
                    if (next) setOriginInput('*');
                  }}
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded transition-colors ${
                    config.allowWildcardOrigin
                      ? 'bg-rose-500/15 text-rose-500 font-bold'
                      : 'bg-slate-100 dark:bg-white/[0.06] text-slate-400'
                  }`}
                >
                  {config.allowWildcardOrigin ? 'Wildcard (*)' : 'Specific Domains'}
                </button>
              </label>
              <textarea
                value={originInput}
                onChange={(e) => handleOriginChange(e.target.value)}
                rows={3}
                placeholder="https://app.example.com&#10;https://admin.example.com"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-white/[0.08] text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Allow Credentials Toggle */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.04]">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Allow Credentials</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  Enables cookies, HTTP auth headers & TLS client certs
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfig((p) => ({ ...p, allowCredentials: !p.allowCredentials }))}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  config.allowCredentials ? 'bg-sky-500' : 'bg-slate-300 dark:bg-white/20'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    config.allowCredentials ? 'translate-x-5' : ''
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
                    {sec === 0 ? '0s (None)' : sec === 3600 ? '1 Hour' : sec === 86400 ? '24 Hours' : '7 Days'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tabbed View (Audit / Simulator / Server Code) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`flex-1 py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'audit'
                  ? 'bg-white dark:bg-white/[0.1] text-sky-500 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Vulnerability Audit</span>
              {auditIssues.length > 0 && (
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-rose-500 text-white">
                  {auditIssues.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('simulator')}
              className={`flex-1 py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'simulator'
                  ? 'bg-white dark:bg-white/[0.1] text-sky-500 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>Preflight Simulator</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('code')}
              className={`flex-1 py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'code'
                  ? 'bg-white dark:bg-white/[0.1] text-sky-500 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Server Snippets</span>
            </button>
          </div>

          {/* Tab 1: OWASP Security Audit */}
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
                      <div className="text-[11px] text-sky-600 dark:text-sky-400 font-medium pt-1 border-t border-slate-100 dark:border-white/[0.06]">
                        💡 Recommendation: {issue.recommendation}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Preflight Simulator */}
          {activeTab === 'simulator' && (
            <div className="glass-panel rounded-2xl p-4 sm:p-5 space-y-4 animate-slide-up">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    Test Request Origin
                  </label>
                  <input
                    type="text"
                    value={testOrigin}
                    onChange={(e) => setTestOrigin(e.target.value)}
                    placeholder="https://app.example.com"
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-white/[0.08] text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    Test Request Method
                  </label>
                  <select
                    value={testMethod}
                    onChange={(e) => setTestMethod(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-white/[0.08] text-xs font-mono text-slate-900 dark:text-white"
                  >
                    {COMMON_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Simulation Result Badge */}
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

          {/* Tab 3: Server Code Snippets */}
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
