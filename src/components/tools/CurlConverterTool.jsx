import React, { useState, useMemo, useEffect } from 'react';
import {
  Terminal,
  Copy,
  Download,
  Trash2,
  RefreshCw,
  Code2,
  FileCode,
  Sparkles,
  Layers,
  ArrowRight,
  Globe,
  Send,
  Binary
} from 'lucide-react';
import {
  parseCurl,
  generateFetchCode,
  generateAxiosCode,
  generatePythonRequests,
  generateGoCode,
  SAMPLE_CURL,
} from '../../utils/curlParser';
import { useToast } from '../../context/ToastContext';
import { ToolHeroHeader } from '../common/ToolHeroHeader';
import { WindowHeader } from '../common/WindowHeader';
import { CopyButton } from '../common/CopyButton';
import { StatCard } from '../common/StatCard';
import { PresetChips } from '../common/PresetChips';
import { fireConfetti } from '../../utils/confetti';

const CURL_PRESETS = [
  {
    id: 'github',
    label: 'GitHub API (GET)',
    description: 'User details with Bearer token',
    curl: `curl -X GET "https://api.github.com/user" \\
  -H "Accept: application/vnd.github+json" \\
  -H "Authorization: Bearer token_sample_demo_9981" \\
  -H "User-Agent: QuickFormat-Client/2.0"`
  },
  {
    id: 'stripe',
    label: 'Stripe Payment (POST)',
    description: 'Form URL-encoded charge intent',
    curl: `curl https://api.stripe.com/v1/payment_intents \\
  -u api_secret_sample_test_key: \\
  -d amount=2000 \\
  -d currency=usd \\
  -d "payment_method_types[]=card"`
  },
  {
    id: 'json_api',
    label: 'JSON Payload (POST)',
    description: 'Application/json authentication',
    curl: `curl -X POST "https://api.example.com/v1/auth/login" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "alex@company.com", "password": "superSecretPassword123"}'`
  }
];

