import React, { useState, useEffect, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  Wand2,
  Minimize2,
  Trash2,
  Upload,
  RefreshCw,
  AlertTriangle,
  Table as TableIcon,
  Code2,
  Search,
  Layers,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Sparkles,
  CheckCircle2,
  SlidersHorizontal,
  FileCode
} from 'lucide-react';
import { parseJsonInput, jsonToCsv, SAMPLE_JSON } from '../../utils/jsonToCsv';
import { useToast } from '../../context/ToastContext';
import { WindowHeader } from '../common/WindowHeader';
import { CopyButton } from '../common/CopyButton';
import { ToggleSwitch } from '../common/ToggleSwitch';
import { PresetChips } from '../common/PresetChips';
import { triggerConfetti } from '../../utils/confetti';

const PRESETS = [
  {
    id: 'users',
    label: 'User Directory',
    description: 'Array of user profiles with nested address objects',
    data: JSON.stringify([
      { id: 101, name: "Alice Zhang", email: "alice@company.io", role: "Staff Engineer", address: { city: "San Francisco", state: "CA", country: "USA" }, active: true },
      { id: 102, name: "Marcus Vance", email: "marcus@company.io", role: "Product Designer", address: { city: "London", state: "England", country: "UK" }, active: true },
      { id: 103, name: "Elena Rostova", email: "elena@company.io", role: "Security Auditor", address: { city: "Berlin", state: "Berlin", country: "Germany" }, active: false },
      { id: 104, name: "Kenji Sato", email: "kenji@company.io", role: "DevOps Lead", address: { city: "Tokyo", state: "Kanto", country: "Japan" }, active: true }
    ], null, 2),
  },
  {
    id: 'orders',
    label: 'E-Commerce Orders',
    description: 'Orders with currency, items count, and shipping metadata',
    data: JSON.stringify([
      { orderId: "ORD-9201", customer: "Sophia Chen", items: 3, total: 199.26, currency: "USD", status: "completed", shipping: { method: "Express", carrier: "FedEx" } },
      { orderId: "ORD-9202", customer: "Liam Gallagher", items: 1, total: 48.60, currency: "USD", status: "processing", shipping: { method: "Standard", carrier: "UPS" } },
      { orderId: "ORD-9203", customer: "Amina Al-Mansoor", items: 5, total: 444.96, currency: "USD", status: "delivered", shipping: { method: "Priority", carrier: "DHL" } }
    ], null, 2),
  },
  {
    id: 'webhook',
    label: 'Stripe Webhook',
    description: 'Nested payment intent webhook event records',
    data: JSON.stringify([
      { id: "evt_3N8xYz", type: "payment_intent.succeeded", created: 1698240000, data: { amount: 8900, currency: "usd", customer: "cus_Ow12x", status: "succeeded" } },
      { id: "evt_3N8xZa", type: "charge.captured", created: 1698240015, data: { amount: 8900, currency: "usd", customer: "cus_Ow12x", status: "paid" } }
    ], null, 2),
  },
];

