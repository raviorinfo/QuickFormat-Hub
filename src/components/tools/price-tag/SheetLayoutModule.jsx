import React, { useState, useMemo, useRef } from 'react';
import {
  Grid,
  Printer,
  Download,
  Sliders,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Layers,
  FileText,
  FileSpreadsheet,
  X,
  Sparkles
} from 'lucide-react';
import {
  PAPER_FORMATS,
  SHEET_PRESETS,
  calculateSheetArrangement,
} from '../../../utils/sheetLayoutEngine';
import { exportMultiPageSheetPdf, downloadCsv } from '../../../utils/exportUtils';
import { formatIndianCurrency } from '../../../utils/mrpTagUtils';
import { useToast } from '../../../context/ToastContext';

export function SheetLayoutModule({
  sheetConfig,
  setSheetConfig,
  itemsToPrint = [],
  fallbackItem = null,
}) {
  const toast = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(80); // percentage
  const [isCalibrationOpen, setIsCalibrationOpen] = useState(false);
  const printableSheetRef = useRef(null);

  const {
    paperFormatId = 'a4',
    customPaperWidthMm = 210,
    customPaperHeightMm = 297,
    orientation = 'portrait',
    selectedPresetId = 'a4-24up',
    labelWidthMm = 70,
    labelHeightMm = 36,
    cols = 3,
    rows = 8,
    marginTopMm = 4.5,
    marginBottomMm = 4.5,
    marginLeftMm = 0,
    marginRightMm = 0,
    gapXmm = 0,
    gapYmm = 0,
    showCutGuides = true,
    readingOrder = 'row-first',
    alignment = 'center',
  } = sheetConfig;

  // Run the automatic arrangement engine
  const layout = useMemo(() => {
    return calculateSheetArrangement({
      paperFormatId,
      customPaperWidthMm,
      customPaperHeightMm,
      orientation,
      labelWidthMm,
      labelHeightMm,
      cols,
      rows,
      marginTopMm,
      marginBottomMm,
      marginLeftMm,
      marginRightMm,
      gapXmm,
      gapYmm,
      items: itemsToPrint.length > 0 ? itemsToPrint : null,
      repeatItem: itemsToPrint.length === 0 ? fallbackItem : null,
      alignment,
      readingOrder,
      showCutGuides,
    });
  }, [
    paperFormatId,
    customPaperWidthMm,
    customPaperHeightMm,
    orientation,
    labelWidthMm,
    labelHeightMm,
    cols,
    rows,
    marginTopMm,
    marginBottomMm,
    marginLeftMm,
    marginRightMm,
    gapXmm,
    gapYmm,
    itemsToPrint,
    fallbackItem,
    alignment,
    readingOrder,
    showCutGuides,
  ]);

  // Adjust current page if totalPages shrinks
  const totalPages = layout.totalPages || 1;
  const activePageIndex = Math.min(Math.max(1, currentPage), totalPages);
  const activePageData = layout.pages[activePageIndex - 1] || layout.pages[0];

  // Preset selector handler
  const handleSelectPreset = (presetId) => {
    const preset = SHEET_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setSheetConfig((prev) => ({
      ...prev,
      selectedPresetId: preset.id,
      paperFormatId: preset.paperFormat,
      labelWidthMm: preset.labelWidthMm,
      labelHeightMm: preset.labelHeightMm,
      cols: preset.cols,
      rows: preset.rows,
      marginTopMm: preset.marginTopMm,
      marginBottomMm: preset.marginBottomMm,
      marginLeftMm: preset.marginLeftMm,
      marginRightMm: preset.marginRightMm,
      gapXmm: preset.gapXmm,
      gapYmm: preset.gapYmm,
    }));
    toast.success(`Loaded preset: ${preset.name}`);
  };

  // Direct Browser Printing (Module 4.A)
  const handlePrint = () => {
    window.print();
  };

  // Download PDF Multi-Page (Module 4.B)
  const handleDownloadPdf = () => {
    try {
      exportMultiPageSheetPdf({
        pages: layout.pages,
        paperWidthMm: layout.paperWidthMm,
        paperHeightMm: layout.paperHeightMm,
        orientation,
        showCutGuides,
        filename: `label-sheet-${paperFormatId}-${layout.totalLabels}labels.pdf`,
      });
      toast.success(`Exported ${layout.totalPages}-page label sheet PDF!`);
    } catch (err) {
      toast.error(err.message || 'Failed to export PDF');
    }
  };

  // Export CSV of arranged items
  const handleExportCsv = () => {
    const allLabels = layout.pages.flatMap((p) => p.labels);
    const rows = [
      'Page,Slot,X_mm,Y_mm,Product Name,SKU,Barcode,MRP,Selling Price,Quantity',
      ...allLabels.map((l) => {
        const item = l.item || {};
        return `${l.pageNumber},${l.slotIndex + 1},${l.xMm.toFixed(1)},${l.yMm.toFixed(1)},"${item.name || item.productName || ''}","${item.sku || ''}","${item.barcode || ''}",${item.mrp || 0},${item.sellingPrice || ''},${item.quantity || 1}`;
      }),
    ].join('\n');
    downloadCsv(rows, `sheet-labels-${layout.totalLabels}.csv`);
    toast.success('Downloaded CSV manifest');
  };

  return (
    <div className="space-y-4">
      {/* 1. Sheet Presets Bar */}
      <div className="bg-white dark:bg-[#0c1220] p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Commercial Label Sheet Presets</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Avery® 5160, A4 24-Up, A4 21-Up & Rolls
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {SHEET_PRESETS.map((p) => {
            const isSelected = selectedPresetId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p.id)}
                className={`p-2 rounded-xl border text-left flex flex-col justify-between gap-1 transition-all group cursor-pointer ${
                  isSelected
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-500/15 ring-1 ring-sky-500 text-sky-900 dark:text-sky-200'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="text-[11px] font-bold leading-tight line-clamp-2">
                  {p.name.split('(')[0].trim()}
                </div>
                <div className="text-[9px] font-mono text-slate-400">
                  {p.cols}×{p.rows} ({p.cols * p.rows}/sheet)
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Main Two-Column Layout: Controls (4 Cols) & Multi-Page WYSIWYG (8 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Settings Panel (4 Columns) */}
        <div className="lg:col-span-4 space-y-3.5">
          {/* Card A: Page & Paper Configuration */}
          <div className="bg-white dark:bg-[#0c1220] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-white/[0.06]">
              <Sliders className="w-3.5 h-3.5 text-sky-500" />
              Paper & Grid Geometry
            </span>

            {/* Paper Format & Orientation */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Paper Size</label>
                <select
                  value={paperFormatId}
                  onChange={(e) => setSheetConfig((p) => ({ ...p, paperFormatId: e.target.value }))}
                  className="w-full text-xs font-semibold p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/30"
                >
                  {PAPER_FORMATS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Orientation</label>
                <select
                  value={orientation}
                  onChange={(e) => setSheetConfig((p) => ({ ...p, orientation: e.target.value }))}
                  className="w-full text-xs font-semibold p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/30"
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>
            </div>

            {/* Label Dimensions */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Label Width (mm)</label>
                <input
                  type="number"
                  value={labelWidthMm}
                  onChange={(e) => setSheetConfig((p) => ({ ...p, labelWidthMm: parseFloat(e.target.value) || 10 }))}
                  className="w-full text-xs p-1.5 rounded-lg border font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Label Height (mm)</label>
                <input
                  type="number"
                  value={labelHeightMm}
                  onChange={(e) => setSheetConfig((p) => ({ ...p, labelHeightMm: parseFloat(e.target.value) || 10 }))}
                  className="w-full text-xs p-1.5 rounded-lg border font-mono"
                />
              </div>
            </div>

            {/* Grid Cols & Rows */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Columns (Cols)</label>
                <input
                  type="number"
                  min="1"
                  value={cols}
                  onChange={(e) => setSheetConfig((p) => ({ ...p, cols: Math.max(1, parseInt(e.target.value, 10) || 1) }))}
                  className="w-full text-xs p-1.5 rounded-lg border font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Rows (Rows)</label>
                <input
                  type="number"
                  min="1"
                  value={rows}
                  onChange={(e) => setSheetConfig((p) => ({ ...p, rows: Math.max(1, parseInt(e.target.value, 10) || 1) }))}
                  className="w-full text-xs p-1.5 rounded-lg border font-mono font-bold"
                />
              </div>
            </div>

            {/* Margins */}
            <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Sheet Margins (mm)
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                <div>
                  <label className="text-[9px] text-slate-400 block">Top</label>
                  <input
                    type="number"
                    value={marginTopMm}
                    onChange={(e) => setSheetConfig((p) => ({ ...p, marginTopMm: parseFloat(e.target.value) || 0 }))}
                    className="w-full text-xs p-1 rounded border font-mono"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 block">Bottom</label>
                  <input
                    type="number"
                    value={marginBottomMm}
                    onChange={(e) => setSheetConfig((p) => ({ ...p, marginBottomMm: parseFloat(e.target.value) || 0 }))}
                    className="w-full text-xs p-1 rounded border font-mono"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 block">Left</label>
                  <input
                    type="number"
                    value={marginLeftMm}
                    onChange={(e) => setSheetConfig((p) => ({ ...p, marginLeftMm: parseFloat(e.target.value) || 0 }))}
                    className="w-full text-xs p-1 rounded border font-mono"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 block">Right</label>
                  <input
                    type="number"
                    value={marginRightMm}
                    onChange={(e) => setSheetConfig((p) => ({ ...p, marginRightMm: parseFloat(e.target.value) || 0 }))}
                    className="w-full text-xs p-1 rounded border font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Gaps between labels */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Gap X (mm)</label>
                <input
                  type="number"
                  value={gapXmm}
                  onChange={(e) => setSheetConfig((p) => ({ ...p, gapXmm: parseFloat(e.target.value) || 0 }))}
                  className="w-full text-xs p-1.5 rounded-lg border font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Gap Y (mm)</label>
                <input
                  type="number"
                  value={gapYmm}
                  onChange={(e) => setSheetConfig((p) => ({ ...p, gapYmm: parseFloat(e.target.value) || 0 }))}
                  className="w-full text-xs p-1.5 rounded-lg border font-mono"
                />
              </div>
            </div>

            {/* Cut Lines & Calibration Guide Trigger */}
            <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCutGuides}
                  onChange={(e) => setSheetConfig((p) => ({ ...p, showCutGuides: e.target.checked }))}
                  className="rounded text-sky-500"
                />
                <span>Show Cut Guides</span>
              </label>

              <button
                type="button"
                onClick={() => setIsCalibrationOpen(true)}
                className="text-[11px] font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Print Calibration Guide</span>
              </button>
            </div>
          </div>

          {/* Card B: Layout Yield Summary & Action Buttons */}
          <div className="bg-white dark:bg-[#0c1220] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.06]">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase font-mono">
                Print Yield & Metrics
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold">
                {layout.capacityPerPage} labels/sheet
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono">Total Labels</div>
                <div className="text-base font-black text-slate-900 dark:text-white font-mono">
                  {layout.totalLabels}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono">Total Pages</div>
                <div className="text-base font-black text-sky-600 dark:text-sky-400 font-mono">
                  {layout.totalPages}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono">Per Sheet</div>
                <div className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {layout.capacityPerPage}
                </div>
              </div>
            </div>

            {/* Warnings if any */}
            {layout.warnings.length > 0 && (
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 space-y-1">
                {layout.warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Output Actions */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handlePrint}
                className="w-full btn-primary py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-sky-500/20"
              >
                <Printer className="w-4 h-4" />
                <span>Print Labels ({layout.totalPages} {layout.totalPages === 1 ? 'Sheet' : 'Sheets'})</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="btn-secondary py-2 px-3 text-xs flex items-center justify-center gap-1.5 font-bold text-slate-800 dark:text-slate-200"
                >
                  <Download className="w-3.5 h-3.5 text-sky-500" />
                  <span>Download PDF</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="btn-secondary py-2 px-3 text-xs flex items-center justify-center gap-1.5 text-slate-700 dark:text-slate-300"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right WYSIWYG Sheet Preview (8 Columns) */}
        <div className="lg:col-span-8 space-y-3">
          {/* Sheet Viewer Controls */}
          <div className="bg-white dark:bg-[#0c1220] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            {/* Page Navigation */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={activePageIndex <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-bold font-mono px-2 py-1 rounded-lg bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-slate-800">
                Sheet Page {activePageIndex} of {totalPages}
              </span>

              <button
                type="button"
                disabled={activePageIndex >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Sheet Dimensions badge */}
            <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {layout.paperWidthMm}mm × {layout.paperHeightMm}mm ({activePageData?.labels.length || 0} labels on this sheet)
            </div>

            {/* Zoom Slider */}
            <div className="flex items-center gap-2">
              <ZoomOut className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="range"
                min="40"
                max="120"
                value={zoomLevel}
                onChange={(e) => setZoomLevel(parseInt(e.target.value, 10))}
                className="w-24 accent-sky-500"
              />
              <span className="text-[10px] font-mono text-slate-500 w-8">{zoomLevel}%</span>
            </div>
          </div>

          {/* Printable Sheet Viewport Canvas */}
          <div className="p-6 bg-slate-200/80 dark:bg-[#040711] rounded-2xl border border-slate-300/80 dark:border-white/[0.05] overflow-auto flex items-center justify-center min-h-[560px]">
            {/* The Physical Sheet Card */}
            <div
              ref={printableSheetRef}
              style={{
                width: `${layout.paperWidthMm * 3.78 * (zoomLevel / 100)}px`,
                height: `${layout.paperHeightMm * 3.78 * (zoomLevel / 100)}px`,
                position: 'relative',
              }}
              className="bg-white shadow-2xl border border-slate-300 text-slate-900 select-none overflow-hidden print:shadow-none print:border-none"
            >
              {/* Labels Grid Placement */}
              {activePageData?.labels.map((slot) => {
                const item = slot.item || {};
                const scale = zoomLevel / 100;
                const leftPx = slot.xMm * 3.78 * scale;
                const topPx = slot.yMm * 3.78 * scale;
                const widthPx = slot.widthMm * 3.78 * scale;
                const heightPx = slot.heightMm * 3.78 * scale;

                return (
                  <div
                    key={slot.slotIndex}
                    style={{
                      left: `${leftPx}px`,
                      top: `${topPx}px`,
                      width: `${widthPx}px`,
                      height: `${heightPx}px`,
                    }}
                    className={`absolute p-1.5 flex flex-col justify-between text-left overflow-hidden bg-white ${
                      showCutGuides ? 'border border-dashed border-slate-300' : 'border border-slate-200'
                    }`}
                  >
                    {/* Compact Label Content */}
                    <div className="leading-tight overflow-hidden">
                      <div className="text-[9px] font-bold text-slate-900 truncate">
                        {item.name || item.productName || 'Product Label'}
                      </div>
                      <div className="text-[8px] font-mono text-slate-500 truncate">
                        {item.sku || 'SKU'}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[8px] font-mono font-bold pt-0.5 border-t border-slate-100">
                      <span>MRP: {formatIndianCurrency(item.mrp || 0)}</span>
                      {item.sellingPrice && (
                        <span className="text-emerald-700">₹{item.sellingPrice}</span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Delineate Empty Slots on Last Page */}
              {activePageData?.emptySlots > 0 && (
                <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-slate-100 text-[10px] font-mono text-slate-400 border border-slate-200">
                  {activePageData.emptySlots} Unused Slots on Final Sheet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Print Calibration Guide Modal (Module 4.A) */}
      {isCalibrationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#0c1220] w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-sky-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Printer Calibration & Alignment Guide
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCalibrationOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>Important Browser Print Setting</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  In your browser print dialog, always set <strong>Scale: 100% (or "Actual Size")</strong> and <strong>Margins: None (or "Default")</strong>. Setting "Fit to Printable Area" will shrink the barcodes and cause alignment shift across die-cut stickers.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white">Recommended Checklist:</h4>
                <ul className="list-disc pl-4 space-y-1 text-[11px]">
                  <li>
                    <strong>Test Sheet First:</strong> Print page 1 onto plain A4 paper and hold it up against your sticker sheet to verify grid alignment before using expensive sticker paper.
                  </li>
                  <li>
                    <strong>Hardware Dead-Zones:</strong> Desktop inkjet and laser printers typically cannot print within 3–4mm of the paper edge. Ensure margins are configured accordingly.
                  </li>
                  <li>
                    <strong>Thermal Printers:</strong> Select "Continuous Roll (1x1)" and configure width/height matching your 4"×6" or 50×25mm thermal roll.
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/[0.08]">
              <button
                type="button"
                onClick={() => setIsCalibrationOpen(false)}
                className="btn-primary py-1.5 px-4 text-xs font-bold"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
