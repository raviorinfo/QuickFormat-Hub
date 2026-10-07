import React, { useState, useMemo, useEffect } from 'react';
import {
  Code2,
  ListTree,
  Search,
  Copy,
  Download,
  Trash2,
  Wand2,
  Minimize2,
  ArrowDownAZ,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Layers,
  Database,
  Hash,
  AlertTriangle,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import {
  parseJsonWithPosition,
  sortJsonKeys,
  calculateJsonStats,
  evaluateJsonPath,
  SAMPLE_JSON_VIEWER,
} from '../../utils/jsonViewerUtils';
import { useToast } from '../../context/ToastContext';
import { ToolHeroHeader } from '../common/ToolHeroHeader';
import { WindowHeader } from '../common/WindowHeader';
import { CopyButton } from '../common/CopyButton';
import { StatCard } from '../common/StatCard';
import { PresetChips } from '../common/PresetChips';
import { fireConfetti } from '../../utils/confetti';

const PRESETS = [
  {
    id: 'store',
    label: 'Cyberstore Catalog',
    description: 'Nested store with items array and technical specs',
    data: SAMPLE_JSON_VIEWER,
  },
  {
    id: 'github',
    label: 'GitHub User & Repos',
    description: 'Real-world GitHub REST API structure',
    data: JSON.stringify({
      login: "octocat",
      id: 583231,
      node_id: "MDQ6VXNlcjU4MzIzMQ==",
      avatar_url: "https://avatars.githubusercontent.com/u/583231?v=4",
      type: "User",
      site_admin: false,
      public_repos: 8,
      public_gists: 4,
      followers: 9812,
      following: 9,
      created_at: "2011-01-25T18:44:36Z",
      plan: { name: "developer", space: 976562499, collaborators: 0 }
    }, null, 2),
  },
  {
    id: 'config',
    label: 'Docker Compose / K8s Config',
    description: 'Cloud native configuration tree',
    data: JSON.stringify({
      version: "3.8",
      services: {
        web: {
          image: "nginx:alpine",
          ports: ["80:80", "443:443"],
          environment: { NODE_ENV: "production", PORT: 3000 },
          restart: "always"
        },
        redis: {
          image: "redis:7-alpine",
          ports: ["6379:6379"],
          volumes: ["redis_data:/data"]
        }
      }
    }, null, 2),
  },
];

// Recursive Interactive Tree Node Component
function TreeNode({
  nodeKey,
  value,
  depth = 0,
  filter = '',
  expandedMap,
  toggleExpand,
}) {
  const isObject = value !== null && typeof value === 'object';
  const isArray = Array.isArray(value);
  const pathKey = `${depth}_${nodeKey}`;
  const isExpanded = expandedMap[pathKey] !== false; // default expanded

  const matchesFilter = useMemo(() => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    if (String(nodeKey).toLowerCase().includes(q)) return true;
    if (!isObject && String(value).toLowerCase().includes(q)) return true;
    return false;
  }, [nodeKey, value, isObject, filter]);

  if (!matchesFilter && !filter) return null;

  const renderValueBadge = () => {
    if (value === null) return <span className="text-amber-500 font-mono font-bold">null</span>;
    if (typeof value === 'boolean') return <span className="text-pink-500 font-mono font-bold">{String(value)}</span>;
    if (typeof value === 'number') return <span className="text-emerald-500 font-mono font-bold">{value}</span>;
    if (typeof value === 'string') return <span className="text-sky-500 font-mono">"{value}"</span>;
    return null;
  };

  return (
    <div className="pl-4 border-l border-slate-200 dark:border-white/[0.06] text-xs font-mono my-0.5">
      <div className="flex items-center gap-1.5 py-0.5 group hover:bg-sky-500/5 rounded px-1 -ml-1 transition-colors">
        {isObject ? (
          <button
            onClick={() => toggleExpand(pathKey)}
            className="p-0.5 text-slate-400 hover:text-sky-500 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
        ) : (
          <span className="w-3.5 h-3.5 inline-block opacity-0">•</span>
        )}

        {/* Key Label */}
        {nodeKey !== null && (
          <span className="font-bold text-slate-700 dark:text-slate-300">
            {nodeKey}:
          </span>
        )}

        {/* Value or Collection Summary */}
        {isObject ? (
          <span
            onClick={() => toggleExpand(pathKey)}
            className="text-[11px] text-slate-400 cursor-pointer hover:text-slate-200 select-none font-mono"
          >
            {isArray ? `Array [${value.length}]` : `Object {${Object.keys(value).length}}`}
          </span>
        ) : (
          <span className="truncate max-w-md">{renderValueBadge()}</span>
        )}
      </div>

      {/* Children Nodes */}
      {isObject && isExpanded && (
        <div className="space-y-0.5">
          {isArray
            ? value.map((item, idx) => (
                <TreeNode
                  key={idx}
                  nodeKey={idx}
                  value={item}
                  depth={depth + 1}
                  filter={filter}
                  expandedMap={expandedMap}
                  toggleExpand={toggleExpand}
                />
              ))
            : Object.keys(value).map((k) => (
                <TreeNode
                  key={k}
                  nodeKey={k}
                  value={value[k]}
                  depth={depth + 1}
                  filter={filter}
                  expandedMap={expandedMap}
                  toggleExpand={toggleExpand}
                />
              ))}
        </div>
      )}
    </div>
  );
}

