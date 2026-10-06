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
  ExternalLink
} from 'lucide-react';
import { parseUrlString, rebuildUrl, SAMPLE_URL } from '../../utils/urlUtils';
import { useToast } from '../../context/ToastContext';
import { WindowHeader } from '../common/WindowHeader';
import { CopyButton } from '../common/CopyButton';

export function UrlParserTool() {
  const toast = useToast();
  const [rawUrl, setRawUrl] = useState(SAMPLE_URL);
  const [parsed, setParsed] = useState(null);

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
  };

  // Add query param
  const handleAddParam = () => {
    if (!parsed) return;
    const newParam = { id: Math.random().toString(36).substr(2, 9), key: '', value: '' };
    const newParsed = { ...parsed, params: [...parsed.params, newParam] };
    setParsed(newParsed);
  };

  // Delete query param
  const handleDeleteParam = (id) => {
    if (!parsed) return;
    const newParams = parsed.params.filter((p) => p.id !== id);
    const newParsed = { ...parsed, params: newParams };
    setParsed(newParsed);
    const newUrl = rebuildUrl(newParsed);
    setRawUrl(newUrl);
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

  return (
    <div className="space-y-6">
      {/* Header & Single H1 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-500 mb-1">
            <Link2 className="w-4 h-4" />
            <span>URL Deconstructor & Query Builder</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            URL & Query Parameter Parser
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Break down URLs, inspect UTM tracking tokens, edit parameters interactively, and rebuild clean endpoints.
          </p>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <CopyButton
            text={getParamsJson}
            label="Export Params JSON"
            copiedLabel="Params Copied!"
            variant="default"
          />

          <CopyButton
            text={rawUrl}
            label="Copy Rebuilt URL"
            copiedLabel="URL Copied!"
            variant="primary"
          />
        </div>
      </div>

      {/* Main Input Field */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden editor-pane">
        <WindowHeader
          title="Raw URL Input"
          badge="HTTP/S"
          charsCount={rawUrl.length}
        >
          <button
            onClick={() => {
              setRawUrl(SAMPLE_URL);
              toast.success('Sample URL loaded');
            }}
            className="text-xs text-brand-500 hover:text-brand-400 font-medium px-2 py-0.5 rounded hover:bg-brand-500/10 transition-colors"
          >
            Sample URL
          </button>
          <button
            onClick={() => setRawUrl('')}
            className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
            title="Clear"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </WindowHeader>
        <div className="p-4">
          <textarea
            value={rawUrl}
            onChange={(e) => setRawUrl(e.target.value)}
            placeholder="Paste URL (e.g. https://example.com/api?user=123)..."
            rows={3}
            className="w-full p-3 font-mono text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none resize-none leading-relaxed"
          />
        </div>
      </div>

      {/* URL Components Breakdown Cards */}
      {parsed && parsed.success && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase">Protocol</span>
            <span className="font-mono text-sm font-bold text-brand-500">{parsed.protocol}</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase">Hostname</span>
            <span className="font-mono text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate block">
              {parsed.hostname}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase">Path</span>
            <span className="font-mono text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate block">
              {parsed.pathname || '/'}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase">Hash / Anchor</span>
            <span className="font-mono text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate block">
              {parsed.hash || '(none)'}
            </span>
          </div>
        </div>
      )}

      {/* Interactive Query Parameters Table */}
      {parsed && parsed.success && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden editor-pane">
          <WindowHeader
            title="Query Parameters"
            badge={`${parsed.params.length} Params`}
          >
            <button
              onClick={handleAddParam}
              className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Parameter</span>
            </button>
          </WindowHeader>

          <div className="p-4 space-y-2.5">
            {parsed.params.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No query parameters found in this URL.</p>
            ) : (
              parsed.params.map((param, index) => (
                <div key={param.id} className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-slate-400 w-6 text-center">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={param.key}
                    placeholder="Key"
                    onChange={(e) => handleParamChange(param.id, 'key', e.target.value)}
                    className="w-1/3 px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500"
                  />
                  <input
                    type="text"
                    value={param.value}
                    placeholder="Value"
                    onChange={(e) => handleParamChange(param.id, 'value', e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500"
                  />
                  <button
                    onClick={() => handleDeleteParam(param.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    title="Remove parameter"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