export function CurlConverterTool() {
  const toast = useToast();
  const [curlInput, setCurlInput] = useState(SAMPLE_CURL);
  const [langTab, setLangTab] = useState('fetch'); // 'fetch' | 'axios' | 'python' | 'go'
  const [fontSize, setFontSize] = useState('normal');
  const [isZenMode, setIsZenMode] = useState(false);
  const [activePreset, setActivePreset] = useState(null);

  // Esc key listener to exit Zen Mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isZenMode) {
        setIsZenMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZenMode]);

  const fontSizeClass =
    fontSize === 'small'
      ? 'text-[11px] leading-relaxed'
      : fontSize === 'large'
      ? 'text-sm leading-relaxed'
      : 'text-xs sm:text-sm leading-relaxed';

  const parsed = useMemo(() => parseCurl(curlInput), [curlInput]);

  const generatedCode = useMemo(() => {
    if (!parsed || !parsed.url) {
      return '// Enter a valid cURL command (e.g. curl -X GET "https://api.example.com").';
    }

    switch (langTab) {
      case 'fetch':
        return generateFetchCode(parsed);
      case 'axios':
        return generateAxiosCode(parsed);
      case 'python':
        return generatePythonRequests(parsed);
      case 'go':
        return generateGoCode(parsed);
      default:
        return generateFetchCode(parsed);
    }
  }, [parsed, langTab]);

  const handleDownloadCode = () => {
    const extMap = { fetch: 'js', axios: 'js', python: 'py', go: 'go' };
    const ext = extMap[langTab] || 'js';
    const blob = new Blob([generatedCode], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `quickformat_request_${langTab}.${ext}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    fireConfetti();
    toast.success(`Exported .${ext} script!`);
  };

  const handleSelectPreset = (preset) => {
    setCurlInput(preset.curl);
    setActivePreset(preset.id);
    toast.success(`Loaded "${preset.label}" cURL preset`);
  };

  const hostName = useMemo(() => {
    if (!parsed || !parsed.url) return 'None';
    try {
      const u = new URL(parsed.url);
      return u.hostname;
    } catch {
      return parsed.url.split('/')[2] || parsed.url;
    }
  }, [parsed]);

  const headersCount = useMemo(() => {
    if (!parsed || !parsed.headers) return 0;
    return Object.keys(parsed.headers).length;
  }, [parsed]);

  return (
    <div className="space-y-6">
      {/* Studio Tool Hero Header */}
      <ToolHeroHeader
        icon={Terminal}
        category="Dev & Networking"
        badge="POSIX cURL Transpiler"
        title="cURL to Multi-Language Code Converter"
        description="Convert browser network inspection requests and command-line cURL commands into modern JavaScript Fetch, Axios, Python Requests, and Go code."
        actions={
          <>
            <CopyButton
              text={generatedCode}
              label="Copy Code"
              copiedLabel="Code Copied!"
              targetElementId="curl-generated-code"
              variant="default"
            />

            <button
              onClick={handleDownloadCode}
              className="btn-primary"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Script</span>
            </button>
          </>
        }
      />

      {/* Preset Chips */}
      <div className="flex items-center justify-between gap-4 flex-wrap p-3 rounded-2xl glass-panel">
        <PresetChips
          presets={CURL_PRESETS}
          activeId={activePreset}
          onSelect={handleSelectPreset}
          label="Sample Requests"
        />

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          <span>Supports headers, auth & JSON payloads</span>
        </div>
      </div>

      {/* Executive KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Send}
          label="HTTP Method"
          value={parsed && parsed.method ? parsed.method : 'GET'}
          subtext="HTTP Verb"
          color="sky"
        />
        <StatCard
          icon={Globe}
          label="Target Host"
          value={hostName}
          subtext="Destination server"
          color="emerald"
        />
        <StatCard
          icon={Layers}
          label="Request Headers"
          value={`${headersCount} Headers`}
          subtext="Parsed header tokens"
          color="purple"
        />
        <StatCard
          icon={FileCode}
          label="Target Runtime"
          value={langTab === 'fetch' ? 'Browser / Fetch' : langTab === 'axios' ? 'Axios Client' : langTab === 'python' ? 'Python Requests' : 'Go net/http'}
          subtext={langTab.toUpperCase()}
          color="amber"
        />
      </div>

      {/* Main Dual Workspace */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 items-start ${isZenMode ? 'fixed inset-4 z-50 bg-[#060911]/95 p-6 rounded-2xl shadow-2xl backdrop-blur-xl' : ''}`}>
        {/* LEFT: Raw cURL input */}
        <div className="flex flex-col glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xl overflow-hidden editor-pane focus-within:ring-2 focus-within:ring-sky-500/30 transition-all">
          <WindowHeader
            title="cURL Command Input"
            badge="Shell"
            linesCount={curlInput ? curlInput.split('\n').length : 0}
            charsCount={curlInput.length}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            isZenMode={isZenMode}
            onToggleZen={() => setIsZenMode(!isZenMode)}
          >
            <button
              onClick={() => {
                setCurlInput(SAMPLE_CURL);
                setActivePreset(null);
                toast.success('Sample cURL loaded');
              }}
              className="text-xs text-sky-500 hover:text-sky-400 font-medium px-2 py-1 rounded-lg hover:bg-sky-500/10 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={() => {
                setCurlInput('');
                setActivePreset(null);
              }}
              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
              title="Clear input"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </WindowHeader>
          <div className="p-2">
            <textarea
              value={curlInput}
              onChange={(e) => {
                setCurlInput(e.target.value);
                setActivePreset(null);
              }}
              placeholder="Paste cURL command here (e.g. curl -X POST 'https://api.example.com'...)..."
              rows={18}
              className={`w-full p-4 font-mono code-viewport bg-slate-50 dark:bg-[#050811] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-none leading-relaxed min-h-[420px] border border-transparent ${fontSizeClass}`}
              spellCheck={false}
            />
          </div>
        </div>

        {/* RIGHT: Generated Code Tabs */}
        <div className="flex flex-col glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xl overflow-hidden editor-pane min-h-[480px]">
          <WindowHeader
            title="Generated Client Code"
            badge={langTab.toUpperCase()}
            linesCount={generatedCode ? generatedCode.split('\n').length : 0}
            charsCount={generatedCode.length}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
          >
            {/* Language Tabs */}
            <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-white/[0.06] p-0.5 rounded-lg text-xs mr-1 border border-slate-200/60 dark:border-white/[0.08]">
              <button
                onClick={() => setLangTab('fetch')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  langTab === 'fetch'
                    ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Fetch
              </button>
              <button
                onClick={() => setLangTab('axios')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  langTab === 'axios'
                    ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Axios
              </button>
              <button
                onClick={() => setLangTab('python')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  langTab === 'python'
                    ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Python
              </button>
              <button
                onClick={() => setLangTab('go')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  langTab === 'go'
                    ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Go
              </button>
            </div>
          </WindowHeader>

          {/* Generated Code Area */}
          <div className="p-2 flex-1 flex flex-col">
            <textarea
              id="curl-generated-code"
              readOnly
              value={generatedCode}
              rows={18}
              className={`w-full flex-1 p-4 font-mono code-viewport bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-white/[0.08] rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none resize-none leading-relaxed min-h-[400px] ${fontSizeClass}`}
              spellCheck={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