export function JsonViewerTool() {
  const toast = useToast();
  const [jsonInput, setJsonInput] = useState(SAMPLE_JSON_VIEWER);
  const [activeTab, setActiveTab] = useState('tree'); // 'tree' | 'code' | 'jsonpath'
  const [filterText, setFilterText] = useState('');
  const [jsonPath, setJsonPath] = useState('$.store.inventory[*].title');
  const [expandedMap, setExpandedMap] = useState({});
  const [fontSize, setFontSize] = useState('normal');
  const [isZenMode, setIsZenMode] = useState(false);
  const [activePreset, setActivePreset] = useState('store');

  const parsed = useMemo(() => parseJsonWithPosition(jsonInput), [jsonInput]);

  const stats = useMemo(() => {
    if (!parsed || parsed.error || !parsed.data) {
      return { keyCount: 0, maxDepth: 0, arrayCount: 0, objectCount: 0 };
    }
    return calculateJsonStats(parsed.data);
  }, [parsed]);

  const jsonPathResult = useMemo(() => {
    if (!parsed || parsed.error || !parsed.data) return null;
    return evaluateJsonPath(parsed.data, jsonPath);
  }, [parsed, jsonPath]);

  const toggleExpand = (key) => {
    setExpandedMap((prev) => ({
      ...prev,
      [key]: prev[key] === false ? true : false,
    }));
  };

  const handleExpandAll = () => {
    setExpandedMap({});
    toast.success('All nodes expanded');
  };

  const handleCollapseAll = () => {
    // Collect all paths to collapsed
    const newMap = {};
    function collect(item, depth = 0, nodeKey = 'root') {
      const pKey = `${depth}_${nodeKey}`;
      newMap[pKey] = false;
      if (item && typeof item === 'object') {
        if (Array.isArray(item)) {
          item.forEach((sub, i) => collect(sub, depth + 1, i));
        } else {
          Object.keys(item).forEach((k) => collect(item[k], depth + 1, k));
        }
      }
    }
    if (parsed.data) collect(parsed.data);
    setExpandedMap(newMap);
    toast.info('All nodes collapsed');
  };

  const handlePrettify = (spaces = 2) => {
    if (!parsed.data) {
      toast.error('Invalid JSON');
      return;
    }
    setJsonInput(JSON.stringify(parsed.data, null, spaces));
    toast.success(`Formatted (${spaces} spaces)`);
  };

  const handleMinify = () => {
    if (!parsed.data) {
      toast.error('Invalid JSON');
      return;
    }
    setJsonInput(JSON.stringify(parsed.data));
    toast.success('JSON minified');
  };

  const handleSortKeys = () => {
    if (!parsed.data) {
      toast.error('Invalid JSON');
      return;
    }
    const sorted = sortJsonKeys(parsed.data);
    setJsonInput(JSON.stringify(sorted, null, 2));
    toast.success('Object keys sorted alphabetically');
  };

  const handleDownload = () => {
    const blob = new Blob([jsonInput], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `quickformat_data_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    fireConfetti();
    toast.success('Downloaded JSON file!');
  };

  const fontSizeClass =
    fontSize === 'small' ? 'text-xs' : fontSize === 'large' ? 'text-base' : 'text-xs sm:text-sm';

  return (
    <div className={`space-y-6 ${isZenMode ? 'fixed inset-0 z-50 p-6 bg-slate-950 overflow-y-auto' : ''}`}>
      {/* Studio Tool Hero Header */}
      <ToolHeroHeader
        icon={ListTree}
        category="Data Architecture"
        badge="Interactive Tree & JSONPath"
        title="JSON Formatter, Tree Viewer & Query Engine"
        description="Format, inspect, and evaluate JSON in an interactive collapsible tree view with real-time JSONPath filtering, key sorting, and in-browser schema validation."
        actions={
          <>
            <CopyButton
              text={() => jsonInput}
              label="Copy JSON"
              copiedLabel="Copied!"
              targetElementId="json-viewer-output"
            />
            <button
              onClick={handleDownload}
              className="btn-primary"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON</span>
            </button>
          </>
        }
      />

      {/* Preset Chips Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap p-3 rounded-2xl glass-panel">
        <PresetChips
          presets={PRESETS}
          onSelect={(p) => {
            setJsonInput(p.data);
            setActivePreset(p.id);
            toast.success(`Loaded "${p.label}"`);
          }}
          activeId={activePreset}
          label="Sample Payloads"
        />

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          <span>Real-time syntax & tree parser</span>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          icon={Hash}
          label="Total Keys"
          value={stats.keyCount.toLocaleString()}
          subtext="Object property count"
          color="sky"
        />
        <StatCard
          icon={Layers}
          label="Hierarchy Depth"
          value={`${stats.maxDepth} Levels`}
          subtext="Max nesting level"
          color="purple"
        />
        <StatCard
          icon={Database}
          label="Containers"
          value={`${stats.arrayCount} Arrays • ${stats.objectCount} Objs`}
          subtext="Node structural counts"
          color="emerald"
        />
        <StatCard
          icon={Code2}
          label="Syntax Status"
          value={parsed.error ? 'Syntax Error' : 'Valid JSON'}
          subtext={parsed.error ? 'Needs fix' : `${new Blob([jsonInput]).size} bytes`}
          color={parsed.error ? 'rose' : 'amber'}
        />
      </div>

      {/* Dual Panel Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* LEFT: JSON Editor / Source */}
        <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xl overflow-hidden editor-pane flex flex-col focus-within:ring-2 focus-within:ring-sky-500/30 transition-all">
          <WindowHeader
            title="JSON Source"
            badge="Input"
            linesCount={jsonInput ? jsonInput.split('\n').length : 0}
            charsCount={jsonInput.length}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            isZenMode={isZenMode}
            onToggleZen={() => setIsZenMode(!isZenMode)}
          >
            <button
              onClick={() => handlePrettify(2)}
              className="px-2 py-1 text-xs text-sky-500 hover:text-sky-400 font-semibold rounded hover:bg-sky-500/10 flex items-center gap-1"
              title="Prettify 2 spaces"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>2 Spaces</span>
            </button>
            <button
              onClick={handleMinify}
              className="px-2 py-1 text-xs text-slate-500 dark:text-slate-400 hover:text-sky-500 font-semibold rounded hover:bg-sky-500/10 flex items-center gap-1"
              title="Minify JSON"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Minify</span>
            </button>
            <button
              onClick={handleSortKeys}
              className="px-2 py-1 text-xs text-slate-500 dark:text-slate-400 hover:text-sky-500 font-semibold rounded hover:bg-sky-500/10 flex items-center gap-1"
              title="Sort keys alphabetically"
            >
              <ArrowDownAZ className="w-3.5 h-3.5" />
              <span>Sort</span>
            </button>
            <button
              onClick={() => {
                setJsonInput('');
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
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value);
                setActivePreset(null);
              }}
              placeholder="Paste JSON here..."
              rows={18}
              className={`w-full p-4 font-mono code-viewport bg-slate-50 dark:bg-[#050811] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-none leading-relaxed min-h-[460px] border border-transparent ${fontSizeClass}`}
              spellCheck={false}
            />
          </div>

          {parsed.error && (
            <div className="mx-4 mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{parsed.error}</span>
            </div>
          )}
        </div>

        {/* RIGHT: Tree Viewer & JSONPath Query */}
        <div
          id="json-viewer-output"
          className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xl overflow-hidden editor-pane flex flex-col min-h-[520px]"
        >
          <WindowHeader
            title="Tree & JSONPath Inspector"
            badge={activeTab.toUpperCase()}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
          >
            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-white/[0.06] p-0.5 rounded-xl border border-slate-200/60 dark:border-white/[0.08]">
              <button
                onClick={() => setActiveTab('tree')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'tree'
                    ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <ListTree className="w-3.5 h-3.5" />
                <span>Tree</span>
              </button>
              <button
                onClick={() => setActiveTab('jsonpath')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'jsonpath'
                    ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>JSONPath</span>
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'code'
                    ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Code</span>
              </button>
            </div>
          </WindowHeader>

          {/* Sub Toolbar for Tree View */}
          {activeTab === 'tree' && (
            <div className="p-3 border-b border-slate-200/60 dark:border-white/[0.06] flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-[#070b14]/50">
              <div className="relative flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  placeholder="Filter keys or values..."
                  className="w-full pl-8 pr-2.5 py-1 text-xs bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-white/[0.08] rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <button
                  onClick={handleExpandAll}
                  className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:text-sky-500 rounded bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08]"
                >
                  Expand All
                </button>
                <button
                  onClick={handleCollapseAll}
                  className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:text-sky-500 rounded bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08]"
                >
                  Collapse All
                </button>
              </div>
            </div>
          )}

          {/* Tree View Body */}
          {activeTab === 'tree' && (
            <div className="p-4 flex-1 overflow-auto max-h-[500px] code-viewport">
              {parsed.data ? (
                <TreeNode
                  nodeKey="root"
                  value={parsed.data}
                  depth={0}
                  filter={filterText}
                  expandedMap={expandedMap}
                  toggleExpand={toggleExpand}
                />
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Awaiting valid JSON data...
                </div>
              )}
            </div>
          )}

          {/* JSONPath Query Body */}
          {activeTab === 'jsonpath' && (
            <div className="p-4 flex-1 flex flex-col space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>JSONPath Expression:</span>
                  <span className="text-[10px] text-slate-400 font-mono">e.g. $.store.inventory[*].price</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={jsonPath}
                    onChange={(e) => setJsonPath(e.target.value)}
                    placeholder="$.path.to.property..."
                    className="flex-1 px-3 py-1.5 font-mono text-xs bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-white/[0.08] rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                  <CopyButton
                    text={() => (jsonPathResult?.result ? JSON.stringify(jsonPathResult.result, null, 2) : '')}
                    label="Copy Result"
                    copiedLabel="Copied!"
                    variant="subtle"
                  />
                </div>
              </div>

              {jsonPathResult?.error && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs">
                  {jsonPathResult.error}
                </div>
              )}

              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-1.5 text-xs text-slate-400 font-mono">
                  <span>Matched Results ({jsonPathResult?.count || 0}):</span>
                </div>
                <textarea
                  readOnly
                  value={
                    jsonPathResult?.result !== undefined
                      ? JSON.stringify(jsonPathResult.result, null, 2)
                      : '// No match found'
                  }
                  rows={14}
                  className={`w-full flex-1 p-3 font-mono code-viewport bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sky-600 dark:text-sky-300 focus:outline-none resize-none leading-relaxed ${fontSizeClass}`}
                />
              </div>
            </div>
          )}

          {/* Formatted Code Body */}
          {activeTab === 'code' && (
            <div className="p-2 flex-1 flex flex-col">
              <textarea
                readOnly
                value={parsed.data ? JSON.stringify(parsed.data, null, 2) : jsonInput}
                rows={18}
                className={`w-full flex-1 p-4 font-mono code-viewport bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-white/[0.08] rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none resize-none leading-relaxed min-h-[440px] ${fontSizeClass}`}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
