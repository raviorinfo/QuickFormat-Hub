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
  Cpu
} from 'lucide-react';
import {
  generateTypeScript,
  generateZod,
  generatePydantic,
  generateSql,
  SAMPLE_SCHEMA_JSON,
} from '../../utils/jsonTypeGenerator';
import { useToast } from '../../context/ToastContext';
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
    label: 'Stripe Webhook',
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

  // Generate Code
  const generatedCode = useMemo(() => {
    if (!parsedJson) {
      return '// Enter valid JSON on the left to generate strongly typed models.';
    }

    try {
      switch (targetLang) {
        case 'ts':
          return generateTypeScript(parsedJson, rootName);
        case 'zod':
          return generateZod(parsedJson, rootName);
        case 'pydantic':
          return generatePydantic(parsedJson, rootName);
        case 'sql':
          return generateSql(parsedJson, rootName.toLowerCase());
        default:
          return generateTypeScript(parsedJson, rootName);
      }
    } catch (e) {
      return `// Error generating schema: ${e.message}`;
    }
  }, [parsedJson, targetLang, rootName]);

  const handleDownloadCode = () => {
    const extMap = { ts: 'ts', zod: 'ts', pydantic: 'py', sql: 'sql' };
    const ext = extMap[targetLang] || 'ts';
    const blob = new Blob([generatedCode], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${rootName}_schema.${ext}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    fireConfetti();
    toast.success(`Downloaded .${ext} file!`);
  };

  const handleSelectPreset = (preset) => {
    setJsonInput(preset.json);
    setRootName(preset.rootName);
    setActivePreset(preset.id);
    toast.success(`Loaded "${preset.label}" schema preset`);
  };

  const detectedFieldsCount = useMemo(() => {
    if (!parsedJson || typeof parsedJson !== 'object') return 0;
    return Object.keys(parsedJson).length;
  }, [parsedJson]);

  const outputLinesCount = useMemo(() => {
    if (!generatedCode) return 0;
    return generatedCode.split('\n').length;
  }, [generatedCode]);

  return (
    <div className="space-y-6">
      {/* Header & Single H1 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-500 mb-1">
            <Layers className="w-4 h-4" />
            <span>Multi-Language Type Generator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            JSON to TypeScript, Zod, Pydantic & SQL
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Turn JSON payloads into TypeScript interfaces, Zod runtime validators, Python Pydantic v2 models, and SQL tables.
          </p>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <CopyButton
            text={generatedCode}
            label="Copy Code"
            copiedLabel="Code Copied!"
            targetElementId="json-types-output"
            variant="default"
          />

          <button
            onClick={handleDownloadCode}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/25 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Schema</span>
          </button>
        </div>
      </div>

      {/* Preset Chips */}
      <PresetChips
        presets={SCHEMA_PRESETS}
        activeId={activePreset}
        onSelect={handleSelectPreset}
        title="Schema Templates"
      />

      {/* Executive KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Root Interface"
          value={rootName || 'Unnamed'}
          badge="PascalCase"
          color="brand"
        />
        <StatCard
          label="Target Format"
          value={targetLang === 'ts' ? 'TypeScript Interface' : targetLang === 'zod' ? 'Zod Validator' : targetLang === 'pydantic' ? 'Pydantic BaseModel' : 'PostgreSQL DDL'}
          badge={targetLang.toUpperCase()}
          color="emerald"
        />
        <StatCard
          label="Top-Level Fields"
          value={`${detectedFieldsCount} Attributes`}
          badge={parsedJson ? 'Valid JSON' : 'Syntax Error'}
          color={parsedJson ? 'purple' : 'rose'}
        />
        <StatCard
          label="Generated Code"
          value={`${outputLinesCount} Lines`}
          badge="AST Rendered"
          color="slate"
        />
      </div>

      {/* Main Dual Workspace */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 items-start ${isZenMode ? 'fixed inset-4 z-50 bg-slate-900/95 p-6 rounded-2xl shadow-2xl backdrop-blur-xl' : ''}`}>
        {/* LEFT: JSON input */}
        <div className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden editor-pane">
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
              className="text-xs text-brand-500 hover:text-brand-400 font-medium px-2 py-1 rounded-lg hover:bg-brand-500/10 transition-colors"
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
          <textarea
            value={jsonInput}
            onChange={(e) => {
              setJsonInput(e.target.value);
              setActivePreset(null);
            }}
            placeholder="Paste JSON object here..."
            rows={18}
            className={`w-full p-4 font-mono bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-none leading-relaxed min-h-[420px] ${fontSizeClass}`}
            spellCheck={false}
          />
        </div>

        {/* RIGHT: Generated Schema Tabs */}
        <div className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden editor-pane min-h-[480px]">
          <WindowHeader
            title="Generated Schema & Models"
            badge={targetLang.toUpperCase()}
            linesCount={generatedCode ? generatedCode.split('\n').length : 0}
            charsCount={generatedCode.length}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
          >
            {/* Language Tabs */}
            <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800 p-0.5 rounded-lg text-xs mr-2">
              <button
                onClick={() => setTargetLang('ts')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  targetLang === 'ts'
                    ? 'bg-white dark:bg-slate-700 text-brand-500 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                TS
              </button>
              <button
                onClick={() => setTargetLang('zod')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  targetLang === 'zod'
                    ? 'bg-white dark:bg-slate-700 text-brand-500 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Zod
              </button>
              <button
                onClick={() => setTargetLang('pydantic')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  targetLang === 'pydantic'
                    ? 'bg-white dark:bg-slate-700 text-brand-500 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Pydantic
              </button>
              <button
                onClick={() => setTargetLang('sql')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  targetLang === 'sql'
                    ? 'bg-white dark:bg-slate-700 text-brand-500 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                SQL
              </button>
            </div>

            {/* Model Name Input */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Name:</span>
              <input
                type="text"
                value={rootName}
                onChange={(e) => setRootName(e.target.value)}
                className="w-24 px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </WindowHeader>

          {/* Generated Code Area */}
          <div className="p-4 flex-1 flex flex-col">
            <textarea
              id="json-types-output"
              readOnly
              value={generatedCode}
              rows={18}
              className={`w-full flex-1 p-4 font-mono bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none resize-none leading-relaxed min-h-[400px] ${fontSizeClass}`}
              spellCheck={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