export function JsonToCsvTool() {
  const toast = useToast();
  const [jsonInput, setJsonInput] = useState(SAMPLE_JSON);
  const [flatten, setFlatten] = useState(true);
  const [delimiter, setDelimiter] = useState(',');
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [quoteAll, setQuoteAll] = useState(false);
  const [flattenDelimiter, setFlattenDelimiter] = useState('.');
  const [activePreset, setActivePreset] = useState(null);
  
  // UI UX enhancements
  const [fontSize, setFontSize] = useState('normal');
  const [isZenMode, setIsZenMode] = useState(false);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'

  const [errorMessage, setErrorMessage] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [activeTab, setActiveTab] = useState('table'); // 'table' | 'csv'
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Process JSON conversion
  useEffect(() => {
    if (!jsonInput.trim()) {
      setErrorMessage(null);
      setParsedData(null);
      return;
    }

    try {
      const records = parseJsonInput(jsonInput);
      const result = jsonToCsv(records, {
        flatten,
        delimiter,
        includeHeaders,
        quoteAll,
        flattenDelimiter,
      });
      setParsedData(result);
      setErrorMessage(null);
      setCurrentPage(1);
    } catch (err) {
      setErrorMessage(err.message);
      setParsedData(null);
    }
  }, [jsonInput, flatten, delimiter, includeHeaders, quoteAll, flattenDelimiter]);

  // Prettify
  const handlePrettify = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed, null, 2));
      toast.success('JSON formatted & prettified');
    } catch (err) {
      toast.error('Cannot format invalid JSON');
    }
  };

  // Minify
  const handleMinify = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed));
      toast.success('JSON minified');
    } catch (err) {
      toast.error('Cannot minify invalid JSON');
    }
  };

  // File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setJsonInput(content);
        setActivePreset(null);
        toast.success(`Loaded "${file.name}"`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Download CSV with Confetti celebration
  const handleDownloadCsv = (ext = 'csv') => {
    if (!parsedData || !parsedData.csv) {
      toast.error('No data available to download');
      return;
    }
    const blob = new Blob([parsedData.csv], {
      type: ext === 'tsv' ? 'text/tab-separated-values;charset=utf-8;' : 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `quickformat_export_${Date.now()}.${ext}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerConfetti();
    toast.success(`Downloaded .${ext} spreadsheet!`);
  };

  // Handle Preset Selection
  const handlePresetSelect = (preset) => {
    setJsonInput(preset.data);
    setActivePreset(preset.id);
    toast.success(`Loaded ${preset.label} preset`);
  };

  // Table Column Sort Handler
  const handleSort = (colName) => {
    if (sortColumn === colName) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(colName);
      setSortDirection('asc');
    }
  };

  // Filtered & Sorted rows for table view
  const processedTableRows = useMemo(() => {
    if (!parsedData || !parsedData.rows) return [];
    let rows = [...parsedData.rows];

    // Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter((row) =>
        row.some((cell) => String(cell).toLowerCase().includes(q))
      );
    }

    // Sort
    if (sortColumn !== null && parsedData.headers) {
      const colIndex = parsedData.headers.indexOf(sortColumn);
      if (colIndex > -1) {
        rows.sort((a, b) => {
          const valA = a[colIndex];
          const valB = b[colIndex];
          if (valA === valB) return 0;
          if (valA === null || valA === undefined) return 1;
          if (valB === null || valB === undefined) return -1;
          const cmp = String(valA).localeCompare(String(valB), undefined, { numeric: true });
          return sortDirection === 'asc' ? cmp : -cmp;
        });
      }
    }

    return rows;
  }, [parsedData, searchQuery, sortColumn, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(processedTableRows.length / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedTableRows.slice(start, start + pageSize);
  }, [processedTableRows, currentPage]);

  const fontSizeClass =
    fontSize === 'small' ? 'text-xs' : fontSize === 'large' ? 'text-base' : 'text-xs sm:text-sm';

  return (
    <div className={`space-y-6 ${isZenMode ? 'fixed inset-0 z-50 p-6 bg-slate-950 overflow-y-auto' : ''}`}>
      {/* Tool Header & Hero Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-500 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Client-Side Data Pipeline • V8 In-Memory Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            JSON to CSV & Excel Converter
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Flatten nested JSON structures, configure custom delimiters, preview in an interactive data grid, and export zero-latency spreadsheets.
          </p>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <CopyButton
            text={() => parsedData?.csv || ''}
            label="Copy CSV"
            copiedLabel="Copied CSV!"
            targetElementId="csv-output-card"
          />

          <button
            onClick={() => handleDownloadCsv('csv')}
            disabled={!parsedData}
            id="btn-download-csv"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/25 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV</span>
          </button>

          <button
            onClick={() => handleDownloadCsv('tsv')}
            disabled={!parsedData}
            id="btn-download-excel"
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5"
            title="Download TSV format optimized for Microsoft Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel (.tsv)</span>
          </button>
        </div>
      </div>

      {/* Preset Chips Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap p-3 rounded-2xl glass-panel">
        <PresetChips
          presets={PRESETS}
          onSelect={handlePresetSelect}
          activeId={activePreset}
          label="1-Click Presets"
        />

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Zero network latency</span>
        </div>
      </div>

      {/* Main Dual-Pane Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* LEFT PANE: Input JSON Editor */}
        <div className="flex flex-col rounded-2xl glass-panel shadow-xl overflow-hidden editor-pane border border-slate-200/80 dark:border-slate-800/80 focus-within:ring-2 focus-within:ring-sky-500/30 transition-all">
          {/* Window Header */}
          <WindowHeader
            title="JSON Source"
            badge="JSON"
            charsCount={jsonInput.length}
            linesCount={jsonInput ? jsonInput.split('\n').length : 0}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            isZenMode={isZenMode}
            onToggleZen={() => setIsZenMode(!isZenMode)}
          >
            <button
              onClick={handlePrettify}
              className="px-2 py-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-brand-500 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors text-xs font-semibold flex items-center gap-1"
              title="Prettify JSON"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Prettify</span>
            </button>

            <button
              onClick={handleMinify}
              className="px-2 py-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-brand-500 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors text-xs font-semibold flex items-center gap-1"
              title="Minify JSON"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Minify</span>
            </button>

            <label
              className="px-2 py-1 rounded-lg text-slate-600 dark:text-slate-400 hover:text-brand-500 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
              title="Upload JSON"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Upload</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={() => {
                setJsonInput(SAMPLE_JSON);
                setActivePreset(null);
                toast.success('Sample dataset loaded');
              }}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-brand-500 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors text-xs font-medium"
              title="Reload Sample Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                setJsonInput('');
                setActivePreset(null);
                toast.info('Input cleared');
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
              title="Clear Input"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </WindowHeader>

          {/* JSON Textarea */}
          <div className="relative">
            <textarea
              id="json-input-textarea"
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value);
                setActivePreset(null);
              }}
              placeholder="Paste JSON array or object here..."
              rows={16}
              className={`w-full p-4 font-mono ${fontSizeClass} bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-y selection:bg-brand-500/30 leading-relaxed min-h-[380px]`}
              spellCheck={false}
            />
          </div>

          {/* Syntax Error Alert */}
          {errorMessage && (
            <div className="mx-4 mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold block">JSON Parsing Error</span>
                <span className="font-mono">{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Modern Options Bar with Switch Toggles */}
          <div className="p-3.5 bg-slate-50/80 dark:bg-[#0b1120]/80 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
            <ToggleSwitch
              label="Flatten Nested"
              checked={flatten}
              onChange={setFlatten}
              size="sm"
            />

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Delimiter:</span>
              <select
                value={delimiter}
                onChange={(e) => setDelimiter(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-800 dark:text-slate-200 text-xs font-mono font-semibold focus:outline-none focus:border-brand-500 shadow-xs cursor-pointer"
              >
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value="&#9;">Tab (\t)</option>
                <option value="|">Pipe (|)</option>
              </select>
            </div>

            <ToggleSwitch
              label="Header Row"
              checked={includeHeaders}
              onChange={setIncludeHeaders}
              size="sm"
            />

            <ToggleSwitch
              label="Quote All"
              checked={quoteAll}
              onChange={setQuoteAll}
              size="sm"
            />
          </div>
        </div>

        {/* RIGHT PANE: Output Table & CSV */}
        <div
          id="csv-output-card"
          className="flex flex-col rounded-2xl glass-panel shadow-xl overflow-hidden editor-pane min-h-[480px] border border-slate-200/80 dark:border-slate-800/80"
        >
          {/* Window Header */}
          <WindowHeader
            title="CSV Output Preview"
            badge="CSV"
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
          >
            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-850 p-0.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <button
                onClick={() => setActiveTab('table')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'table'
                    ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>

              <button
                onClick={() => setActiveTab('csv')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'csv'
                    ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Raw CSV</span>
              </button>
            </div>

            {parsedData && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold border border-emerald-500/20">
                {parsedData.rowCount}R × {parsedData.colCount}C
              </span>
            )}
          </WindowHeader>

          {/* Content Body */}
          <div className="p-4 flex-1 flex flex-col">
            {!parsedData && !errorMessage && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <FileSpreadsheet className="w-12 h-12 mb-3 stroke-[1.25] text-slate-400 animate-pulse" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Ready to transform JSON
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Paste JSON in the left panel or click any 1-click preset chip above.
                </p>
              </div>
            )}

            {parsedData && activeTab === 'table' && (
              <div className="flex-1 flex flex-col space-y-3">
                {/* Search / Filter */}
                <div className="flex items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search rows or values..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 shadow-xs"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Showing {paginatedRows.length} of {processedTableRows.length} rows
                  </span>
                </div>

                {/* Studio Table Scroll Area with Sticky Sortable Headers */}
                <div className="flex-1 overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800/80 max-h-[340px]">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-slate-100/95 dark:bg-[#0e1628]/95 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800 z-10 select-none">
                      <tr>
                        <th className="px-3 py-2.5 text-slate-400 font-mono text-[11px] w-12 text-center">
                          #
                        </th>
                        {parsedData.headers.map((hdr) => {
                          const isSorted = sortColumn === hdr;
                          return (
                            <th
                              key={hdr}
                              onClick={() => handleSort(hdr)}
                              className="px-3.5 py-2.5 whitespace-nowrap font-mono text-[11px] cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors"
                              title={`Sort by ${hdr}`}
                            >
                              <div className="flex items-center gap-1.5">
                                <span>{hdr}</span>
                                {isSorted ? (
                                  sortDirection === 'asc' ? (
                                    <ArrowUp className="w-3 h-3 text-brand-500" />
                                  ) : (
                                    <ArrowDown className="w-3 h-3 text-brand-500" />
                                  )
                                ) : (
                                  <ArrowUpDown className="w-3 h-3 opacity-30 hover:opacity-100" />
                                )}
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                      {paginatedRows.map((row, rIdx) => {
                        const globalIdx = (currentPage - 1) * pageSize + rIdx + 1;
                        return (
                          <tr
                            key={rIdx}
                            className="hover:bg-sky-500/5 dark:hover:bg-sky-500/5 transition-colors"
                          >
                            <td className="px-3 py-2 text-slate-400 font-mono text-[11px] text-center bg-slate-50/50 dark:bg-slate-900/40">
                              {globalIdx}
                            </td>
                            {row.map((cell, cIdx) => (
                              <td
                                key={cIdx}
                                className="px-3.5 py-2 text-slate-800 dark:text-slate-200 whitespace-nowrap max-w-xs truncate"
                                title={String(cell)}
                              >
                                {cell === '' || cell === null || cell === undefined ? (
                                  <span className="text-slate-400 italic font-sans text-[11px]">empty</span>
                                ) : (
                                  String(cell)
                                )}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer & Pagination */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs">
                  <div className="text-slate-400 font-mono text-[11px]">
                    Page {currentPage} of {totalPages}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-brand-500 transition-colors"
                    >
                      Prev
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:border-brand-500 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}

            {parsedData && activeTab === 'csv' && (
              <div className="flex-1 flex flex-col">
                <textarea
                  readOnly
                  value={parsedData.csv}
                  rows={14}
                  className={`w-full flex-1 p-3 font-mono ${fontSizeClass} bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none resize-none leading-relaxed min-h-[380px]`}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
