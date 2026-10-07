import React, { useState, useMemo, useEffect } from 'react';
import {
  FileCode,
  Copy,
  Download,
  Trash2,
  RefreshCw,
  Sparkles,
  Layers,
  Wand2,
  Code2,
  CheckCircle2,
  Cpu,
  Braces,
  Binary,
  Database
} from 'lucide-react';
import {
  generateTypeScript,
  generateZod,
  generatePydantic,
  generateSql,
  SAMPLE_SCHEMA_JSON,
} from '../../utils/jsonTypeGenerator';
import { useToast } from '../../context/ToastContext';
import { ToolHeroHeader } from '../common/ToolHeroHeader';
import { WindowHeader } from '../common/WindowHeader';
import { CopyButton } from '../common/CopyButton';
import { StatCard } from '../common/StatCard';
import { PresetChips } from '../common/PresetChips';
import { fireConfetti } from '../../utils/confetti';

const SCHEMA_PRESETS = [
  {
    id: 'ecommerce',
    label: 'E-Commerce Order',
    description: 'Nested items, billing & taxes',
    rootName: 'OrderPayload',
    json: SAMPLE_SCHEMA_JSON
  },
  {
    id: 'user_session',
    label: 'Auth Session',
    description: 'JWT profile, roles & permissions',
    rootName: 'AuthSession',
    json: JSON.stringify({
      id: "usr_9981",
      email: "alex@enterprise.corp",
      profile: {
        firstName: "Alex",
        lastName: "Vance",
        avatarUrl: "https://cdn.example.com/avatars/9981.png"
      },
      roles: ["administrator", "platform_lead"],
      permissions: {
        canDeploy: true,
        canDeleteDatabases: false,
        maxRateLimit: 50000
      },
      lastLoginAt: 1712498210
    }, null, 2)
  },
  {
    id: 'stripe_event',
    label: 'Payment Webhook',
    description: 'Charge succeeded & metadata',
    rootName: 'PaymentIntentEvent',
    json: JSON.stringify({
      id: "evt_3MtwLwLkdIwHu7ix28a3tqPa",
      object: "event",
      api_version: "2024-04-10",
      created: 1712498210,
      data: {
        object: {
          id: "pi_3MtwLwLkdIwHu7ix28a3tqPa",
          amount: 1099,
          currency: "usd",
          status: "succeeded",
          payment_method_types: ["card"],
          customer: "cus_123456",
          receipt_email: "billing@acme.com"
        }
      },
      livemode: false
    }, null, 2)
  },
  {
    id: 'metrics',
    label: 'Server Telemetry',
    description: 'Kubernetes pods & cpu loads',
    rootName: 'NodeTelemetry',
    json: JSON.stringify({
      nodeId: "k8s-worker-us-east-4",
      cluster: "production-core",
      status: "ready",
      resources: {
        cpuCores: 32,
        memoryGigabytes: 128,
        allocatedCpuPercent: 74.2
      },
      activePods: [
        { name: "gateway-api-7b89d", restarts: 0, healthy: true },
        { name: "worker-queue-2x4f1", restarts: 2, healthy: true }
      ]
    }, null, 2)
  }
];

