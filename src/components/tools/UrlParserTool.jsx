import React, { useState, useEffect } from 'react';
import {
  Link2,
  Copy,
  Plus,
  Trash2,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Code2,
  Sparkles,
  ExternalLink,
  Globe,
  Server,
  FolderTree,
  Tag,
  Zap,
  ArrowRight
} from 'lucide-react';
import { parseUrlString, rebuildUrl, SAMPLE_URL } from '../../utils/urlUtils';
import { useToast } from '../../context/ToastContext';
import { WindowHeader } from '../common/WindowHeader';
import { CopyButton } from '../common/CopyButton';
import { StatCard } from '../common/StatCard';
import { PresetChips } from '../common/PresetChips';

const URL_PRESETS = [
  {
    id: 'utm',
    label: 'Google Analytics UTM Campaign',
    description: 'Marketing tracking link with utm_source, utm_campaign, and utm_content tokens',
    url: 'https://shop.acme.corp/products/enterprise-tier?utm_source=google&utm_medium=cpc&utm_campaign=q4_growth_launch&utm_content=header_cta_v2&discount=SAVE20#pricing-table',
  },
  {
    id: 'oauth',
    label: 'OAuth 2.0 Auth Redirect',
    description: 'Identity provider authentication endpoint with client_id, scopes, and state',
    url: 'https://auth.provider.com/oauth/v2/authorize?response_type=code&client_id=client_prod_8492&redirect_uri=https%3A%2F%2Fapp.corp.io%2Fauth%2Fcallback&scope=openid%20profile%20email%20offline_access&state=sec_token_9xL821',
  },
  {
    id: 'api',
    label: 'REST API Pagination & Filter',
    description: 'RESTful query string with sort, limit, page, and multi-value filters',
    url: 'https://api.gateway.internal/v1/customers?status=active&department=engineering&sort=-created_at&limit=50&page=2&include=billing_address,metadata',
  },
];

