import React, { useState, useMemo, useEffect } from 'react';
import {
  Database,
  Code2,
  Wand2,
  Minimize2,
  Copy,
  Download,
  Trash2,
  Sparkles,
  Layers,
  ArrowRight,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import {
  formatSql,
  minifySql,
  analyzeSqlQuery,
  SAMPLE_SQL,
} from '../../utils/sqlFormatterUtils';
import { useToast } from '../../context/ToastContext';
import { ToolHeroHeader } from '../common/ToolHeroHeader';
import { WindowHeader } from '../common/WindowHeader';
import { CopyButton } from '../common/CopyButton';
import { StatCard } from '../common/StatCard';
import { PresetChips } from '../common/PresetChips';
import { ToggleSwitch } from '../common/ToggleSwitch';
import { fireConfetti } from '../../utils/confetti';

const PRESETS = [
  {
    id: 'cte',
    label: 'CTE & Window Function',
    description: 'Quarterly analytics with WITH, JOIN, and RANK()',
    sql: SAMPLE_SQL,
  },
  {
    id: 'simple_join',
    label: 'User Orders JOIN',
    description: 'Standard relational query with WHERE filter and ORDER BY',
    sql: `select u.id, u.username, u.email, count(o.id) as orders_count, max(o.created_at) as last_order_date from users u left join orders o on u.id = o.user_id where u.is_active = true and u.deleted_at is null group by u.id, u.username, u.email order by orders_count desc limit 100;`,
  },
  {
    id: 'insert_batch',
    label: 'Batch INSERT Statement',
    description: 'Insert multiple records into inventory table',
    sql: `insert into products (sku, title, category_id, price, stock_qty, created_at) values ('SKU-1001', 'Quantum Server Rack', 42, 4999.00, 15, current_timestamp), ('SKU-1002', 'Fiber Switch 100G', 18, 1299.50, 40, current_timestamp), ('SKU-1003', 'Hardware Security Module', 9, 3200.00, 8, current_timestamp);`,
  },
];

export function SqlFormatterTool() {
  const toast = useToast();
  const [sqlInput, setSqlInput] = useState(SAMPLE_SQL);
  const [keywordCase, setKeywordCase] = useState('upper'); // 'upper' | 'lower' | 'preserve'
  const [indentWidth, setIndentWidth] = useState('2'); // '2' | '4'
  const [commaBreak, setCommaBreak] = useState(false);
  const [fontSize, setFontSize] = useState('normal');
  const [isZenMode, setIsZenMode] = useState(false);
  const [activePreset, setActivePreset] = useState('cte');

  const formattedSql = useMemo(() => {
    return formatSql(sqlInput, {
      keywordCase,
      indent: indentWidth === '4' ? '    ' : '  ',
      commaBreak,
    });
  }, [sqlInput, keywordCase, indentWidth, commaBreak]);

  const analysis = useMemo(() => analyzeSqlQuery(sqlInput), [sqlInput]);

  const handleMinify = () => {
    const minified = minifySql(sqlInput);
    setSqlInput(minified);
    toast.success('SQL query minified to single line');
  };

  const handleDownload = () => {
    const blob = new Blob([formattedSql], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `quickformat_query_${Date.now()}.sql`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    fireConfetti();
    toast.success('Downloaded .sql query file!');
  };

  const fontSizeClass =
    fontSize === 'small' ? 'text-xs' : fontSize === 'large' ? 'text-base' : 'text-xs sm:text-sm';

  return (
    <div className={`space-y-6 ${isZenMode ? 'fixed inset-0 z-50 p-6 bg-slate-950 overflow-y-auto' : ''}`}>
      {/* Studio Tool Hero Header */}
      <ToolHeroHeader
        icon={Database}
        category="Database Engineering"
        badge="ANSI SQL / Postgres / MySQL"
        title="SQL Query Formatter & Minifier"
        description="Format, beautify, and minify messy SQL queries. Configurable uppercase keyword casing, intelligent clause indentation, CTE support, and instant query statistics."
        actions={
          <>
            <CopyButton
              text={() => formattedSql}
              label="Copy Formatted SQL"
              copiedLabel="Copied!"
              targetElementId="sql-output-editor"
            />
            <button
              onClick={handleDownload}
              className="btn-primary"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download SQL</span>
            </button>
          </>
        }
      />

      {/* Preset Chips Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap p-3 rounded-2xl glass-panel">
        <PresetChips
          presets={PRESETS}
          onSelect={(p) => {
            setSqlInput(p.sql);
            setActivePreset(p.id);
            toast.success(`Loaded "${p.label}"`);
          }}
          activeId={activePreset}
          label="Sample Queries"
        />

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          <span>Supports CTEs, Subqueries & Joins</span>
        </div>
      </div>

      {/* Executive Stat KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          icon={Database}
          label="Query Type"
          value={analysis.queryType}
          subtext="Statement classification"
          color="sky"
        />
        <StatCard
          icon={Layers}
          label="Estimated Tables"
          value={analysis.tableCount.toString()}
          subtext="FROM & JOIN entities"
          color="purple"
        />
        <StatCard
          icon={Code2}
          label="JOIN Operations"
          value={analysis.joinCount.toString()}
          subtext="Relational joins"
          color="emerald"
        />
        <StatCard
          icon={Sparkles}
          label="Formatted Lines"
          value={formattedSql ? formattedSql.split('\n').length.toString() : '0'}
          subtext="Structured output"
          color="amber"
        />
      </div>

      {/* Main Dual-Pane Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* LEFT: Raw SQL Input */}
        <div className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xl overflow-hidden editor-pane flex flex-col focus-within:ring-2 focus-within:ring-sky-500/30 transition-all">
          <WindowHeader
            title="Raw SQL Query"
            badge="Input"
            linesCount={sqlInput ? sqlInput.split('\n').length : 0}
            charsCount={sqlInput.length}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            isZenMode={isZenMode}
            onToggleZen={() => setIsZenMode(!isZenMode)}
          >
            <button
              onClick={handleMinify}
              className="px-2 py-1 text-xs text-slate-600 dark:text-slate-400 hover:text-sky-500 font-semibold rounded hover:bg-sky-500/10 flex items-center gap-1"
              title="Minify SQL to single line"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Minify</span>
            </button>
            <button
              onClick={() => {
                setSqlInput('');
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
              value={sqlInput}
              onChange={(e) => {
                setSqlInput(e.target.value);
                setActivePreset(null);
              }}
              placeholder="Paste raw SQL query here (e.g. select * from users where id = 1)..."
              rows={16}
              className={`w-full p-4 font-mono code-viewport bg-slate-50 dark:bg-[#050811] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-none leading-relaxed min-h-[420px] border border-transparent ${fontSizeClass}`}
              spellCheck={false}
            />
          </div>

          {/* Options Bar */}
          <div className="p-3.5 bg-slate-50/80 dark:bg-[#0b1120]/80 border-t border-slate-200/80 dark:border-white/[0.06] flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Keywords:</span>
              <select
                value={keywordCase}
                onChange={(e) => setKeywordCase(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/[0.1] rounded-lg px-2.5 py-1 text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-none focus:border-sky-500 shadow-xs cursor-pointer"
              >
                <option value="upper">UPPERCASE</option>
                <option value="lower">lowercase</option>
                <option value="preserve">Preserve Original</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Indentation:</span>
              <select
                value={indentWidth}
                onChange={(e) => setIndentWidth(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/[0.1] rounded-lg px-2.5 py-1 text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-none focus:border-sky-500 shadow-xs cursor-pointer"
              >
                <option value="2">2 Spaces</option>
                <option value="4">4 Spaces</option>
              </select>
            </div>

            <ToggleSwitch
              label="Break on Commas"
              checked={commaBreak}
              onChange={setCommaBreak}
              size="sm"
            />
          </div>
        </div>

        {/* RIGHT: Formatted Output */}
        <div
          id="sql-output-editor"
          className="glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xl overflow-hidden editor-pane flex flex-col min-h-[480px]"
        >
          <WindowHeader
            title="Beautified SQL Result"
            badge="Formatted"
            linesCount={formattedSql ? formattedSql.split('\n').length : 0}
            charsCount={formattedSql.length}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
          />

          <div className="p-2 flex-1 flex flex-col">
            <textarea
              readOnly
              value={formattedSql}
              rows={18}
              className={`w-full flex-1 p-4 font-mono code-viewport bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sky-600 dark:text-sky-300 focus:outline-none resize-none leading-relaxed min-h-[440px] ${fontSizeClass}`}
              spellCheck={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