export function JsonToTypesTool() {
  const toast = useToast();
  const [jsonInput, setJsonInput] = useState(SAMPLE_SCHEMA_JSON);
  const [targetLang, setTargetLang] = useState('ts'); // 'ts' | 'zod' | 'pydantic' | 'sql'
  const [rootName, setRootName] = useState('OrderPayload');
  const [fontSize, setFontSize] = useState('normal');
  const [isZenMode, setIsZenMode] = useState(false);
  const [activePreset, setActivePreset] = useState('ecommerce');

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

  // Parse JSON
  const parsedJson = useMemo(() => {
    try {
      return JSON.parse(jsonInput);
    } catch {
      return null;
    }
  }, [jsonInput]);

  // Code generation
  const generatedCode = useMemo(() => {
    if (!parsedJson) return '// Invalid JSON: please provide valid JSON input to generate types.';

    try {
      const sanitizedName = (rootName || 'RootSchema').replace(/[^a-zA-Z0-9_]/g, '');

      switch (targetLang) {
        case 'ts':
          return generateTypeScript(parsedJson, sanitizedName);
        case 'zod':
          return generateZod(parsedJson, sanitizedName);
        case 'pydantic':
          return generatePydantic(parsedJson, sanitizedName);
        case 'sql':
          return generateSql(parsedJson, sanitizedName);
        default:
          return generateTypeScript(parsedJson, sanitizedName);
      }
    } catch (err) {
      return `// Code generation error: ${err.message}`;
    }
  }, [parsedJson, targetLang, rootName]);

  const handleDownloadCode = () => {
    if (!generatedCode) return;
    const extensions = { ts: 'ts', zod: 'ts', pydantic: 'py', sql: 'sql' };
    const ext = extensions[targetLang] || 'ts';
    const blob = new Blob([generatedCode], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${rootName.toLowerCase() || 'schema'}.${ext}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    fireConfetti();
    toast.success(`Exported .${ext} schema file!`);
  };

  const handleSelectPreset = (preset) => {
    setJsonInput(preset.json);
    setRootName(preset.rootName);
    setActivePreset(preset.id);
    toast.success(`Loaded "${preset.label}" schema preset`);
  };

  const detectedFieldsCount = useMemo(() => {
    if (!parsedJson || typeof parsedJson !== 'object') return 0;
    if (Array.isArray(parsedJson)) {
      return parsedJson.length > 0 && typeof parsedJson[0] === 'object'
        ? Object.keys(parsedJson[0]).length
        : 1;
    }
    return Object.keys(parsedJson).length;
  }, [parsedJson]);

  const outputLinesCount = useMemo(() => {
    if (!generatedCode) return 0;
    return generatedCode.split('\n').length;
  }, [generatedCode]);

  return (
    <div className="space-y-6">
      {/* Studio Tool Hero Header */}
      <ToolHeroHeader
        icon={Layers}
        category="Dev & Schema Engineering"
        badge="TypeScript • Zod • Python • SQL"
        title="JSON to TypeScript, Zod, Pydantic & SQL"
        description="Transform raw JSON payloads into production-grade TypeScript interfaces, Zod schema runtime validators, Python Pydantic v2 models, and PostgreSQL DDL tables."
        actions={
          <>
            <CopyButton
              text={generatedCode}
              label="Copy Code"
              copiedLabel="Code Copied!"
              targetElementId="json-types-output"
              variant="default"
            />

            <button
              onClick={handleDownloadCode}
              className="btn-primary"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Schema</span>
            </button>
          </>
        }
      />

      {/* Preset Chips */}
      <div className="flex items-center justify-between gap-4 flex-wrap p-3 rounded-2xl glass-panel">
        <PresetChips
          presets={SCHEMA_PRESETS}
          activeId={activePreset}
          onSelect={handleSelectPreset}
          label="Schema Templates"
        />

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          <span>Strict recursive type inference</span>
        </div>
      </div>

      {/* Executive KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Braces}
          label="Root Interface"
          value={rootName || 'Unnamed'}
          subtext="PascalCase model symbol"
          color="sky"
        />
        <StatCard
          icon={Code2}
          label="Target Format"
          value={targetLang === 'ts' ? 'TypeScript' : targetLang === 'zod' ? 'Zod Runtime' : targetLang === 'pydantic' ? 'Pydantic v2' : 'PostgreSQL DDL'}
          subtext={targetLang.toUpperCase()}
          color="emerald"
        />
        <StatCard
          icon={Layers}
          label="Top-Level Fields"
          value={`${detectedFieldsCount} Fields`}
          subtext={parsedJson ? 'Valid JSON payload' : 'Syntax error'}
          color={parsedJson ? 'purple' : 'rose'}
        />
        <StatCard
          icon={FileCode}
          label="Generated Code"
          value={`${outputLinesCount} Lines`}
          subtext="Compiled AST format"
          color="amber"
        />
      </div>

      {/* Main Dual Workspace */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 items-start ${isZenMode ? 'fixed inset-4 z-50 bg-[#060911]/95 p-6 rounded-2xl shadow-2xl backdrop-blur-xl' : ''}`}>
        {/* LEFT: JSON input */}
        <div className="flex flex-col glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xl overflow-hidden editor-pane focus-within:ring-2 focus-within:ring-sky-500/30 transition-all">
          <WindowHeader
            title="Input JSON Payload"
            badge="JSON"
            linesCount={jsonInput ? jsonInput.split('\n').length : 0}
            charsCount={jsonInput.length}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            isZenMode={isZenMode}
            onToggleZen={() => setIsZenMode(!isZenMode)}
          >
            <button
              onClick={() => {
                setJsonInput(SAMPLE_SCHEMA_JSON);
                setRootName('OrderPayload');
                setActivePreset('ecommerce');
                toast.success('Sample JSON loaded');
              }}
              className="text-xs text-sky-500 hover:text-sky-400 font-medium px-2 py-1 rounded-lg hover:bg-sky-500/10 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={() => {
                setJsonInput('');
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
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value);
                setActivePreset(null);
              }}
              placeholder="Paste JSON object here..."
              rows={18}
              className={`w-full p-4 font-mono code-viewport bg-slate-50 dark:bg-[#050811] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-none leading-relaxed min-h-[420px] border border-transparent ${fontSizeClass}`}
              spellCheck={false}
            />
          </div>
        </div>

        {/* RIGHT: Generated Schema Tabs */}
        <div className="flex flex-col glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xl overflow-hidden editor-pane min-h-[480px]">
          <WindowHeader
            title="Generated Schema & Models"
            badge={targetLang.toUpperCase()}
            linesCount={generatedCode ? generatedCode.split('\n').length : 0}
            charsCount={generatedCode.length}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
          >
            {/* Language Tabs */}
            <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-white/[0.06] p-0.5 rounded-lg text-xs mr-2 border border-slate-200/60 dark:border-white/[0.08]">
              <button
                onClick={() => setTargetLang('ts')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  targetLang === 'ts'
                    ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                TS
              </button>
              <button
                onClick={() => setTargetLang('zod')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  targetLang === 'zod'
                    ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Zod
              </button>
              <button
                onClick={() => setTargetLang('pydantic')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  targetLang === 'pydantic'
                    ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Pydantic
              </button>
              <button
                onClick={() => setTargetLang('sql')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  targetLang === 'sql'
                    ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                SQL
              </button>
            </div>

            {/* Model Name Input */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400 text-[10px] uppercase font-bold font-mono">Name:</span>
              <input
                type="text"
                value={rootName}
                onChange={(e) => setRootName(e.target.value)}
                className="w-24 px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/[0.1] font-mono text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>
          </WindowHeader>

          {/* Generated Code Area */}
          <div className="p-2 flex-1 flex flex-col">
            <textarea
              id="json-types-output"
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