export function UrlParserTool() {
  const toast = useToast();
  const [rawUrl, setRawUrl] = useState(SAMPLE_URL);
  const [parsed, setParsed] = useState(null);
  const [activePreset, setActivePreset] = useState(null);

  // Parse whenever rawUrl changes
  useEffect(() => {
    const res = parseUrlString(rawUrl);
    if (res && res.success) {
      setParsed(res);
    }
  }, [rawUrl]);

  // Update a single query param
  const handleParamChange = (id, field, value) => {
    if (!parsed) return;
    const newParams = parsed.params.map((p) => (p.id === id ? { ...p, [field]: value } : p));
    const newParsed = { ...parsed, params: newParams };
    setParsed(newParsed);
    const newUrl = rebuildUrl(newParsed);
    setRawUrl(newUrl);
    setActivePreset(null);
  };

  // Add query param
  const handleAddParam = () => {
    if (!parsed) return;
    const newParam = { id: Math.random().toString(36).substr(2, 9), key: '', value: '' };
    const newParsed = { ...parsed, params: [...parsed.params, newParam] };
    setParsed(newParsed);
    toast.info('New parameter row added');
  };

  // Delete query param
  const handleDeleteParam = (id) => {
    if (!parsed) return;
    const newParams = parsed.params.filter((p) => p.id !== id);
    const newParsed = { ...parsed, params: newParams };
    setParsed(newParsed);
    const newUrl = rebuildUrl(newParsed);
    setRawUrl(newUrl);
    setActivePreset(null);
  };

  // Export params to JSON helper
  const getParamsJson = () => {
    if (!parsed) return '{}';
    const obj = {};
    parsed.params.forEach(({ key, value }) => {
      if (key) obj[key] = value;
    });
    return JSON.stringify(obj, null, 2);
  };

  const handleSelectPreset = (preset) => {
    setRawUrl(preset.url);
    setActivePreset(preset.id);
    toast.success(`Loaded ${preset.label}`);
  };

  return (
    <div className="space-y-6">
      {/* Header & Hero Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-500 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>URL Deconstructor & Query Builder • RFC 3986 Standard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            URL & Query Parameter Parser
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Deconstruct complex URLs into component protocol, hostname, path, and interactive query parameters. Edit values on the fly with live reassembly.
          </p>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <CopyButton
            text={getParamsJson}
            label="Export JSON"
            copiedLabel="JSON Copied!"
            variant="default"
          />

          <CopyButton
            text={rawUrl}
            label="Copy Clean URL"
            copiedLabel="URL Copied!"
            variant="primary"
          />
        </div>
      </div>

      {/* Preset Chips Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap p-3 rounded-2xl glass-panel">
        <PresetChips
          presets={URL_PRESETS}
          onSelect={handleSelectPreset}
          activeId={activePreset}
          label="1-Click Presets"
        />

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Globe className="w-3.5 h-3.5 text-sky-500" />
          <span>Real-time bidirectional sync</span>
        </div>
      </div>

      {/* Main Input Field */}
      <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl overflow-hidden editor-pane focus-within:ring-2 focus-within:ring-sky-500/30 transition-all">
        <WindowHeader
          title="Raw Endpoint URL Input"
          badge="HTTP/S"
          charsCount={rawUrl.length}
        >
          <button
            onClick={() => {
              setRawUrl(SAMPLE_URL);
              setActivePreset(null);
              toast.success('Sample URL loaded');
            }}
            className="px-2 py-1 text-xs text-brand-500 hover:text-brand-400 font-semibold rounded hover:bg-brand-500/10 transition-colors"
          >
            Sample
          </button>
          <button
            onClick={() => {
              setRawUrl('');
              setActivePreset(null);
              toast.info('URL cleared');
            }}
            className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
            title="Clear URL"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </WindowHeader>
        <div className="p-3.5">
          <textarea
            value={rawUrl}
            onChange={(e) => {
              setRawUrl(e.target.value);
              setActivePreset(null);
            }}
            placeholder="Paste URL (e.g. https://example.com/api?user=123)..."
            rows={3}
            className="w-full p-3 font-mono text-xs sm:text-sm bg-slate-50/70 dark:bg-[#060911]/80 border border-slate-200/80 dark:border-slate-800/80 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none resize-none leading-relaxed"
          />
        </div>
      </div>

      {/* URL Components Breakdown Cards */}
      {parsed && parsed.success && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in">
          <StatCard
            icon={Globe}
            label="Protocol"
            value={parsed.protocol}
            subtext={parsed.protocol === 'https:' ? 'Encrypted TLS' : 'Unencrypted'}
            color="sky"
          />
          <StatCard
            icon={Server}
            label="Hostname"
            value={parsed.hostname}
            subtext="Target domain / IP"
            color="purple"
          />
          <StatCard
            icon={FolderTree}
            label="Pathname"
            value={parsed.pathname || '/'}
            subtext="Resource routing route"
            color="amber"
          />
          <StatCard
            icon={Sliders}
            label="Query Tokens"
            value={`${parsed.params.length} Params`}
            subtext={parsed.hash ? `Hash: ${parsed.hash}` : 'No anchor tag'}
            color="emerald"
          />
        </div>
      )}

      {/* Interactive Query Parameters Table */}
      {parsed && parsed.success && (
        <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl overflow-hidden editor-pane animate-fade-in">
          <WindowHeader
            title="Interactive Query Parameter Inspector"
            badge={`${parsed.params.length} Parameters`}
          >
            <button
              onClick={handleAddParam}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-sm transition-all hover:-translate-y-0.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Parameter</span>
            </button>
          </WindowHeader>

          <div className="p-4 space-y-3">
            {parsed.params.length === 0 ? (
              <div className="text-center py-8 text-slate-400 space-y-2">
                <Tag className="w-8 h-8 mx-auto opacity-40" />
                <p className="text-xs font-semibold">No query parameters in this URL.</p>
                <p className="text-[11px] text-slate-500">Click "Add Parameter" above to append new key-value tokens.</p>
              </div>
            ) : (
              parsed.params.map((param, index) => {
                const isUtm = param.key.toLowerCase().startsWith('utm_');
                return (
                  <div
                    key={param.id}
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/70 dark:bg-[#060911]/60 border border-slate-200/60 dark:border-slate-800/80 transition-all hover:border-brand-500/30"
                  >
                    <span className="text-[11px] font-mono text-slate-400 w-6 text-center shrink-0">
                      #{index + 1}
                    </span>

                    {/* Parameter Key */}
                    <div className="relative w-1/3">
                      <input
                        type="text"
                        value={param.key}
                        placeholder="Parameter Key"
                        onChange={(e) => handleParamChange(param.id, 'key', e.target.value)}
                        className={`w-full px-3 py-1.5 rounded-lg text-xs font-mono font-bold border focus:outline-none focus:border-brand-500 ${
                          isUtm
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                            : 'bg-white dark:bg-slate-850 text-sky-600 dark:text-sky-400 border-slate-200 dark:border-slate-700'
                        }`}
                      />
                      {isUtm && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold uppercase text-amber-500">
                          UTM
                        </span>
                      )}
                    </div>

                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 opacity-50" />

                    {/* Parameter Value */}
                    <input
                      type="text"
                      value={param.value}
                      placeholder="Parameter Value"
                      onChange={(e) => handleParamChange(param.id, 'value', e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg text-xs font-mono bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500"
                    />

                    {/* 1-Click Copy Value Button */}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(param.value);
                        toast.success(`Copied "${param.key}"`);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                      title="Copy Value"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDeleteParam(param.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="Remove parameter"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
